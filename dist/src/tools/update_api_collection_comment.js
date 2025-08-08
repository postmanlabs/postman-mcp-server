import { z } from 'zod';
import { fetchPostmanAPI, ContentType } from '../clients/postman.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'update-api-collection-comment';
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
export async function handler(params, extra) {
    try {
        const endpoint = `/apis/${params.apiId}/collections/${params.collectionId}/comments/${params.commentId}`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (params.body !== undefined)
            bodyPayload.body = params.body;
        if (params.tags !== undefined)
            bodyPayload.tags = params.tags;
        const result = await fetchPostmanAPI(url, {
            method: 'PUT',
            body: JSON.stringify(bodyPayload),
            contentType: ContentType.Json,
            apiKey: extra.apiKey,
            headers: extra.headers,
        });
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
