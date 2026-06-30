import { z } from 'zod';

// ---------------------------------------------------------------------------
// Error Enums
// ---------------------------------------------------------------------------

/**
 * Standardized error codes for telemetry events.
 * Maps error conditions to a fixed vocabulary for ClickHouse aggregation.
 */
export enum TelemetryErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  UPSTREAM_ERROR = 'UPSTREAM_ERROR',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Pipeline stage where the error occurred.
 * Values are lowercase to align with structured log conventions.
 */
export enum TelemetryErrorStage {
  VALIDATE = 'validate',
  AUTH = 'auth',
  UPSTREAM = 'upstream',
  TIMEOUT = 'timeout',
}

// ---------------------------------------------------------------------------
// Base Telemetry Event Schema
// ---------------------------------------------------------------------------

/**
 * Fields shared by every telemetry event.
 */
export const BaseTelemetryEventSchema = z.object({
  /** Discriminator for the event union */
  event_type: z.enum(['session_init', 'tool_call']),

  /** ISO-8601 timestamp of when the event was created */
  timestamp: z.string(),

  /** Persistent anonymous install identifier */
  install_id: z.string(),

  /** Ephemeral session identifier (one per server lifecycle) */
  session_id: z.string(),

  /** Trace identifier for correlating events within a request chain */
  trace_id: z.string(),

  /** Name of the MCP client (e.g. "cursor", "claude-desktop") */
  client_name: z.string(),

  /** Semver version of the MCP client */
  client_version: z.string(),

  /** MCP protocol version negotiated during initialization */
  protocol_version: z.string(),

  /** Transport layer used for the MCP connection */
  transport: z.enum(['stdio', 'http', 'sse']),

  /** Which toolset was loaded at startup */
  toolset: z.enum(['full', 'minimal', 'code', 'learn']),

  /** Semver version of this MCP server */
  server_version: z.string(),

  /** Postman API region the server is targeting */
  region: z.enum(['us', 'eu']),
});

export type BaseTelemetryEvent = z.infer<typeof BaseTelemetryEventSchema>;

// ---------------------------------------------------------------------------
// SessionInitEvent
// ---------------------------------------------------------------------------

/**
 * Emitted once when the MCP session is initialized.
 * Captures the negotiated capabilities and initial tool inventory.
 */
export const SessionInitEventSchema = BaseTelemetryEventSchema.extend({
  event_type: z.literal('session_init'),

  /** MCP capabilities advertised by the client */
  client_capabilities: z.array(z.string()),

  /** MCP capabilities advertised by the server */
  server_capabilities: z.array(z.string()),

  /** Content-hash of the sorted tool list (for detecting drift) */
  toolset_snapshot_id: z.string(),

  /** Number of tools exposed to the client at init */
  tool_list_count: z.number(),
});

export type SessionInitEvent = z.infer<typeof SessionInitEventSchema>;

// ---------------------------------------------------------------------------
// ToolCallEvent
// ---------------------------------------------------------------------------

/**
 * Emitted for every tools/call invocation.
 * Captures timing, shape, errors, and client-supplied context.
 */
export const ToolCallEventSchema = BaseTelemetryEventSchema.extend({
  event_type: z.literal('tool_call'),

  /** Name of the MCP tool that was called */
  tool_name: z.string(),

  /** Sorted list of top-level argument keys (no values, for privacy) */
  arguments_shape: z.array(z.string()),

  /** Byte size of the serialized arguments JSON */
  arguments_size_bytes: z.number(),

  /** Byte size of the serialized result JSON */
  result_size_bytes: z.number(),

  /** Whether the tool returned an isError result */
  result_is_error: z.boolean(),

  /** Wall-clock latency of the tool handler in milliseconds */
  latency_ms: z.number(),

  /** Whether the call was rate-limited by Postman API */
  rate_limited: z.boolean(),

  /** Whether the caller supplied pagination args (cursor/nextCursor/offset>0) */
  pagination_used: z.boolean(),

  /** Error constructor name or class (e.g. "McpError", "TypeError") */
  error_type: z.string(),

  /** Normalized error code from TelemetryErrorCode */
  error_code: z.string(),

  /** Pipeline stage where the error occurred */
  error_stage: z.string(),

  /** Upstream service that returned the error (e.g. "postman-api") */
  error_upstream: z.string(),

  /** How the request was authenticated (`api_key` for STDIO and HTTP+API key, `oauth_token` for HTTP+OAuth) */
  auth_method: z.enum(['api_key', 'oauth_token']),

  /** What triggered the tool call (e.g. "user", "auto") */
  trigger: z.string(),

  /** Client-supplied conversation or thread identifier */
  conversation_id: z.string(),

  /** Client-supplied task classification */
  task_type: z.string(),

  /** Client-supplied model name */
  model_name: z.string(),

  /** Raw `_meta` object as the client sent it, JSON-stringified. Empty string when no `_meta` was provided. */
  meta_raw: z.string(),
});

export type ToolCallEvent = z.infer<typeof ToolCallEventSchema>;

// ---------------------------------------------------------------------------
// Discriminated Union
// ---------------------------------------------------------------------------

/**
 * Union schema for all telemetry events.
 * Discriminated on `event_type` for efficient parsing.
 */
export const TelemetryEventSchema = z.discriminatedUnion('event_type', [
  SessionInitEventSchema,
  ToolCallEventSchema,
]);

export type TelemetryEvent = z.infer<typeof TelemetryEventSchema>;
