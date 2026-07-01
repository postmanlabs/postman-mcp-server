const TELEMETRY_TABLE = 'mcp_telemetry_events';
const GATEWAY_BASE_URL = {
    us: 'https://gateway.postman.com',
    eu: 'https://gateway.eu.postman.com',
};
const TELEMETRY_INGEST_PATH = '/api/v1/insert';
const GATEWAY_BASE_URL_OVERRIDE_ENV = 'POSTMAN_GATEWAY_BASE_URL';
const MAX_BUFFER_COUNT = 100;
const MAX_BUFFER_BYTES = 1_048_576;
const IDLE_FLUSH_MS = 2_000;
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_ATTEMPTS = 3;
const RETRYABLE_STATUS_CODES = new Set([502, 503]);
export class TelemetryClient {
    apiKey;
    table;
    buffer = [];
    bufferSizeBytes = 0;
    idleTimer;
    isShutdown = false;
    constructor(options) {
        this.apiKey = options.apiKey;
        this.table = TELEMETRY_TABLE;
    }
    sessionInit(session, params) {
        const event = {
            ...this.buildBaseEvent(session, 'session_init'),
            client_capabilities: params.clientCapabilities,
            server_capabilities: params.serverCapabilities,
            toolset_snapshot_id: session.toolsetSnapshotId,
            tool_list_count: session.getToolListCount(),
        };
        this.enqueue(session, event);
    }
    toolCall(session, params) {
        const conversationId = params.meta?.conversation_id ?? '';
        const argsJson = JSON.stringify(params.args);
        const resultJson = JSON.stringify(params.result);
        const event = {
            ...this.buildBaseEvent(session, 'tool_call', conversationId || undefined),
            tool_name: params.toolName,
            arguments_shape: Object.keys(params.args).sort(),
            arguments_size_bytes: Buffer.byteLength(argsJson),
            result_size_bytes: Buffer.byteLength(resultJson),
            result_is_error: params.isError ?? params.result.isError ?? false,
            latency_ms: params.latencyMs,
            rate_limited: params.rateLimited ?? false,
            pagination_used: params.paginationUsed,
            error_type: params.errorType ?? '',
            error_code: params.errorCode ?? '',
            error_stage: params.errorStage ?? '',
            error_upstream: params.errorUpstream ?? '',
            auth_method: params.authMethod,
            trigger: params.meta?.trigger ?? '',
            conversation_id: conversationId,
            task_type: params.meta?.task_type ?? '',
            model_name: params.meta?.model_name ?? '',
            meta_raw: params.metaRaw ?? '',
        };
        this.enqueue(session, event);
    }
    async flush() {
        if (this.buffer.length === 0) {
            return;
        }
        const events = this.buffer;
        this.buffer = [];
        this.bufferSizeBytes = 0;
        try {
            await this.send(events, 1);
        }
        catch {
        }
    }
    async shutdown() {
        this.isShutdown = true;
        this.clearIdleTimer();
        await this.flush();
    }
    buildBaseEvent(session, eventType, conversationId) {
        return {
            event_type: eventType,
            timestamp: new Date().toISOString(),
            install_id: session.installId,
            session_id: session.sessionId,
            trace_id: session.getTraceId(conversationId),
            client_name: session.clientName,
            client_version: session.clientVersion,
            protocol_version: session.protocolVersion,
            transport: session.transport,
            toolset: session.toolset,
            server_version: session.serverVersion,
            region: session.region,
        };
    }
    enqueue(_session, event) {
        if (this.isShutdown) {
            return;
        }
        const eventJson = JSON.stringify(event);
        const eventSize = Buffer.byteLength(eventJson);
        this.buffer.push(event);
        this.bufferSizeBytes += eventSize;
        this.resetIdleTimer();
        if (this.buffer.length >= MAX_BUFFER_COUNT || this.bufferSizeBytes >= MAX_BUFFER_BYTES) {
            void this.flush();
        }
    }
    async send(events, attempt) {
        const region = events[0]?.region ?? 'us';
        const baseUrl = process.env[GATEWAY_BASE_URL_OVERRIDE_ENV] ?? GATEWAY_BASE_URL[region];
        const ingestUrl = `${baseUrl}${TELEMETRY_INGEST_PATH}`;
        try {
            const response = await fetch(ingestUrl, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-api-key': this.apiKey,
                    'x-pstmn-req-service': 'galactus-service',
                },
                body: JSON.stringify({
                    table: this.table,
                    data: events,
                }),
                signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
            });
            if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < MAX_ATTEMPTS) {
                return this.send(events, attempt + 1);
            }
        }
        catch {
            if (attempt < MAX_ATTEMPTS) {
                return this.send(events, attempt + 1);
            }
        }
    }
    resetIdleTimer() {
        this.clearIdleTimer();
        this.idleTimer = setTimeout(() => {
            void this.flush();
        }, IDLE_FLUSH_MS);
    }
    clearIdleTimer() {
        if (this.idleTimer !== undefined) {
            clearTimeout(this.idleTimer);
            this.idleTimer = undefined;
        }
    }
}
