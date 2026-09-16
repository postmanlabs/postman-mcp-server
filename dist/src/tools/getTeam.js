import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getTeam';
export const title = 'Get a team';
export const description = "Gets one Postman team by ID. Pass \\`include=members\\` to list everyone with access —\nmanagers, members, guests, and groups representing other teams — or \\`include=userRoles\\`\nfor the team's role assignments. Use getTeams when you need to discover the ID.\nMember entries carry IDs rather than names; resolve them with getTeamUsers and\ngetGroups.\n";
export const parameters = z.object({
    teamId: z.number().int().describe("The team's ID."),
    identifierType: z
        .string()
        .describe('Use SCIM user and group IDs instead of Postman user IDs.')
        .optional(),
    include: z
        .enum(['members', 'userRoles'])
        .describe("Include additional information in the request's response:\n- `members` — Include all users and groups, including groups that represent other teams or the entire organization, with access to the team's entities. This includes team managers, members, and persons invited to collaborate as guests.\n- `userRoles` — Include all the team's user roles in the response.\n")
        .optional(),
});
export const annotations = {
    title: 'Get a team',
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/teams/${encodeURIComponent(String(args.teamId))}`;
        const query = new URLSearchParams();
        if (args.include !== undefined)
            query.set('include', String(args.include));
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
