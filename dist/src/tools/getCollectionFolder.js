import { z } from 'zod';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'getCollectionFolder';
export const description = 'Gets information about a folder in a collection.';
export const parameters = z.object({
    folderId: z.string().describe("The folder's ID."),
    collectionId: z.string().describe("The collection's ID."),
    ids: z
        .boolean()
        .describe('If true, returns only properties that contain ID values in the response.')
        .optional(),
    uid: z.boolean().describe('If true, returns all IDs in UID format (`userId`-`id`).').optional(),
    populate: z
        .boolean()
        .describe("If true, returns all of the collection item's contents.")
        .optional(),
});
export const annotations = {
    title: 'Gets information about a folder in a collection.',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(params, extra) {
    try {
        const endpoint = `/collections/${params.collectionId}/folders/${params.folderId}`;
        const query = new URLSearchParams();
        if (params.ids !== undefined)
            query.set('ids', String(params.ids));
        if (params.uid !== undefined)
            query.set('uid', String(params.uid));
        if (params.populate !== undefined)
            query.set('populate', String(params.populate));
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
