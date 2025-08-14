import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'deleteApiCollectionComment';
export const description = "Deletes a comment from an API's collection. On success, this returns an HTTP \\`204 No Content\\` response.\n\n**Note:**\n\nDeleting the first comment of a thread deletes all the comments in the thread.\n";
export const parameters = z.object({
    apiId: z.string().describe("The API's ID."),
    collectionId: z.string().describe("The collection's unique ID."),
    commentId: z.number().int().describe("The comment's ID."),
});
export const annotations = {
    title: "Deletes a comment from an API's collection. On success, this returns an HTTP \\`204 No Content\\` response.\n\n**Note:**\n\nDeleting the first comment of a thread deletes all the comments in the thread.\n",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
};
export async function handler(params, extra) {
    try {
        const endpoint = `/apis/${params.apiId}/collections/${params.collectionId}/comments/${params.commentId}`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const result = await fetchPostmanAPI(url, {
            method: 'DELETE',
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
