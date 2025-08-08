import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'delete-pan-element-or-folder';
export const description = "Removes an element or delete a folder from your team's [Private API Network](https://learning.postman.com/docs/collaborating-in-postman/adding-private-network/).\n\n**Note:**\n\nRemoving an API, collection, or workspace element does not delete it. It only removes it from the Private API Network folder.\n";
export const parameters = z.object({
    elementId: z
        .string()
        .describe("The element's ID or UUID. For Postman Collections you must pass the collection's UID (`userId`-`collectionId`) value."),
    elementType: z.enum(['api', 'folder', 'collection', 'workspace']).describe('The element type.'),
});
export const annotations = {
    title: "Removes an element or delete a folder from your team's [Private API Network](https://learning.postman.com/docs/collaborating-in-postman/adding-private-network/).\n\n**Note:**\n\nRemoving an API, collection, or workspace element does not delete it. It only removes it from the Private API Network folder.\n",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
};
export async function handler(params, extra) {
    try {
        const endpoint = `/network/private/${params.elementType}/${params.elementId}`;
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
