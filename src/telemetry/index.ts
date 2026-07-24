import { TelemetryClient, type TelemetryClientOptions, type ToolCallParams } from './client.js';
import { NoopTelemetryClient } from './noop.js';
import type { TelemetrySession } from './session.js';

export type { ToolCallParams } from './client.js';

/**
 * Telemetry client surface. Callers must supply the TelemetrySession for the
 * MCP session whose event they are recording — the client itself is session-
 * agnostic and shared across all sessions on a pod.
 */
export interface ITelemetryClient {
  sessionInit(
    session: TelemetrySession,
    params: { clientCapabilities: string[]; serverCapabilities: string[] }
  ): void;
  toolCall(session: TelemetrySession, params: ToolCallParams): void;
  flush(): Promise<void>;
  shutdown(): Promise<void>;
}

export interface CreateTelemetryClientOptions extends TelemetryClientOptions {
  telemetryEnabled: boolean;
}

export function createTelemetryClient(options: CreateTelemetryClientOptions): ITelemetryClient {
  if (!options.telemetryEnabled || !options.apiKey) {
    return new NoopTelemetryClient();
  }

  return new TelemetryClient({
    apiKey: options.apiKey,
  });
}

export { TelemetryClient } from './client.js';
export { NoopTelemetryClient } from './noop.js';
export { TelemetrySession } from './session.js';
export type { SerializedTelemetrySession, TelemetrySessionOptions } from './session.js';
export { detectPaginationUsed } from './pagination.js';
export { parseTelemetryFlag } from './flag.js';
