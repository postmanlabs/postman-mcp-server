import { z } from 'zod';
import { McpError, ErrorCode, } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'deleteMock';
export const description = 'Deletes a mock server.\n- Resource: Mock server entity. This is destructive.\n- Ensure you are targeting the correct mock ID.\n';
export const parameters = z.object({ mockId: z.string().describe("The mock's ID.") });
export const annotations = {
    title: 'Deletes a mock server.\n- Resource: Mock server entity. This is destructive.\n- Ensure you are targeting the correct mock ID.\n',
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/mocks/${args.mockId}`;
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
