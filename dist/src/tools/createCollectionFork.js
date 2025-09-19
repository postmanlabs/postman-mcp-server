import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { McpError, ErrorCode, } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'createCollectionFork';
export const description = 'Creates a [fork](https://learning.postman.com/docs/collaborating-in-postman/version-control/#creating-a-fork) from an existing collection into a workspace.';
export const parameters = z.object({
    collectionId: z.string().describe("The collection's ID."),
    workspace: z.string().describe('The workspace ID in which to create the fork.'),
    label: z.string().describe("The fork's label."),
});
export const annotations = {
    title: 'Creates a [fork](https://learning.postman.com/docs/collaborating-in-postman/version-control/#creating-a-fork) from an existing collection into a workspace.',
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/collections/fork/${args.collectionId}`;
        const query = new URLSearchParams();
        if (args.workspace !== undefined)
            query.set('workspace', String(args.workspace));
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.label !== undefined)
            bodyPayload.label = args.label;
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
