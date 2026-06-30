import { TelemetryClient } from './client.js';
import { NoopTelemetryClient } from './noop.js';
export function createTelemetryClient(options) {
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
export { detectPaginationUsed } from './pagination.js';
export { parseTelemetryFlag } from './flag.js';
