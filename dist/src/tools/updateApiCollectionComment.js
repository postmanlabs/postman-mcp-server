import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { McpError, ErrorCode, } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'updateApiCollectionComment';
export const description = "Updates a comment on an API's collection.\n\n**Note:**\n\nThis endpoint accepts a max of 10,000 characters.\n";
export const parameters = z.object({
    apiId: z.string().describe("The API's ID."),
    collectionId: z.string().describe("The collection's unique ID."),
    commentId: z.number().int().describe("The comment's ID."),
    body: z.string().describe('The contents of the comment.'),
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
    title: "Updates a comment on an API's collection.\n\n**Note:**\n\nThis endpoint accepts a max of 10,000 characters.\n",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/apis/${args.apiId}/collections/${args.collectionId}/comments/${args.commentId}`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.body !== undefined)
            bodyPayload.body = args.body;
        if (args.tags !== undefined)
            bodyPayload.tags = args.tags;
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
