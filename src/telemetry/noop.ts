import type { ToolCallParams } from './client.js';
import type { TelemetrySession } from './session.js';

/**
 * No-op telemetry client with zero overhead.
 * Used when telemetry is disabled.
 */
export class NoopTelemetryClient {
  sessionInit(
    _session: TelemetrySession,
    _params: { clientCapabilities: string[]; serverCapabilities: string[] }
  ): void {}
  toolCall(_session: TelemetrySession, _params: ToolCallParams): void {}
  async flush(): Promise<void> {}
  async shutdown(): Promise<void> {}
}
