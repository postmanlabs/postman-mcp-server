import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'patchWorkspaceUpdate';
export const title = 'Update a workspace update';
export const description = 'Edits a published workspace update. Requires the \\`application/merge-patch+json\\`\nContent-Type header, and only the fields you send are changed.\nWatchers may have already read the original, so correct an update rather than rewriting\nits meaning, and post a new one with createWorkspaceUpdate when the news itself has\nchanged.\n';
export const parameters = z.object({
    workspaceId: z.string().describe("The workspace's ID."),
    updateId: z.number().int().describe("The workspace update's ID."),
    'Content-Type': z
        .literal('application/merge-patch+json')
        .describe('The `application/merge-patch+json` header.'),
    description: z.string().min(1).max(20000).describe('The content of the workspace update.'),
    topic: z.string().min(1).max(255).describe('The title of the workspace update.'),
    category: z
        .enum(['improvement', 'new_feature', 'bug_fix', 'breaking_change', 'announcement'])
        .describe("The update's assigned category."),
    isPinned: z
        .boolean()
        .describe('If true, the workspace update is pinned to the top of the workspace updates list.')
        .optional(),
    relatedResources: z
        .array(z.object({
        resource: z
            .enum([
            'collection',
            'request',
            'response',
            'folder',
            'extensibleCollection',
            'extensibleCollectionItem',
        ])
            .describe('The type of linked resource.'),
        resourceId: z.string().describe("The linked resource's ID."),
    }))
        .max(10)
        .describe("A list containing the update's related elements. Related elements include links to collections, requests, folders, and saved examples in the update.")
        .optional(),
});
export const annotations = {
    title: 'Update a workspace update',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/workspaces/${encodeURIComponent(String(args.workspaceId))}/updates/${encodeURIComponent(String(args.updateId))}`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.description !== undefined)
            bodyPayload.description = args.description;
        if (args.topic !== undefined)
            bodyPayload.topic = args.topic;
        if (args.category !== undefined)
            bodyPayload.category = args.category;
        if (args.isPinned !== undefined)
            bodyPayload.isPinned = args.isPinned;
        if (args.relatedResources !== undefined)
            bodyPayload.relatedResources = args.relatedResources;
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
