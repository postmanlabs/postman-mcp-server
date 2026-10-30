import { McpError, ErrorCode, IsomorphicHeaders } from '@modelcontextprotocol/sdk/types.js';

export { McpError };

export interface ServerContext {
  serverType: 'full' | 'minimal' | 'code' | 'learn' | 'contextGraph';
  availableTools: string[];
}

export function asMcpError(error: unknown): McpError {
  const cause = (error as any)?.cause ?? String(error);
  return new McpError(ErrorCode.InternalError, cause);
}

const DOT_SEGMENTS: ReadonlySet<string> = new Set(['.', '..']);

/**
 * Encodes a value for use as one URL path segment.
 *
 * `encodeURIComponent` leaves `.` and `..` untouched, and URL parsers resolve a
 * segment made only of them, so `/files/..` would silently address the parent
 * resource. Those two values are rejected rather than escaped, because an
 * escaped dot may be decoded again by an intermediary.
 *
 * @param value - The path parameter value.
 * @param name - Parameter name, used in the error message.
 * @returns The percent-encoded segment.
 * @throws McpError When the value is exactly `.` or `..`.
 */
export function encodePathSegment(value: unknown, name = 'path parameter'): string {
  const segment = String(value);
  if (DOT_SEGMENTS.has(segment)) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid value for ${name}: "${segment}" is not allowed as a path segment.`
    );
  }
  return encodeURIComponent(segment);
}

/**
 * The read surface {@link mergeCollectionRequestEvents} needs from an API client.
 *
 * Declared structurally rather than imported so this module keeps its only
 * dependency on the MCP SDK, which is what lets it be copied between packages
 * without rewriting import paths.
 */
export interface ReadOnlyApiClient {
  get<T = any>(endpoint: string, options?: { headers?: IsomorphicHeaders }): Promise<T>;
}

/** A single entry of a collection request's `events` array. */
export interface CollectionRequestEvent {
  listen?: string | null;
  [key: string]: unknown;
}

/**
 * Merges an incoming `events` array into a collection request's stored events,
 * keyed by `listen` type.
 *
 * The update-request endpoint patches top-level fields but replaces `events`
 * wholesale, so a caller that sends only a `test` event deletes the request's
 * `prerequest` script (and vice versa) with no error. This reads the request's
 * current events and re-appends the `listen` types the caller did not supply,
 * which turns the call into a per-`listen` patch.
 *
 * @param client - Client used to read the request's current state.
 * @param endpoint - Endpoint of the request being updated.
 * @param incoming - The `events` array supplied by the caller.
 * @param headers - Headers to forward on the read.
 * @returns The `events` array to send, with untouched `listen` types preserved.
 * @throws McpError When the current events cannot be read, so that the update is
 * not sent with an array that would drop the caller's other scripts.
 */
export async function mergeCollectionRequestEvents(
  client: ReadOnlyApiClient,
  endpoint: string,
  incoming: readonly CollectionRequestEvent[],
  headers?: IsomorphicHeaders
): Promise<readonly CollectionRequestEvent[]> {
  // An empty array is a no-op server side, so there is nothing to preserve.
  if (!Array.isArray(incoming) || incoming.length === 0) return incoming;

  const suppliedListenTypes = new Set(incoming.map((event) => event?.listen));

  let current: any;
  try {
    current = await client.get(endpoint, { headers });
  } catch (error) {
    const cause = (error as any)?.cause ?? String(error);
    throw new McpError(
      ErrorCode.InternalError,
      `Could not read the request's existing scripts, so the update was not sent — sending it would have deleted any event types absent from "events". Retry, or include every event you want to keep. Cause: ${cause}`
    );
  }

  const storedEvents = current?.data?.events;
  if (!Array.isArray(storedEvents)) return incoming;

  const preserved = storedEvents.filter(
    (event: CollectionRequestEvent) => !suppliedListenTypes.has(event?.listen)
  );
  return preserved.length > 0 ? [...incoming, ...preserved] : incoming;
}

/**
 * The annotation hints a tool module exports.
 *
 * Every field is required on purpose. Generated tools always emit all four hints
 * because the generator derives them, but hand-written tools set theirs by hand and
 * silently omitted `openWorldHint` for a long time — an absent hint falls back to the
 * protocol default rather than to anything considered. Requiring the full set means a
 * missing or misspelled hint is a compile error instead of a silent default.
 */
export interface ToolAnnotations {
  /** Human-readable tool name shown to users. */
  title: string;
  /** True when the tool only reads and never writes. */
  readOnlyHint: boolean;
  /**
   * True when the tool may destroy, revoke, or displace something: it removes data,
   * takes away access someone had, moves rather than copies, or runs code the caller
   * did not write. Clients gate confirmation prompts on this, so understating it is
   * the dangerous direction to be wrong in.
   */
  destructiveHint: boolean;
  /** True when repeating the call with the same arguments has no additional effect. */
  idempotentHint: boolean;
  /**
   * True when the tool reaches an open-ended set of external systems. Reads and
   * writes confined to Postman are closed; running a user-authored collection, whose
   * requests may point anywhere, is not.
   */
  openWorldHint: boolean;
}

/**
 * Declares a hand-written tool's annotations.
 *
 * Generated tools get their hints from the generator, which derives them from the
 * HTTP method and applies the `x-mcp-annotations` overlay override. Hand-written
 * tools have no spec operation, so the overlay cannot reach them; this is their
 * equivalent guardrail. Passing an incomplete object or misspelling a hint fails
 * type-checking, which runs as part of the build.
 */
export function defineToolAnnotations(annotations: ToolAnnotations): ToolAnnotations {
  return annotations;
}
