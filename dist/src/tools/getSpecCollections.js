import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'getSpecCollections';
export const description = "Gets all of an API specification's generated collections.";
export const parameters = z.object({
    specId: z.string().describe("The spec's ID."),
    elementType: z.literal('collection').describe('The `collection` element type.'),
    limit: z
        .number()
        .int()
        .describe('The maximum number of rows to return in the response.')
        .default(10),
    cursor: z
        .string()
        .describe('The pointer to the first record of the set of paginated results. To view the next response, use the `nextCursor` value for this parameter.')
        .optional(),
});
export const annotations = {
    title: "Gets all of an API specification's generated collections.",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(params, extra) {
    try {
        const endpoint = `/specs/${params.specId}/generations/${params.elementType}`;
        const query = new URLSearchParams();
        if (params.limit !== undefined)
            query.set('limit', String(params.limit));
        if (params.cursor !== undefined)
            query.set('cursor', String(params.cursor));
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const result = await fetchPostmanAPI(url, {
            method: 'GET',
            apiKey: extra.apiKey,
            headers: extra.headers,
        });
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
