import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getAnalyticsMetadata';
export const description = 'Returns a catalog of analytics resources and their corresponding metrics for use with the GET /analytics endpoint. These metrics provide insights on API usage, success, workspace, and team trends in Postman.';
export const parameters = z.object({
    include: z
        .string()
        .describe('A comma-separated list of the additional information to include in the response. Accepts the `parameters` and `response` values.\n\nWhen you pass this query parameter and its values, the response provides detailed information, including parameters and response schemas for the given metrics.\n')
        .optional(),
    resources: z
        .string()
        .describe('A comma-separated list of resource types to filter the metrics by. Accepts the `user`, `workspace`, `team`, and `ai` values.')
        .optional(),
    metrics: z
        .enum([
        'active_users',
        'workspace_active_users',
        'elements_in_workspace',
        'active_workspaces',
        'api_calls',
        'active_collections',
        'response_status',
        'pending_invites',
        'needs_attention',
        'success_rate',
        'user_requests',
        'user_api_journey',
        'workspace_distribution',
        'internal_workspace_distribution',
        'license_consumption',
        'members',
        'last_autoflex_cycle',
        'partner_engagement_funnel',
        'collection_error_aggregate',
        'agent_mode_users',
        'new_vs_returning_users',
        'agent_mode_sessions',
        'messages_sent',
        'credit_usage',
        'credit_usage_by_model',
        'usage_leaderboard',
        'peak_activity',
        'activity_distribution',
        'top_agent_models_by_usage',
    ])
        .describe("A comma-separated list of metrics values to use to filter the response.\n\nIf you don't pass this query parameter, then the response returns all metadata for all available metrics.\n")
        .optional(),
});
export const annotations = {
    title: 'Returns a catalog of analytics resources and their corresponding metrics for use with the GET /analytics endpoint. These metrics provide insights on API usage, success, workspace, and team trends in Postman.',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/analytics-metadata`;
        const query = new URLSearchParams();
        if (args.include !== undefined)
            query.set('include', String(args.include));
        if (args.resources !== undefined)
            query.set('resources', String(args.resources));
        if (args.metrics !== undefined)
            query.set('metrics', String(args.metrics));
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
