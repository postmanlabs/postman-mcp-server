import { TelemetrySession } from './session.js';
import type {
  TelemetryEvent,
  SessionInitEvent,
  ToolCallEvent,
} from './types.js';

/**
 * Options for constructing a TelemetryClient.
 */
export interface TelemetryClientOptions {
  apiKey: string;
}

/**
 * Hardcoded ClickHouse table name. Customers cannot override this.
 */
const TELEMETRY_TABLE = 'mcp_telemetry_events';

/**
 * Telemetry ingestion gateway base URL per region.
 *
 * Region is now read from each TelemetrySession at emit time, so the client
 * carries a per-region URL pair rather than a single resolved URL.
 */
const GATEWAY_BASE_URL: Record<'us' | 'eu', string> = {
  us: 'https://gateway.postman.com',
  eu: 'https://gateway.eu.postman.com',
};

/**
 * Path on the gateway that accepts telemetry inserts.
 */
const TELEMETRY_INGEST_PATH = '/api/v1/insert';

/**
 * Undocumented internal-only override for the gateway base URL.
 * Used by QA/beta rigs to point at a non-prod gateway. Not exposed in
 * any zod env schema and not advertised to customers. Matches the same
 * env var name and semantics as postman-cli (a base URL, not the full
 * ingest URL — the path stays controlled by this client).
 */
const GATEWAY_BASE_URL_OVERRIDE_ENV = 'POSTMAN_GATEWAY_BASE_URL';

/**
 * How the inbound MCP request was authenticated.
 * - `api_key` — STDIO transport (always) or HTTP transport with a raw `PMAK-…` token
 * - `oauth_token` — HTTP transport with a Postman-issued OAuth bearer
 */
export type TelemetryAuthMethod = 'api_key' | 'oauth_token';

/**
 * Parameters for recording a tool call event.
 */
export interface ToolCallParams {
  toolName: string;
  args: Record<string, unknown>;
  result: { content?: Array<{ type: string; text?: string }>; isError?: boolean };
  latencyMs: number;
  isError: boolean;
  authMethod: TelemetryAuthMethod;
  paginationUsed: boolean;
  rateLimited?: boolean;
  errorType?: string;
  errorCode?: string;
  errorStage?: string;
  errorUpstream?: string;
  meta?: {
    trigger?: string;
    conversation_id?: string;
    task_type?: string;
    model_name?: string;
  };
  /** JSON-stringified raw `_meta` object as received from the client. */
  metaRaw?: string;
  /** Per-tool-call correlation id (`v=1;t=<hex>`) also sent as `x-srv-trace`. */
  srvTraceId?: string;
}

/** Maximum events in the buffer before auto-flush. */
const MAX_BUFFER_COUNT = 100;

/** Maximum buffer size in bytes before auto-flush. */
const MAX_BUFFER_BYTES = 1_048_576; // 1MB

/** Idle timer duration in milliseconds. */
const IDLE_FLUSH_MS = 2_000;

/** HTTP request timeout in milliseconds. */
const REQUEST_TIMEOUT_MS = 10_000;

/** Maximum number of send attempts (1 initial + 2 retries). */
const MAX_ATTEMPTS = 3;

/** HTTP status codes that trigger a retry. */
const RETRYABLE_STATUS_CODES = new Set([502, 503]);

/**
 * Buffers telemetry events and flushes them to the Galactus ingestion endpoint.
 *
 * Session identity is supplied per emitted event via the explicit
 * `TelemetrySession` argument to `sessionInit` / `toolCall`. The client itself
 * holds no session state, so concurrent MCP sessions on the same pod cannot
 * race on shared metadata.
 *
 * Buffering strategy:
 * - Auto-flush when the buffer reaches 100 events or 1MB.
 * - Auto-flush after 2 seconds of idle (no new enqueue).
 * - Fire-and-forget: flush errors are caught silently.
 */
export class TelemetryClient {
  private readonly apiKey: string;
  private readonly table: string;

  private buffer: TelemetryEvent[] = [];
  private bufferSizeBytes = 0;
  private idleTimer: ReturnType<typeof setTimeout> | undefined;
  private isShutdown = false;

  constructor(options: TelemetryClientOptions) {
    this.apiKey = options.apiKey;
    this.table = TELEMETRY_TABLE;
  }

  /**
   * Records a session initialization event for the given session.
   */
  sessionInit(
    session: TelemetrySession,
    params: {
      clientCapabilities: string[];
      serverCapabilities: string[];
    },
  ): void {
    const event: SessionInitEvent = {
      ...this.buildBaseEvent(session, 'session_init'),
      client_capabilities: params.clientCapabilities,
      server_capabilities: params.serverCapabilities,
      toolset_snapshot_id: session.toolsetSnapshotId,
      tool_list_count: session.getToolListCount(),
    };
    this.enqueue(session, event);
  }

  /**
   * Records a tool call event for the given session. Only argument keys are
   * captured (no values) for privacy. Result text is measured but never
   * included.
   */
  toolCall(session: TelemetrySession, params: ToolCallParams): void {
    const conversationId = params.meta?.conversation_id ?? '';
    const argsJson = JSON.stringify(params.args);
    const resultJson = JSON.stringify(params.result);

    const event: ToolCallEvent = {
      ...this.buildBaseEvent(session, 'tool_call', conversationId || undefined),
      tool_name: params.toolName,
      arguments_shape: Object.keys(params.args).sort(),
      arguments_size_bytes: Buffer.byteLength(argsJson),
      result_size_bytes: Buffer.byteLength(resultJson),
      result_is_error: params.isError ?? params.result.isError ?? false,
      latency_ms: params.latencyMs,
      rate_limited: params.rateLimited ?? false,
      pagination_used: params.paginationUsed,
      error_type: params.errorType ?? '',
      error_code: params.errorCode ?? '',
      error_stage: params.errorStage ?? '',
      error_upstream: params.errorUpstream ?? '',
      auth_method: params.authMethod,
      trigger: params.meta?.trigger ?? '',
      conversation_id: conversationId,
      task_type: params.meta?.task_type ?? '',
      model_name: params.meta?.model_name ?? '',
      meta_raw: params.metaRaw ?? '',
      srv_trace_id: params.srvTraceId ?? '',
    };
    this.enqueue(session, event);
  }

  /**
   * Drains the buffer immediately, sending all queued events to Galactus.
   */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) {
      return;
    }

    const events = this.buffer;
    this.buffer = [];
    this.bufferSizeBytes = 0;

    try {
      await this.send(events, 1);
    } catch {
      // Fire-and-forget: silently swallow errors
    }
  }

  /**
   * Shuts down the client. Flushes remaining events and prevents
   * further event enqueuing.
   */
  async shutdown(): Promise<void> {
    this.isShutdown = true;
    this.clearIdleTimer();
    await this.flush();
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Builds the base fields shared by every telemetry event from a session.
   */
  private buildBaseEvent<T extends 'session_init' | 'tool_call'>(
    session: TelemetrySession,
    eventType: T,
    conversationId?: string,
  ): {
    event_type: T;
    timestamp: string;
    install_id: string;
    session_id: string;
    trace_id: string;
    client_name: string;
    client_version: string;
    protocol_version: string;
    transport: 'stdio' | 'http' | 'sse';
    toolset: 'full' | 'minimal' | 'code' | 'learn';
    server_version: string;
    region: 'us' | 'eu';
  } {
    return {
      event_type: eventType,
      timestamp: new Date().toISOString(),
      install_id: session.installId,
      session_id: session.sessionId,
      trace_id: session.getTraceId(conversationId),
      client_name: session.clientName,
      client_version: session.clientVersion,
      protocol_version: session.protocolVersion,
      transport: session.transport,
      toolset: session.toolset,
      server_version: session.serverVersion,
      region: session.region,
    };
  }

  /**
   * Adds an event to the buffer, resets the idle timer, and triggers
   * an auto-flush if thresholds are exceeded.
   *
   * Region is taken from the supplied session so the right gateway is hit
   * even if multiple sessions on the same client target different regions
   * (unusual but possible in mixed deploys).
   */
  private enqueue(_session: TelemetrySession, event: TelemetryEvent): void {
    if (this.isShutdown) {
      return;
    }

    const eventJson = JSON.stringify(event);
    const eventSize = Buffer.byteLength(eventJson);

    this.buffer.push(event);
    this.bufferSizeBytes += eventSize;

    // Reset idle timer
    this.resetIdleTimer();

    // Auto-flush if thresholds exceeded
    if (
      this.buffer.length >= MAX_BUFFER_COUNT ||
      this.bufferSizeBytes >= MAX_BUFFER_BYTES
    ) {
      // Fire-and-forget flush
      void this.flush();
    }
  }

  /**
   * Sends events to the Galactus ingestion endpoint with retry logic.
   * Retries on HTTP 502, 503, or network errors (up to MAX_ATTEMPTS total).
   *
   * The ingest URL is resolved from the FIRST event's region. All events in
   * a single flush batch are assumed to share a region (true in practice —
   * a single pod targets a single region).
   */
  private async send(
    events: TelemetryEvent[],
    attempt: number,
  ): Promise<void> {
    const region = events[0]?.region ?? 'us';
    const baseUrl =
      process.env[GATEWAY_BASE_URL_OVERRIDE_ENV] ?? GATEWAY_BASE_URL[region];
    const ingestUrl = `${baseUrl}${TELEMETRY_INGEST_PATH}`;

    try {
      const response = await fetch(ingestUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': this.apiKey,
          'x-pstmn-req-service': 'galactus-service',
        },
        body: JSON.stringify({
          table: this.table,
          data: events,
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      // Retry on retryable status codes
      if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < MAX_ATTEMPTS) {
        return this.send(events, attempt + 1);
      }
    } catch {
      // Network error — retry if attempts remain
      if (attempt < MAX_ATTEMPTS) {
        return this.send(events, attempt + 1);
      }
    }
  }

  /**
   * Resets the 2-second idle flush timer.
   */
  private resetIdleTimer(): void {
    this.clearIdleTimer();
    this.idleTimer = setTimeout(() => {
      void this.flush();
    }, IDLE_FLUSH_MS);
  }

  /**
   * Clears the idle timer if active.
   */
  private clearIdleTimer(): void {
    if (this.idleTimer !== undefined) {
      clearTimeout(this.idleTimer);
      this.idleTimer = undefined;
    }
  }
}
