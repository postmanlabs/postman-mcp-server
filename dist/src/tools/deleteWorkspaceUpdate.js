import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'deleteWorkspaceUpdate';
export const title = 'Delete a workspace update';
export const description = 'Deletes a workspace update. This removes an announcement watchers may already have seen\nand cannot be undone.\nPrefer patchWorkspaceUpdate to correct a mistake — deleting leaves consumers with no\nrecord of a change they were told about. Only delete on an explicit instruction.\n';
export const parameters = z.object({
    workspaceId: z.string().describe("The workspace's ID."),
    updateId: z.number().int().describe("The workspace update's ID."),
});
export const annotations = {
    title: 'Delete a workspace update',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: true,
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
