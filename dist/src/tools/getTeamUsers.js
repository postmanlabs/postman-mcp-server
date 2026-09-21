import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getTeamUsers';
export const title = 'Get all team users';
export const description = "Lists the members of the authenticated user's Postman team. Use this to resolve the\nnumeric user IDs that appear in audit logs, collection roles, and workspace roles into\nnames an operator can act on. Narrow to one user group with the \\`groupId\\` query\nparameter, using an ID from getGroups.\nThis returns other people on the team. To find out who the current API key belongs to,\nuse getAuthenticatedUser instead.\n";
export const parameters = z.object({
    groupId: z
        .number()
        .int()
        .describe('Filter results by the given [group](https://learning.postman.com/docs/collaborating-in-postman/user-groups/) ID. To get group IDs, use the GET `/groups` endpoint.')
        .optional(),
});
export const annotations = {
    title: 'Get all team users',
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/users`;
        const query = new URLSearchParams();
        if (args.groupId !== undefined)
            query.set('groupId', String(args.groupId));
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
