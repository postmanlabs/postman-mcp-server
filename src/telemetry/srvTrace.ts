import { randomBytes } from 'node:crypto';

/** Prefix for the correlation token value. */
const SRV_TRACE_PREFIX = 'v=1;t=';

/** Number of random bytes in the correlation token (→ 16 hex chars). */
const SRV_TRACE_BYTES = 8;

/**
 * Generates a per-tool-call correlation id (`v=1;t=<16 lowercase hex chars>`)
 * sent as the outbound `x-srv-trace` request header and recorded on the
 * telemetry `tool_call` event, so a single tool call can be traced across the
 * requests it makes.
 */
export function generateSrvTrace(): string {
  return SRV_TRACE_PREFIX + randomBytes(SRV_TRACE_BYTES).toString('hex');
}
