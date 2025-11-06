import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'deleteCollectionRequest';
export const description = 'Deletes a request in a collection.';
export const parameters = z.object({
    requestId: z.string().describe("The request's ID."),
    collectionId: z.string().describe("The collection's ID."),
});
export const annotations = {
    title: 'Deletes a request in a collection.',
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/collections/${args.collectionId}/requests/${args.requestId}`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const options = {
            headers: extra.headers,
        };
        const result = await extra.client.delete(url, options);
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
