import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError, encodePathSegment, } from './utils/toolHelpers.js';
export const method = 'createRequestComment';
export const title = 'Create a request comment';
export const description = 'Creates a comment on a request. To create a reply on an existing comment, include the \\`threadId\\` property in the request body.\n\n**Note:**\n\nThis endpoint accepts a max of 10,000 characters.\n';
export const parameters = z.object({
    collectionId: z.string().describe("The collection's unique ID."),
    requestId: z
        .string()
        .describe("The request ID in `<ownerId>-<requestUuid>` form: the request's UUID prefixed with the owner ID, which is the part of `collectionId` before its first hyphen. It is not the team ID.\n\nFor example, for collection `24585957-7b2c98f7-30db-4b67-8685-0079f48a0947` (owner ID `24585957`) and a request whose UUID is `2c450b59-9bbf-729b-6ac0-f92535a7c336`, the `requestId` is `24585957-2c450b59-9bbf-729b-6ac0-f92535a7c336`.\n"),
    body: z.string().describe('The contents of the comment.'),
    threadId: z
        .number()
        .int()
        .describe("The comment's thread ID. To create a reply on an existing comment, include this property.")
        .optional(),
    tags: z
        .object({
        '{{userName}}': z
            .object({
            type: z.literal('user').describe('The `user` value.'),
            id: z.string().describe("The user's ID."),
        })
            .describe("An object that contains information about the tagged user. The object's name is the user's Postman username. For example, `@user-postman`.")
            .optional(),
    })
        .describe('Information about users tagged in the `body` comment.')
        .optional(),
});
export const annotations = {
    title: 'Create a request comment',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: false,
    idempotentHint: false,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/collections/${encodePathSegment(args.collectionId, 'collectionId')}/requests/${encodePathSegment(args.requestId, 'requestId')}/comments`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.body !== undefined)
            bodyPayload.body = args.body;
        if (args.threadId !== undefined)
            bodyPayload.threadId = args.threadId;
        if (args.tags !== undefined)
            bodyPayload.tags = args.tags;
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
