import { z } from 'zod';
import { asMcpError, McpError, defineToolAnnotations, } from './utils/toolHelpers.js';
export const method = 'getWorkspaceEnvironmentsContext';
export const title = 'Get workspace environments context';
export const description = 'Returns a markdown-formatted summary of all environments in a workspace, including their variables. Use this to understand the environment configuration available in a workspace.';
export const parameters = z.object({
    workspaceId: z.string().describe("The workspace's ID."),
});
export const annotations = defineToolAnnotations({
    title: 'Get workspace environments context',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
});
export async function handler(args, extra) {
    try {
        const endpoint = `/context/workspaces/${encodeURIComponent(String(args.workspaceId))}/environments`;
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
