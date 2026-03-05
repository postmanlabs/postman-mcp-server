import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getAnalyticsData';
export const description = 'Gets analytics data based on the specified resource, metrics, and given filters for team, internal, and public workspaces, as well as Partner Workspaces.\n\n**Note:**\n\nThis endpoint only accepts the following resource:metric query parameter combinations:\n- \\`user\\` — \\`workspace_active_users\\`, \\`active_users\\`\n- \\`workspace\\` — \\`elements_in_workspace\\`, \\`active_workspaces\\`, \\`api_calls\\`, \\`active_collections\\`, \\`response_status\\`, \\`pending_invites\\`, \\`needs_attention\\`, \\`success_rate\\`, \\`user_requests\\`, \\`collection_error_aggregate\\`\n- \\`team\\` — \\`user_api_journey\\`, \\`workspace_distribution\\`, \\`internal_workspace_distribution\\`, \\`license_consumption\\`, \\`partner_engagement_funnel\\`\n\nThe \\`view\\` query parameter only accepts the following values when called with the following resource:metric pairs:\n- \\`detailed\\` or \\`summary\\` — \\`user:active_users\\`, \\`workspace:active_workspaces\\`, \\`workspace:pending_invites\\`, \\`workspace:needs_attention\\`, \\`workspace:success_rate\\`, \\`team:partner_engagement_funnel\\`\n\\`summary\\` only — \\`workspace:elements_in_workspace\\`, \\`workspace:workspace_active_users\\`, \\`workspace:api_calls\\`, \\`workspace:response_status\\`, \\`team:user_api_journey\\`, \\`team:workspace_distribution\\`, \\`team:internal_workspace_distribution\\`, \\`team:license_consumption\\`\n- \\`detailed\\` only — \\`workspace:active_collections\\`, \\`workspace:user_requests\\`\n';
export const parameters = z.object({
    resource: z
        .enum(['user', 'team', 'workspace'])
        .describe('Returns metrics and insights for API usage, success, and workspace/team trends in Postman:\n\n- `user` — Data related to individual user activities and engagement within Postman workspaces.\n- `team` — Team-level analytics, license consumption, and organizational trends.\n- `workspace` — Workspace-level activities, elements, and collaboration patterns.\n'),
    metrics: z
        .string()
        .describe('Filters the response by only the given metrics. The metric must match the given `resource` value.\n\nFor a list of metrics and their related `resource` value, call the GET `/analytics-metadata` endpoint.\n'),
    view: z
        .enum(['detailed', 'summary'])
        .describe('The view type for the analytics data:\n  - `detailed` — Return extensive information.\n  - `summary` — Return aggregated information.\n')
        .optional(),
    workspaceType: z
        .string()
        .describe('A comma-separated list of `internal`, `public`, and `partner` workspace types to filter the results by.')
        .optional(),
    userId: z
        .string()
        .describe('A comma-separated list of user IDs to filter the results by. Only pass this parameter when calling the `user_requests` metric for the `workspace` resource.')
        .optional(),
    duration: z
        .enum(['last_30_days', 'last_180_days', 'last_month', 'last_6_months'])
        .describe('Filters the response by the given duration.')
        .optional(),
    requestId: z
        .string()
        .describe('A comma-separated list of unique request IDs (`userId`-`requestId`) to filter the response by. Only pass this parameter when using the `user_requests` metric.')
        .optional(),
    responseStatus: z
        .string()
        .describe('A comma-separated list of HTTP response status codes to filter the results by. Accepts values `100` through `600`. Only pass this parameter when using the `user_requests` metric.')
        .optional(),
    attentionType: z
        .string()
        .describe('A comma-separated list of issues types to filter the results by. Attention types provide details about issues users or partners are facing. Accepts the `high_non_200OK_rate_for_partner` and `no_success_on_tried_request` values. Only pass this parameter when using the `needs_attention` metric.')
        .optional(),
    limit: z
        .number()
        .int()
        .gte(1)
        .lte(10000)
        .describe('The maximum number of rows to return in the response.')
        .default(100),
    offset: z
        .number()
        .int()
        .gte(0)
        .lte(10000)
        .describe('The zero-based offset of the first item to return.')
        .default(0),
});
export const annotations = {
    title: 'Gets analytics data based on the specified resource, metrics, and given filters for team, internal, and public workspaces, as well as Partner Workspaces.',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/analytics`;
        const query = new URLSearchParams();
        if (args.resource !== undefined)
            query.set('resource', String(args.resource));
        if (args.metrics !== undefined)
            query.set('metrics', String(args.metrics));
        if (args.view !== undefined)
            query.set('view', String(args.view));
        if (args.workspaceType !== undefined)
            query.set('workspaceType', String(args.workspaceType));
        if (args.userId !== undefined)
            query.set('userId', String(args.userId));
        if (args.duration !== undefined)
            query.set('duration', String(args.duration));
        if (args.requestId !== undefined)
            query.set('requestId', String(args.requestId));
        if (args.responseStatus !== undefined)
            query.set('responseStatus', String(args.responseStatus));
        if (args.attentionType !== undefined)
            query.set('attentionType', String(args.attentionType));
        if (args.limit !== undefined)
            query.set('limit', String(args.limit));
        if (args.offset !== undefined)
            query.set('offset', String(args.offset));
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const options = {
            headers: extra.headers,
        };
        const result = await extra.client.get(url, options);
        return {
            content: [
                {
                    type: 'text',
                    text: `${typeof result === 'string' ? result : JSON.stringify(result, null, 2)}`,
                },
            ],
        };
    }
    catch (e) {
        if (e instanceof McpError) {
            throw e;
        }
        throw asMcpError(e);
    }
}
