import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getWorkspaceUpdate';
export const title = 'Get a workspace update';
export const description = "Gets one workspace update by ID. Use getWorkspaceUpdates to discover the ID.\nThis is an announcement post, not the workspace's settings — use getWorkspace for those.\n";
export const parameters = z.object({
    workspaceId: z.string().describe("The workspace's ID."),
    updateId: z.number().int().describe("The workspace update's ID."),
});
export const annotations = {
    title: 'Get a workspace update',
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/workspaces/${encodeURIComponent(String(args.workspaceId))}/updates/${encodeURIComponent(String(args.updateId))}`;
        const query = new URLSearchParams();
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
