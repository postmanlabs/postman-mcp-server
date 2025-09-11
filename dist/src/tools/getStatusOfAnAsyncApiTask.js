import { z } from 'zod';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'getStatusOfAnAsyncApiTask';
export const description = 'Gets the status of an asynchronous task.';
export const parameters = z.object({
    apiId: z.string().describe("The API's ID."),
    taskId: z.string().describe("The task's ID."),
    Accept: z
        .literal('application/vnd.api.v10+json')
        .describe('The `application/vnd.api.v10+json` request header required to use the endpoint.'),
});
export const annotations = {
    title: 'Gets the status of an asynchronous task.',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(params, extra) {
    try {
        const endpoint = `/apis/${params.apiId}/tasks/${params.taskId}`;
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
