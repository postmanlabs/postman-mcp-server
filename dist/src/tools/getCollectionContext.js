import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getCollectionContext';
export const description = 'Returns a markdown-formatted summary of a collection, including its metadata, authentication, variables, and a tree of folders and requests. Use this to understand the structure and contents of a collection.';
export const parameters = z.object({
    collectionId: z.string().describe("The collection's ID."),
});
export const annotations = {
    title: 'Get Collection Context',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/context/collections/${encodeURIComponent(String(args.collectionId))}`;
        const result = await extra.client.get(endpoint, {
            headers: extra.headers,
        });
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
