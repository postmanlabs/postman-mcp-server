import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'updateCollectionTags';
export const description = "Updates a collection's associated tags. This endpoint replaces all existing tags with those you pass in the request body.";
export const parameters = z.object({
    collectionId: z.string().describe("The collection's unique ID."),
    tags: z
        .array(z
        .object({
        slug: z
            .string()
            .regex(new RegExp('^[a-z][a-z0-9-]*[a-z0-9]+$'))
            .min(2)
            .max(64)
            .describe("The tag's ID within a team or individual (non-team) user scope."),
    })
        .describe('Information about the tag.'))
        .min(0)
        .max(5)
        .describe('A list of the associated tags as slugs.'),
});
export const annotations = {
    title: "Updates a collection's associated tags. This endpoint replaces all existing tags with those you pass in the request body.",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(params, extra) {
    try {
        const endpoint = `/collections/${params.collectionId}/tags`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (params.tags !== undefined)
            bodyPayload.tags = params.tags;
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
