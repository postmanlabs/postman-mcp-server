import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getEnvironmentForks';
export const title = "Get an environment's forks";
export const description = 'Lists the forks of an environment. Use this to find fork IDs before merging or pulling,\nor to see who has diverged from a shared environment. Page with \\`limit\\` and \\`cursor\\`,\nand order with \\`sort\\` and \\`direction\\`.\nThis returns forks of one environment, not every environment in a workspace — use\ngetEnvironments for that.\n';
export const parameters = z.object({
    environmentId: z.string().describe("The environment's unique ID."),
    cursor: z
        .string()
        .describe('The pointer to the first record of the set of paginated results. To view the next response, use the `nextCursor` value for this parameter.')
        .optional(),
    direction: z
        .enum(['asc', 'desc'])
        .describe('Sort results in ascending (`asc`) or descending (`desc`) order.')
        .optional(),
    limit: z
        .number()
        .int()
        .describe('The maximum number of rows to return in the response.')
        .default(10),
    sort: z
        .literal('createdAt')
        .describe('Sort the results by the date and time of creation.')
        .optional(),
});
export const annotations = {
    title: "Get an environment's forks",
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/environments/${encodeURIComponent(String(args.environmentId))}/forks`;
        const query = new URLSearchParams();
        if (args.cursor !== undefined)
            query.set('cursor', String(args.cursor));
        if (args.direction !== undefined)
            query.set('direction', String(args.direction));
        if (args.limit !== undefined)
            query.set('limit', String(args.limit));
        if (args.sort !== undefined)
            query.set('sort', String(args.sort));
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
