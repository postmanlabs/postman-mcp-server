import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getCollectionRoles';
export const title = "Get a collection's roles";
export const description = 'Gets who can view or edit a collection, as the IDs of the users, groups, and teams\nholding each role. Use this to audit access before changing it. The response returns\nnumeric IDs rather than names — resolve user IDs with getTeamUsers, group IDs with\ngetGroups, and team IDs with getTeams or getTeam when you need to report on them.\nDo not use this tool to read workspace-level access; a collection can be reachable\nthrough its workspace without appearing here.\n';
export const parameters = z.object({ collectionId: z.string().describe("The collection's ID.") });
export const annotations = {
    title: "Get a collection's roles",
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/collections/${encodeURIComponent(String(args.collectionId))}/roles`;
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
