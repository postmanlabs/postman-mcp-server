import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getRequestContext';
export const description = 'Returns a markdown-formatted summary of a request within a collection, including its method, URL, headers, query parameters, path variables, body, authentication, and response example references.';
export const parameters = z.object({
    collectionId: z.string().describe("The collection's ID."),
    requestId: z.string().describe("The request's ID."),
});
export const annotations = {
    title: 'Get Request Context',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const result = await extra.client.get(`/context/collections/${encodeURIComponent(String(args.collectionId))}/requests/${encodeURIComponent(String(args.requestId))}`, { headers: extra.headers });
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
