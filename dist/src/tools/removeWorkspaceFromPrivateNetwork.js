import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'removeWorkspaceFromPrivateNetwork';
export const description = "Removes a workspace from your team's Private API Network. This does not delete the workspace itself — it only removes it from the Private API Network folder.\n\nWARNING: This tool is for Private API Network management, not for general workspace operations. For workspace management use: getWorkspaces, getWorkspace, createWorkspace, updateWorkspace, deleteWorkspace.\n";
export const parameters = z.object({ workspaceId: z.string().describe("The workspace's ID.") });
export const annotations = {
    title: "Removes a workspace from your team's Private API Network. This does not delete the workspace itself — it only removes it from the Private API Network folder.",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/network/private/workspace/${args.workspaceId}`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const options = {
            headers: extra.headers,
        };
        const result = await extra.client.delete(url, options);
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
