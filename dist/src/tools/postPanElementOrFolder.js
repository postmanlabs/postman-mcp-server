import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { McpError, ErrorCode, } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'postPanElementOrFolder';
export const description = "Publishes a element or creates a folder in your team's [Private API Network](https://learning.postman.com/docs/collaborating-in-postman/adding-private-network/). An element is a Postman API, collection, or workspace.\n\n**Note:**\n\nYou can only pass one element object type per call. For example, you cannot pass both \\`api\\` and \\`collection\\` in a single request.\n";
export const parameters = z.object({
    body: z.union([
        z.object({
            api: z
                .object({
                id: z.string().describe("The API's ID."),
                parentFolderId: z.number().int().describe("The API's parent folder ID."),
            })
                .optional(),
        }),
        z.object({
            collection: z
                .object({
                id: z.string().describe("The collection's ID."),
                parentFolderId: z.number().int().describe("The collection's parent folder ID."),
                environments: z
                    .array(z.string().describe("An environment's UID."))
                    .describe('A list of environment UIDs (`userId`-`environmentId`) to add to the collection.')
                    .optional(),
            })
                .optional(),
        }),
        z.object({
            workspace: z
                .object({
                id: z.string().describe("The workspace's ID."),
                parentFolderId: z.number().int().describe("The workspace's parent folder ID."),
            })
                .optional(),
        }),
        z.object({
            folder: z
                .object({
                name: z.string().describe("The folder's name."),
                description: z.string().describe("The folder's description.").optional(),
                parentFolderId: z
                    .number()
                    .int()
                    .describe("The folder's parent folder ID. This value defaults to `0`. To create a folder at the root level, omit this property.")
                    .default(0),
            })
                .optional(),
        }),
    ]),
});
export const annotations = {
    title: "Publishes a element or creates a folder in your team's [Private API Network](https://learning.postman.com/docs/collaborating-in-postman/adding-private-network/). An element is a Postman API, collection, or workspace.\n\n**Note:**\n\nYou can only pass one element object type per call. For example, you cannot pass both \\`api\\` and \\`collection\\` in a single request.\n",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/network/private`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = args.body;
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
