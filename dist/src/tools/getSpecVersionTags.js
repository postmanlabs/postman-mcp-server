import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getSpecVersionTags';
export const title = "Get a specification's version tags";
export const description = "Lists a specification's version tags — the point-in-time snapshots used to track how a\nspecification changed over time. Use this to discover tag IDs and names, or to see\nwhether the current state of a specification has been tagged yet. Page with \\`limit\\` and\n\\`cursor\\`.\nDo not use this tool to read a tag's contents; use getSpecVersionTag with a tag ID from\nthis response instead.\n";
export const parameters = z.object({
    specId: z.string().describe("The spec's ID."),
    cursor: z
        .string()
        .describe('The pointer to the first record of the set of paginated results. To view the next response, use the `nextCursor` value for this parameter.')
        .optional(),
    limit: z
        .number()
        .int()
        .describe('The maximum number of rows to return in the response.')
        .default(10),
});
export const annotations = {
    title: "Get a specification's version tags",
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/specs/${encodeURIComponent(String(args.specId))}/version-tags`;
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
