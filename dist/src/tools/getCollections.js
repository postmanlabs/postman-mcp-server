import { z } from 'zod';
import { McpError, ErrorCode, } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'getCollections';
export const description = 'The workspace ID query is required for this endpoint. If not provided, the LLM should ask the user to provide it.';
export const parameters = z.object({
    workspace: z.string().describe("The workspace's ID."),
    name: z.string().describe('Filter results by collections that match the given name.').optional(),
    limit: z
        .number()
        .int()
        .describe('The maximum number of rows to return in the response.')
        .optional(),
    offset: z
        .number()
        .int()
        .describe('The zero-based offset of the first item to return.')
        .optional(),
});
export const annotations = {
    title: 'The workspace ID query is required for this endpoint. If not provided, the LLM should ask the user to provide it.',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/collections`;
        const query = new URLSearchParams();
        if (args.workspace !== undefined)
            query.set('workspace', String(args.workspace));
        if (args.name !== undefined)
            query.set('name', String(args.name));
        if (args.limit !== undefined)
            query.set('limit', String(args.limit));
        if (args.offset !== undefined)
            query.set('offset', String(args.offset));
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
