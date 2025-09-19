import { z } from 'zod';
import { McpError, ErrorCode, } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'getMock';
export const description = 'Gets information about a mock server.\n- Resource: Mock server entity. Response includes the associated \\`collection\\` UID and \\`mockUrl\\`.\n- Use the \\`collection\\` UID to navigate back to the source collection.\n';
export const parameters = z.object({ mockId: z.string().describe("The mock's ID.") });
export const annotations = {
    title: 'Gets information about a mock server.\n- Resource: Mock server entity. Response includes the associated \\`collection\\` UID and \\`mockUrl\\`.\n- Use the \\`collection\\` UID to navigate back to the source collection.\n',
    readOnlyHint: true,
    destructiveHint: false,
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
        const result = await extra.client.get(url, options);
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
