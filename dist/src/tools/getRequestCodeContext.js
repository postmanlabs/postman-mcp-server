import { z } from 'zod';
import { asMcpError, McpError, encodePathSegment, defineToolAnnotations, } from './utils/toolHelpers.js';
export const method = 'getRequestCodeContext';
export const title = 'Get request code context';
export const description = 'Returns comprehensive markdown-formatted context for generating code from a request. Includes the full request definition (method, URL, headers, query params, body, auth), all response examples with full details, and merged collection and environment variables with source tags.';
export const parameters = z.object({
    collectionId: z.string().describe("The collection's ID."),
    requestId: z.string().describe("The request's ID."),
});
export const annotations = defineToolAnnotations({
    title: 'Get request code context',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
});
export async function handler(args, extra) {
    try {
        const result = await extra.client.get(`/context/collections/${encodePathSegment(args.collectionId, 'collectionId')}/requests/${encodePathSegment(args.requestId, 'requestId')}/context`, { headers: extra.headers });
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
