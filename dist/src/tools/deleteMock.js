import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'deleteMock';
export const description = 'Deletes a mock server.';
export const parameters = z.object({ mockId: z.string().describe("The mock's ID.") });
export const annotations = {
    title: 'Deletes a mock server.',
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
};
export async function handler(params, extra) {
    try {
        const endpoint = `/mocks/${params.mockId}`;
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
