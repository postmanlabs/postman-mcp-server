import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'searchPostmanElements';
export const description = 'Searches for Postman elements in the public network.\n\n**When to Use This Tool:**\n- When the user asks for a specific named request (e.g., "find PayPal requests", "search for Stripe API requests")\n- When the user wants to find collections (e.g., "find Stripe collections", "search for payment API collections")\n- When the user explicitly wants to search the public network\n- Do NOT use this for searching the user\'s own workspaces or collections (use getCollections or getWorkspaces instead)\n\n**Search Scope:**\n- Only searches the public network (public workspaces and collections)\n- Does not search private workspaces, team workspaces, or personal collections\n\n**Entity Types:**\n- `requests`: Search for individual API requests\n- `collections`: Search for collections (unique collections extracted from request results; pagination applies to underlying requests)\n';
export const parameters = z.object({
    entityType: z
        .enum(['requests', 'collections'])
        .describe('The type of Postman [entity](https://learning.postman.com/docs/getting-started/basics/postman-elements/) to search for. Use `requests` to search for individual API requests, or `collections` to search for collections (unique collections extracted from request results; pagination applies to underlying requests).'),
    q: z
        .string()
        .min(1)
        .max(512)
        .describe('The query used to search for Postman elements.')
        .optional(),
    publisherIsVerified: z
        .boolean()
        .describe('Filter the search results to only return entities from publishers [verified](https://learning.postman.com/docs/collaborating-in-postman/public-api-network/verify-your-team/) by Postman.')
        .optional(),
    nextCursor: z
        .string()
        .describe('The cursor to get the next set of results in the paginated response. If you pass an invalid value, the API returns empty results.')
        .optional(),
    limit: z
        .number()
        .int()
        .gte(1)
        .lte(10)
        .describe('The max number of search results returned in the response.')
        .default(10),
});
export const annotations = {
    title: 'Searches for Postman elements in the public network.',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = '/search/requests';
        const query = new URLSearchParams();
        if (args.q !== undefined)
            query.set('q', String(args.q));
        if (args.publisherIsVerified !== undefined)
            query.set('publisherIsVerified', String(args.publisherIsVerified));
        if (args.nextCursor !== undefined)
            query.set('nextCursor', String(args.nextCursor));
        if (args.limit !== undefined)
            query.set('limit', String(args.limit));
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const options = {
            headers: extra.headers,
        };
        const result = await extra.client.get(url, options);
        if (args.entityType === 'collections') {
            const collectionsMap = new Map();
            const data = result?.data || [];
            for (const item of data) {
                if (!collectionsMap.has(item.collection.id)) {
                    collectionsMap.set(item.collection.id, {
                        collectionId: item.collection.id,
                        collectionName: item.collection.name,
                        workspaceId: item.workspace.id,
                        workspaceName: item.workspace.name,
                        publisher: item.publisher.name,
                        publisherVerified: item.publisher.isVerified,
                    });
                }
            }
            const collections = Array.from(collectionsMap.values());
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            data: collections,
                            meta: {
                                nextCursor: result?.meta?.nextCursor,
                                collectionsCount: collections.length,
                                note: 'Collections extracted from request results. Pagination applies to underlying requests.',
                            },
                        }, null, 2),
                    },
                ],
            };
        }
        return {
            content: [
                {
                    type: 'text',
                    text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
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
