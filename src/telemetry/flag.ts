/**
 * Interprets the `POSTMAN_MCP_TELEMETRY` environment variable.
 *
 * Telemetry is enabled only when the value is `true` (case-insensitive,
 * trimmed) — the value advertised in the public docs. Any other set value
 * disables it. When the variable is unset, returns `undefined` so the caller
 * can apply its transport-specific default (STDIO defaults off, HTTP defaults
 * on).
 *
 * @param raw - The raw env value (`process.env.POSTMAN_MCP_TELEMETRY`).
 * @returns `true`/`false` when the variable is set, or `undefined` when unset.
 */
export function parseTelemetryFlag(raw: string | undefined): boolean | undefined {
  if (raw == null) {
    return undefined;
  }
  return raw.trim().toLowerCase() === 'true';
}
