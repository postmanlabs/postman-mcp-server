import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { McpError, ErrorCode, } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'duplicateCollection';
export const description = "Creates a duplicate of the given collection in another workspace.\n\nUse the GET \\`/collection-duplicate-tasks/{taskId}\\` endpoint to get the duplication task's current status.\n";
export const parameters = z.object({
    collectionId: z.string().describe("The collection's unique ID."),
    workspace: z.string().describe('The workspace ID in which to duplicate the collection.'),
    suffix: z
        .string()
        .describe("An optional suffix to append to the duplicated collection's name.")
        .optional(),
});
export const annotations = {
    title: "Creates a duplicate of the given collection in another workspace.\n\nUse the GET \\`/collection-duplicate-tasks/{taskId}\\` endpoint to get the duplication task's current status.\n",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/collections/${args.collectionId}/duplicates`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.workspace !== undefined)
            bodyPayload.workspace = args.workspace;
        if (args.suffix !== undefined)
            bodyPayload.suffix = args.suffix;
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
