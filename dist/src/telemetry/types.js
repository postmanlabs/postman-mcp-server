import { z } from 'zod';
export var TelemetryErrorCode;
(function (TelemetryErrorCode) {
    TelemetryErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    TelemetryErrorCode["AUTH_ERROR"] = "AUTH_ERROR";
    TelemetryErrorCode["UPSTREAM_ERROR"] = "UPSTREAM_ERROR";
    TelemetryErrorCode["TIMEOUT"] = "TIMEOUT";
    TelemetryErrorCode["RATE_LIMITED"] = "RATE_LIMITED";
    TelemetryErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    TelemetryErrorCode["UNKNOWN"] = "UNKNOWN";
})(TelemetryErrorCode || (TelemetryErrorCode = {}));
export var TelemetryErrorStage;
(function (TelemetryErrorStage) {
    TelemetryErrorStage["VALIDATE"] = "validate";
    TelemetryErrorStage["AUTH"] = "auth";
    TelemetryErrorStage["UPSTREAM"] = "upstream";
    TelemetryErrorStage["TIMEOUT"] = "timeout";
})(TelemetryErrorStage || (TelemetryErrorStage = {}));
export const BaseTelemetryEventSchema = z.object({
    event_type: z.enum(['session_init', 'tool_call']),
    timestamp: z.string(),
    install_id: z.string(),
    session_id: z.string(),
    trace_id: z.string(),
    client_name: z.string(),
    client_version: z.string(),
    protocol_version: z.string(),
    transport: z.enum(['stdio', 'http', 'sse']),
    toolset: z.enum(['full', 'minimal', 'code', 'learn']),
    server_version: z.string(),
    region: z.enum(['us', 'eu']),
});
export const SessionInitEventSchema = BaseTelemetryEventSchema.extend({
    event_type: z.literal('session_init'),
    client_capabilities: z.array(z.string()),
    server_capabilities: z.array(z.string()),
    toolset_snapshot_id: z.string(),
    tool_list_count: z.number(),
});
export const ToolCallEventSchema = BaseTelemetryEventSchema.extend({
    event_type: z.literal('tool_call'),
    tool_name: z.string(),
    arguments_shape: z.array(z.string()),
    arguments_size_bytes: z.number(),
    result_size_bytes: z.number(),
    result_is_error: z.boolean(),
    latency_ms: z.number(),
    rate_limited: z.boolean(),
    pagination_used: z.boolean(),
    error_type: z.string(),
    error_code: z.string(),
    error_stage: z.string(),
    error_upstream: z.string(),
    auth_method: z.enum(['api_key', 'oauth_token']),
    trigger: z.string(),
    conversation_id: z.string(),
    task_type: z.string(),
    model_name: z.string(),
    meta_raw: z.string(),
    srv_trace_id: z.string(),
});
export const TelemetryEventSchema = z.discriminatedUnion('event_type', [
    SessionInitEventSchema,
    ToolCallEventSchema,
]);
