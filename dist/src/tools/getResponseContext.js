import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getResponseContext';
export const description = 'Returns a markdown-formatted summary of a saved response example within a collection request, including its status code, headers, body, and the original request details.';
export const parameters = z.object({
    collectionId: z.string().describe("The collection's ID."),
    requestId: z.string().describe("The parent request's ID."),
    responseId: z.string().describe("The response's ID."),
});
export const annotations = {
    title: 'Get Response Context',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const result = await extra.client.get(`/context/collections/${encodeURIComponent(String(args.collectionId))}/requests/${encodeURIComponent(String(args.requestId))}/responses/${encodeURIComponent(String(args.responseId))}`, { headers: extra.headers });
        return {
            content: [{ type: 'text', text: result }],
        };
    }
    catch (e) {
        if (e instanceof McpError) {
            throw e;
        }
        throw asMcpError(e);
    }
}
