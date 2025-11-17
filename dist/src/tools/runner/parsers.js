import { buildTelemetryPayload } from './telemetry.js';
export function parseToTelemetry(result, collectionId, collectionName) {
    return buildTelemetryPayload(collectionId, collectionName, result);
}
export function formatUserOutput(result) {
    const durationSec = (result.durationMs / 1000).toFixed(2);
    return `${result.output}\n⏱️  Duration: ${durationSec}s`;
}
