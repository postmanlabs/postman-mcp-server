import { ExecutionResult, TelemetryPayload } from './models.js';
import { buildTelemetryPayload } from './telemetry.js';

export function parseToTelemetry(
  result: ExecutionResult,
  collectionId: string,
  collectionName: string
): TelemetryPayload {
  return buildTelemetryPayload(collectionId, collectionName, result);
}

export function formatUserOutput(result: ExecutionResult): string {
  const durationSec = (result.durationMs / 1000).toFixed(2);
  return `${result.output}\n⏱️  Duration: ${durationSec}s`;
}

