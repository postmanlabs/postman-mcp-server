import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getWorkspaceUpdates';
export const title = 'Get all workspace updates';
export const description = "Lists a workspace's updates — the announcement posts that keep workspace watchers\ninformed about new features, bug fixes, breaking changes, and other news. Filter by\n\\`category\\` and page with \\`cursor\\`.\nThese are authored announcements, not a record of what changed in the workspace. For\nthat use getWorkspaceActivityFeed, and for the workspace's own settings use\ngetWorkspace.\n";
export const parameters = z.object({
    workspaceId: z.string().describe("The workspace's ID."),
    cursor: z
        .string()
        .describe('The pointer to the first record of the set of paginated results. To view the next response, use the `nextCursor` value for this parameter.')
        .optional(),
    category: z
        .string()
        .describe('A comma-separated list of categories to filter the results by. Accepts `improvement`, `bug_fix`, `new_feature`, `breaking_change`, `announcement`.')
        .optional(),
});
export const annotations = {
    title: 'Get all workspace updates',
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/workspaces/${encodeURIComponent(String(args.workspaceId))}/updates`;
        const query = new URLSearchParams();
        if (args.cursor !== undefined)
            query.set('cursor', String(args.cursor));
        if (args.category !== undefined)
            query.set('category', String(args.category));
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
