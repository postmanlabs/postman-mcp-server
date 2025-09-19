import { z } from 'zod';
import { McpError, ErrorCode, } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'getAsyncSpecTaskStatus';
export const description = 'Gets the status of an asynchronous API specification creation task.';
export const parameters = z.object({
    elementType: z.enum(['collections', 'specs']).describe('The element to filter results by.'),
    elementId: z.union([z.string(), z.string()]).describe("The element's ID."),
    taskId: z.string().describe("The task's ID."),
});
export const annotations = {
    title: 'Gets the status of an asynchronous API specification creation task.',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/${args.elementType}/${args.elementId}/tasks/${args.taskId}`;
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
