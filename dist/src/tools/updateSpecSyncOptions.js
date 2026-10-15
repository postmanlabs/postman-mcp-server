import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'updateSpecSyncOptions';
export const title = 'Update spec sync options';
export const description = 'Configures how a specification syncs into one of its generated collections. Set\n\\`syncExamples\\` to keep example values aligned between the two, and\n\\`deleteOrphanedRequests\\` to control whether requests whose endpoints have disappeared\nfrom the specification are removed on the next sync — leave that one on only when the\ncollection is safe to prune, since it deletes requests. \\`syncOptions\\` must include at\nleast one of \\`syncExamples\\` or \\`deleteOrphanedRequests\\`; an empty \\`syncOptions\\` object\nis rejected. Whichever of the two you omit is left unchanged. Use getSpecCollections to\nfind the collection ID.\nThis changes settings only — it does not sync. Use syncCollectionWithSpec to actually\nrun a sync.\n';
export const parameters = z.object({
    specId: z.string().describe("The spec's ID."),
    collectionId: z.string().describe("The collection's ID."),
    syncOptions: z
        .object({
        syncExamples: z
            .boolean()
            .describe('If true, updates made to examples in the specification or to example values in the generated collection stay synchronized.')
            .optional(),
        deleteOrphanedRequests: z
            .boolean()
            .describe('If true, deletes requests and endpoints that no longer exist in the source during sync.')
            .optional(),
    })
        .refine((value) => Object.keys(value).length >= 1, {
        message: 'Must include at least 1 property.',
    })
        .describe('Information about the specification sync options.')
        .optional(),
});
export const annotations = {
    title: 'Update spec sync options',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: true,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        if ([args['syncOptions']].filter((value) => value !== undefined).length < 1) {
            throw new McpError(ErrorCode.InvalidParams, 'Request body must include at least 1 property.');
        }
        const endpoint = `/specs/${encodeURIComponent(String(args.specId))}/collections/${encodeURIComponent(String(args.collectionId))}/sync-options`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.syncOptions !== undefined)
            bodyPayload.syncOptions = args.syncOptions;
        const options = {
            body: JSON.stringify(bodyPayload),
            contentType: ContentType.Json,
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
