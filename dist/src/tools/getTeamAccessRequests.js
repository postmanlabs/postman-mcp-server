import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getTeamAccessRequests';
export const title = "Get a team's access requests";
export const description = "Lists a team's pending access requests — people asking to join, to be promoted, or to\nadd members. Use this to report on what is waiting for a decision, and to get the\nrequest IDs that approveDenyAccessRequest needs.\nReading requests is safe; acting on them is not. Do not chain straight into\napproveDenyAccessRequest without an explicit decision from an operator.\n";
export const parameters = z.object({
    teamId: z.number().int().describe("The team's ID."),
    identifierType: z
        .string()
        .describe('Use SCIM user and group IDs instead of Postman user IDs.')
        .optional(),
    cursor: z
        .string()
        .describe('The pointer to the first record of the set of paginated results. To view the next response, use the `nextCursor` value for this parameter.')
        .optional(),
    limit: z
        .number()
        .int()
        .describe('The maximum number of rows to return in the response.')
        .default(50),
});
export const annotations = {
    title: "Get a team's access requests",
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/teams/${encodeURIComponent(String(args.teamId))}/access-requests`;
        const query = new URLSearchParams();
        if (args.cursor !== undefined)
            query.set('cursor', String(args.cursor));
        if (args.limit !== undefined)
            query.set('limit', String(args.limit));
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
