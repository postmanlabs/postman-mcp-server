import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getFolderContext';
export const description = 'Returns a markdown-formatted summary of a folder within a collection, including its metadata, description, and authentication settings.';
export const parameters = z.object({
    collectionId: z.string().describe("The collection's ID."),
    folderId: z.string().describe("The folder's ID."),
});
export const annotations = {
    title: 'Get Folder Context',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const result = await extra.client.get(`/context/collections/${encodeURIComponent(String(args.collectionId))}/folders/${encodeURIComponent(String(args.folderId))}`, { headers: extra.headers });
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
