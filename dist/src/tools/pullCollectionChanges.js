import { z } from 'zod';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'pullCollectionChanges';
export const description = "Pulls the changes from a parent (source) collection into the forked collection. In the endpoint's response:\n\n- The \\`destinationId\\` is the ID of the forked collection.\n- The \\`sourceId\\` is the ID of the source collection.\n";
export const parameters = z.object({ collectionId: z.string().describe("The collection's ID.") });
export const annotations = {
    title: "Pulls the changes from a parent (source) collection into the forked collection. In the endpoint's response:\n\n- The \\`destinationId\\` is the ID of the forked collection.\n- The \\`sourceId\\` is the ID of the source collection.\n",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(params, extra) {
    try {
        const endpoint = `/collections/${params.collectionId}/pulls`;
        const query = new URLSearchParams();
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
