import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getCollectionMap';
export const description = `Get a Postman collection map with metadata and a complete recursive index of all folders and requests. Response includes collection metadata and description. Response includes itemRefs property (name and id only) instead of the full item array. After calling, present the collection summary and ask the user where they\'d like to explore next, calling getCollectionFolder and/or getCollectionRequest tools in parallel to get more data quickly.
  Once you've called this tool, DO NOT call searchPostmanElements to find items in or related to this collection. Instead, use the map in itemRefs.
  Only use searchPostmanElements to find the collection where a request may be. Then, stay in the collection and don't use the search.
  When using the getCollectionRequest tool to look up request data, omit the populate parameter to avoid getting all response examples
  back at once (can be very large). Instead, use the response ids from the return value and call getCollectionResponse for each one.
  Prepend the collection's ownerId to the front of each response id when passing it to getCollectionResponse. This is the first part of the collection uid.
  Infer the response schema from that information and remember it. Omit the raw response examples from the conversation going forward.`;
export const parameters = z.object({
    collectionId: z
        .string()
        .describe('The collection ID must be in the form <OWNER_ID>-<UUID> (e.g. 12345-33823532ab9e41c9b6fd12d0fd459b8b).'),
    access_key: z
        .string()
        .describe("A collection's read-only access key. Using this query parameter does not require an API key to call the endpoint.")
        .optional(),
});
export const annotations = {
    title: 'Get Postman Collection Map',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
function buildItemRefs(items) {
    if (!Array.isArray(items) || items.length === 0) {
        return undefined;
    }
    return items.map((item) => {
        const itemId = item.uid || item.id || '';
        const itemRef = {
            name: item.name || '',
            id: itemId,
        };
        if (item.item && Array.isArray(item.item)) {
            const nestedRefs = buildItemRefs(item.item);
            if (nestedRefs) {
                itemRef.itemRefs = nestedRefs;
            }
        }
        return itemRef;
    });
}
export async function handler(args, extra) {
    try {
        const endpoint = `/collections/${args.collectionId}`;
        const query = new URLSearchParams();
        if (args.access_key !== undefined)
            query.set('access_key', String(args.access_key));
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const options = {
            headers: extra.headers,
        };
        const result = await extra.client.get(url, options);
        if (typeof result === 'string') {
            return {
                content: [
                    {
                        type: 'text',
                        text: result,
                    },
                ],
            };
        }
        const response = result;
        if (response.collection) {
            const { item, ...collectionWithoutItems } = response.collection;
            const itemRefs = buildItemRefs(item);
            const processedResponse = {
                ...response,
                collection: {
                    ...collectionWithoutItems,
                    ...(itemRefs && { itemRefs }),
                },
            };
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(processedResponse, null, 2),
                    },
                ],
            };
        }
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2),
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
