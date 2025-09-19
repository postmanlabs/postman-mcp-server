import { z } from 'zod';
import { McpError, ErrorCode, } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'getAllSpecs';
export const description = 'Gets all API specifications in a workspace.';
export const parameters = z.object({
    workspaceId: z.string().describe("The workspace's ID."),
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
    title: 'Gets all API specifications in a workspace.',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/specs`;
        const query = new URLSearchParams();
        if (args.workspaceId !== undefined)
            query.set('workspaceId', String(args.workspaceId));
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
