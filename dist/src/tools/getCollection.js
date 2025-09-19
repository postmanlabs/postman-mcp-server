import { z } from 'zod';
import { McpError, ErrorCode, } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'getCollection';
export const description = "Gets information about a collection. For a complete list of this endpoint's possible values, refer to the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).";
export const parameters = z.object({
    collectionId: z
        .string()
        .describe('The collection ID must be in the form <OWNER_ID>-<UUID> (e.g. 12345-33823532ab9e41c9b6fd12d0fd459b8b).'),
    access_key: z
        .string()
        .describe("A collection's read-only access key. Using this query parameter does not require an API key to call the endpoint.")
        .optional(),
    model: z
        .literal('minimal')
        .describe("Return a list of only the collection's root-level request (`rootLevelRequests`) and folder (`rootLevelFolders`) IDs instead of the full collection element data.")
        .optional(),
});
export const annotations = {
    title: "Gets information about a collection. For a complete list of this endpoint's possible values, refer to the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/collections/${args.collectionId}`;
        const query = new URLSearchParams();
        if (args.access_key !== undefined)
            query.set('access_key', String(args.access_key));
        if (args.model !== undefined)
            query.set('model', String(args.model));
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const options = {
            headers: extra.headers,
        };
        const result = await extra.client.get(url, options);
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
