import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getWorkspaceActivityFeed';
export const title = "Get a workspace's activity feed";
export const description = "Gets a workspace's activity feed — who added or removed collections, environments, and\nother elements, and who joined or left. Use this to explain how a workspace reached its\ncurrent state, or to build a changelog. Narrow with \\`userId\\` and \\`elementType\\`, and page\nwith \\`limit\\` and \\`cursor\\`.\nThis is workspace-level history. For a single collection's change history use the\ncollection's own tools, and for team-wide administrative events use getAuditLogs.\n";
export const parameters = z.object({
    workspaceId: z.string().describe("The workspace's ID."),
    userId: z.number().int().nullable().describe('Filter results by the given user ID.').optional(),
    elementType: z
        .enum(['collection', 'workspace', 'environment', 'mock', 'monitor'])
        .nullable()
        .describe('A comma-separated list of elements to filter the results by.')
        .optional(),
    limit: z
        .number()
        .int()
        .describe('The maximum number of rows to return in the response.')
        .default(15),
    cursor: z
        .string()
        .describe('The pointer to the first record of the set of paginated results. To view the next response, use the `nextCursor` value for this parameter.')
        .optional(),
});
export const annotations = {
    title: "Get a workspace's activity feed",
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/workspaces/${encodeURIComponent(String(args.workspaceId))}/activities`;
        const query = new URLSearchParams();
        if (args.userId !== undefined)
            query.set('userId', String(args.userId));
        if (args.elementType !== undefined)
            query.set('elementType', String(args.elementType));
        if (args.limit !== undefined)
            query.set('limit', String(args.limit));
        if (args.cursor !== undefined)
            query.set('cursor', String(args.cursor));
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
