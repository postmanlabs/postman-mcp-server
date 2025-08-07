import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';
export const method = 'get-spec-file';
export const description = "Gets the contents of an API specification's file.";
export const parameters = z.object({
    specId: z.string().describe("The spec's ID."),
    filePath: z.string().describe('The path to the file.'),
});
export const annotations = {
    title: "Gets the contents of an API specification's file.",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(params, extra) {
    try {
        const endpoint = `/specs/${params.specId}/files/${params.filePath}`;
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
