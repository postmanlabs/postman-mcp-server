import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'createWorkspaceUpdate';
export const title = 'Create a workspace update';
export const description = "Publishes an update in a workspace, notifying everyone watching it. Use this to announce\na breaking change, a release, or a deprecation to the workspace's consumers.\nThis notifies real people, so only post when explicitly asked to announce something, and\npost the message you were given rather than a summary you composed. It does not change\nthe workspace itself — use updateWorkspace for settings.\n";
export const parameters = z.object({
    workspaceId: z.string().describe("The workspace's ID."),
    description: z.string().min(1).max(20000).describe('The content of the workspace update.'),
    topic: z.string().min(1).max(255).describe('The title of the workspace update.'),
    category: z
        .enum(['improvement', 'new_feature', 'bug_fix', 'breaking_change', 'announcement'])
        .describe("The update's assigned category."),
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
    title: 'Create a workspace update',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: false,
    idempotentHint: false,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/workspaces/${encodeURIComponent(String(args.workspaceId))}/updates`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.description !== undefined)
            bodyPayload.description = args.description;
        if (args.topic !== undefined)
            bodyPayload.topic = args.topic;
        if (args.category !== undefined)
            bodyPayload.category = args.category;
        if (args.relatedResources !== undefined)
            bodyPayload.relatedResources = args.relatedResources;
        const options = {
            body: JSON.stringify(bodyPayload),
            contentType: ContentType.Json,
            headers: extra.headers,
        };
        const result = await extra.client.post(url, options);
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
