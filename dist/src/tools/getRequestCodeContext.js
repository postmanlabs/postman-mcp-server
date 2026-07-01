import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getRequestCodeContext';
export const description = 'Returns comprehensive markdown-formatted context for generating code from a request. Includes the full request definition (method, URL, headers, query params, body, auth), all response examples with full details, and merged collection and environment variables with source tags.';
export const parameters = z.object({
    collectionId: z.string().describe("The collection's ID."),
    requestId: z.string().describe("The request's ID."),
});
export const annotations = {
    title: 'Get Request Code Context',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const result = await extra.client.get(`/context/collections/${encodeURIComponent(String(args.collectionId))}/requests/${encodeURIComponent(String(args.requestId))}/context`, { headers: extra.headers });
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
