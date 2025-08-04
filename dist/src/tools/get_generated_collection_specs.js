import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';
export const method = 'get-generated-collection-specs';
export const description = 'Gets the API specification generated for the given collection.';
export const parameters = z.object({
    collectionUid: z.string().describe("The collection's unique ID."),
    elementType: z.literal('spec').describe('The `spec` value.'),
});
export const annotations = {
    title: 'Gets the API specification generated for the given collection.',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(params, extra) {
    try {
        const endpoint = `/collections/${params.collectionUid}/generations/${params.elementType}`;
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
        return {
            content: [{ type: 'text', text: `Failed: ${e.message}` }],
        };
    }
}
