import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'transferWorkspaceToTeam';
export const title = 'Transfer workspace to a team';
export const description = "Moves a workspace from one team to another, with \\`source\\` as the current team and\n\\`destination\\` as the new one. Only available on Enterprise plans with Postman\nOrganizations enabled.\nThis rewrites access as a side effect: anyone whose role exists in the source team but\nnot the destination loses it on transfer, so people can silently lose access to the\nworkspace's contents. Read getWorkspaceRoles first so you can say who is affected, and\nonly call this on an explicit instruction naming both teams.\nTo move a single collection or environment instead of the whole workspace, use\ntransferWorkspaceElement.\n";
export const parameters = z.object({
    workspaceId: z.string().describe("The workspace's ID."),
    destination: z.string().describe('The ID of the team to transfer the workspace to.'),
    source: z.string().describe('The ID of the team to transfer the workspace from.'),
});
export const annotations = {
    title: 'Transfer workspace to a team',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/workspaces/${encodeURIComponent(String(args.workspaceId))}/transfers`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.destination !== undefined)
            bodyPayload.destination = args.destination;
        if (args.source !== undefined)
            bodyPayload.source = args.source;
        const options = {
            body: JSON.stringify(bodyPayload),
            contentType: ContentType.Json,
            headers: extra.headers,
        };
        const result = await extra.client.patch(url, options);
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
