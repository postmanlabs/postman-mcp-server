import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'createCollectionPullRequest';
export const title = 'Create a pull request';
export const description = "Creates a pull request to merge changes from a forked collection into its parent\n(destination) collection. Provide the title, description, source and destination\ncollection IDs, and reviewer IDs. Use this after forking a collection\n(createCollectionFork) to propose the fork's changes for review rather than\nhard-merging them directly.\n";
export const parameters = z.object({
    collectionId: z.string().describe("The collection's unique ID."),
    title: z.string().describe('The title of the pull request.'),
    description: z.string().describe("The pull request's description.").optional(),
    reviewers: z
        .array(z.string().describe("The reviewer's user ID."))
        .describe('A list of reviewers to assign to the pull request.'),
    destinationId: z.string().describe('The collection ID to merge the pull request into.'),
});
export const annotations = {
    title: 'Create a pull request',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: false,
    idempotentHint: false,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/collections/${encodeURIComponent(String(args.collectionId))}/pull-requests`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.title !== undefined)
            bodyPayload.title = args.title;
        if (args.description !== undefined)
            bodyPayload.description = args.description;
        if (args.reviewers !== undefined)
            bodyPayload.reviewers = args.reviewers;
        if (args.destinationId !== undefined)
            bodyPayload.destinationId = args.destinationId;
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
