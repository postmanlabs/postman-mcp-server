import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'get-source-collection-status';
export const description = 'Checks whether there is a change between the forked collection and its parent (source) collection.\n\nIf the value of the \\`isSourceAhead\\` property is \\`true\\` in the response, then there is a difference between the forked collection and its source collection.\n\n**Note:**\n\nThis endpoint may take a few minutes to return an updated \\`isSourceAhead\\` status.\n';
export const parameters = z.object({ collectionId: z.string().describe("The collection's ID.") });
export const annotations = {
    title: 'Checks whether there is a change between the forked collection and its parent (source) collection.\n\nIf the value of the \\`isSourceAhead\\` property is \\`true\\` in the response, then there is a difference between the forked collection and its source collection.\n\n**Note:**\n\nThis endpoint may take a few minutes to return an updated \\`isSourceAhead\\` status.\n',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(params, extra) {
    try {
        const endpoint = `/collections/${params.collectionId}/source-status`;
        const query = new URLSearchParams();
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
