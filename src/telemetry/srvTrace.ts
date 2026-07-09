import { randomBytes } from 'node:crypto';

/** Prefix Janus uses for the `x-srv-trace` correlation header value. */
const SRV_TRACE_PREFIX = 'v=1;t=';

/** Random bytes in the trace token — matches Janus `HEX_LEN = 8` (→ 16 hex). */
const SRV_TRACE_BYTES = 8;

/**
 * Generates a Postman-internal correlation id in the exact shape Janus's
 * `set-correlation-headers` plugin emits: `v=1;t=<16 lowercase hex chars>`.
 * Sent as the outbound `x-srv-trace` header so the value lands verbatim in
 * `serverevents_postmanapi.trace_id`, enabling row-level correlation with the
 * MCP telemetry `tool_call` event that carries the same value in `srv_trace_id`.
 */
export function generateSrvTrace(): string {
  return SRV_TRACE_PREFIX + randomBytes(SRV_TRACE_BYTES).toString('hex');
}
