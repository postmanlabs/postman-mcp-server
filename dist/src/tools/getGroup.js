import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getGroup';
export const title = 'Get a group';
export const description = "Gets one Postman user group by ID. Use this when you already hold a group ID — from a\ncollection or workspace role assignment — and need that group's details; use getGroups\nwhen you need to list or search.\nThis is a Postman user group, not a SCIM group and not a team.\n";
export const parameters = z.object({ groupId: z.number().int().describe("The group's ID.") });
export const annotations = {
    title: 'Get a group',
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/groups/${encodeURIComponent(String(args.groupId))}`;
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
