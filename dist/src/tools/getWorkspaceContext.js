import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getWorkspaceContext';
export const description = 'Returns a markdown-formatted summary of a single workspace, including its collections and environments. Use this to understand what resources are available in a workspace before exploring specific collections or environments.';
export const parameters = z.object({
    workspaceId: z.string().describe("The workspace's ID."),
});
export const annotations = {
    title: 'Get Workspace Context',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/context/workspaces/${encodeURIComponent(String(args.workspaceId))}`;
        const result = await extra.client.get(endpoint, {
            headers: extra.headers,
        });
        return {
            content: [{ type: 'text', text: result }],
        };
    }
    catch (e) {
        if (e instanceof McpError) {
            throw e;
        }
        throw asMcpError(e);
    }
}
