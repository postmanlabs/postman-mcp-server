import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'asyncMergePullCollectionFork';
export const title = 'Merge or pull a collection fork asynchronously';
export const description = "Merges a collection fork into its parent, or pulls the parent's changes into the fork,\nas a background task. Direction is decided entirely by the IDs: pass the fork as\n\\`source\\` and the parent as \\`destination\\` to merge, and swap them to pull. Both take\ncollection unique IDs (\\`userId\\`-\\`collectionId\\`), not plain collection IDs. \\`strategy\\`\nacts on whichever collection is \\`source\\`, so it is only safe when merging, where\n\\`source\\` is the fork: \\`default\\` leaves the fork alone, \\`updateSourceWithDestination\\`\nalso copies the parent's differences back into it, and \\`deleteSource\\` deletes it — the\nlast two require Editor access on both collections. When pulling, \\`source\\` is the\nparent, so always use \\`default\\`; the other strategies would write back into or delete\nthe parent.\nThe response returns a task \\`id\\`; poll asyncMergePullCollectionTaskStatus with it,\nbecause a 200 here means the task was accepted, not that the merge finished.\nPrefer this tool over mergeCollectionFork and pullCollectionChanges for large\ncollections, since those run synchronously and can time out.\n";
export const parameters = z.object({
    strategy: z
        .enum(['default', 'updateSourceWithDestination', 'deleteSource'])
        .describe("The fork's merge strategy:\n- `default` — Make no changes to the fork. You must have **Editor** access to the destination collection.\n- `updateSourceWithDestination` — Merge changes and apply any differences in the destination collection to the source. You must have **Editor** access to both the source and destination collection.\n- `deleteSource` — Merge the changes and delete the fork. You must have **Editor** access to both the source and destination collection.\n"),
    source: z.string().describe("The source collection's unique ID."),
    destination: z.string().describe("The destination collection's unique ID."),
});
export const annotations = {
    title: 'Merge or pull a collection fork asynchronously',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: true,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/collection-merges`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.strategy !== undefined)
            bodyPayload.strategy = args.strategy;
        if (args.source !== undefined)
            bodyPayload.source = args.source;
        if (args.destination !== undefined)
            bodyPayload.destination = args.destination;
        const options = {
            body: JSON.stringify(bodyPayload),
            contentType: ContentType.Json,
            headers: extra.headers,
        };
        const result = await extra.client.put(url, options);
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
