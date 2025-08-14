import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'publishMock';
export const description = 'Publishes a mock server. Publishing a mock server sets its **Access Control** configuration setting to public.';
export const parameters = z.object({ mockId: z.string().describe("The mock's ID.") });
export const annotations = {
    title: 'Publishes a mock server. Publishing a mock server sets its **Access Control** configuration setting to public.',
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
};
export async function handler(params, extra) {
    try {
        const endpoint = `/mocks/${params.mockId}/publish`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const result = await fetchPostmanAPI(url, {
            method: 'POST',
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
