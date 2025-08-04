import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';
export const method = 'get-environments';
export const description = 'Gets information about all of your [environments](https://learning.postman.com/docs/sending-requests/managing-environments/).';
export const parameters = z.object({
    workspace: z.string().describe("The workspace's ID.").optional(),
});
export const annotations = {
    title: 'Gets information about all of your [environments](https://learning.postman.com/docs/sending-requests/managing-environments/).',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(params, extra) {
    try {
        const endpoint = `/environments`;
        const query = new URLSearchParams();
        if (params.workspace !== undefined)
            query.set('workspace', String(params.workspace));
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
