import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';
export const method = 'delete-collection-request';
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
export async function handler(params, extra) {
    try {
        const endpoint = `/collections/${params.collectionId}/requests/${params.requestId}`;
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
        return {
            content: [{ type: 'text', text: `Failed: ${e.message}` }],
        };
    }
}
