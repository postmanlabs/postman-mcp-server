import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getAllGovernanceGroups';
export const title = 'Get all governance groups';
export const description = "Lists the team's governance groups. A governance group is a set of workspaces that\nshare the same assigned rulesets. Postman-managed groups (\\`type: system\\`), such as the\ndefault group covering all workspaces, are read-only. Page with \\`limit\\` (max 100) and\n\\`cursor\\` from \\`meta.nextCursor\\`.\n";
export const parameters = z.object({
    cursor: z
        .string()
        .describe('The pointer to the first record of the set of paginated results. To view the next response, use the `nextCursor` value for this parameter.')
        .optional(),
    limit: z
        .number()
        .int()
        .gte(1)
        .lte(100)
        .describe('The maximum number of results to return per page.')
        .default(10),
});
export const annotations = {
    title: 'Get all governance groups',
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/governance-groups`;
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
