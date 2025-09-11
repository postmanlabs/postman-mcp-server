import { z } from 'zod';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'patchEnvironment';
export const description = 'Updates specific environment properties, such as its name and variables.\n\n**Note:**\n\n- You can only perform one type of operation at a time. For example, you cannot perform an \\`add\\` and \\`replace\\` operation in the same call.\n- The request body size cannot exceed the maximum allowed size of 30MB.\n- If you receive an HTTP \\`411 Length Required\\` error response, manually pass the \\`Content-Length\\` header and its value in the request header.\n- To add a description to an existing variable, use the \\`add\\` operation.\n';
export const parameters = z.object({ environmentId: z.string().describe("The environment's ID.") });
export const annotations = {
    title: 'Updates specific environment properties, such as its name and variables.\n\n**Note:**\n\n- You can only perform one type of operation at a time. For example, you cannot perform an \\`add\\` and \\`replace\\` operation in the same call.\n- The request body size cannot exceed the maximum allowed size of 30MB.\n- If you receive an HTTP \\`411 Length Required\\` error response, manually pass the \\`Content-Length\\` header and its value in the request header.\n- To add a description to an existing variable, use the \\`add\\` operation.\n',
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(params, extra) {
    try {
        const endpoint = `/environments/${params.environmentId}`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const options = {
            headers: extra.headers,
        };
        const result = await extra.client.patch(url, options);
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
