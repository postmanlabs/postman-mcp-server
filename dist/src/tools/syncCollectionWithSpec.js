import { z } from 'zod';
import { McpError, ErrorCode, } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'syncCollectionWithSpec';
export const description = 'Syncs a collection generated from an API specification. This is an asynchronous endpoint that returns an HTTP \\`202 Accepted\\` response.\n\n**Note:**\n\n- This endpoint only supports the OpenAPI 3.0 specification type.\n- You can only sync collections generated from the given spec ID.\n';
export const parameters = z.object({
    collectionUid: z.string().describe("The collection's unique ID."),
    specId: z.string().describe("The spec's ID."),
});
export const annotations = {
    title: 'Syncs a collection generated from an API specification. This is an asynchronous endpoint that returns an HTTP \\`202 Accepted\\` response.\n\n**Note:**\n\n- This endpoint only supports the OpenAPI 3.0 specification type.\n- You can only sync collections generated from the given spec ID.\n',
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/collections/${args.collectionUid}/synchronizations`;
        const query = new URLSearchParams();
        if (args.specId !== undefined)
            query.set('specId', String(args.specId));
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const options = {
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
