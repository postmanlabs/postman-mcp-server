export class NoopTelemetryClient {
    sessionInit(_session, _params) { }
    toolCall(_session, _params) { }
    async flush() { }
    async shutdown() { }
}
