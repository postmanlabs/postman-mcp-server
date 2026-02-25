import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'searchPostmanElementsInPrivateNetwork';
export const description = `Search for API requests and collections in your organization's Private API Network—a curated repository of trusted, internal APIs shared by your team.

**What is the Private API Network?**
The Private API Network is where your organization stores vetted APIs for internal use. These are trusted team workspaces containing approved microservices, internal tools, and shared API collections.

**When to Use This Tool:**
- Finding internal/company trusted APIs (e.g., "find a trusted api for notification service", "find our payment APIs", "search for internal microservices")
- Discovering trusted APIs shared within your organization
- Looking up team-approved API collections and requests
- When the user wants to find collections in the private network (e.g., "find internal access control collections", "search for payment API collections in our network")

**Search Scope:**
- Searches only trusted internal APIs in the Private API Network
- Returns requests or collections from team workspaces published to the network

**Entity Types:**
- \`requests\`: Search for individual API requests (default)
- \`collections\`: Search for collections (unique collections extracted from request results; pagination applies to underlying requests)`;
export const parameters = z.object({
    entityType: z
        .enum(['requests', 'collections'])
        .describe('The type of Postman element to search for. Use `requests` to search for individual API requests, or `collections` to search for collections (unique collections extracted from request results; pagination applies to underlying requests).')
        .default('requests'),
    q: z
        .string()
        .min(1)
        .max(512)
        .describe('The search query for API elements in the Private API Network (e.g. "invoices API", "notification service", "payment APIs").'),
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
        .default(10)
        .optional(),
});
export const annotations = {
    title: "Search for API requests and collections in your organization's Private API Network—a curated repository of trusted, internal APIs shared by your team.",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
const PRIVATE_NETWORK_FILTER = {
    $and: [
        {
            privateNetwork: {
                $eq: true,
            },
        },
    ],
};
export async function handler(args, extra) {
    try {
        const query = new URLSearchParams();
        if (args.limit !== undefined)
            query.set('limit', String(args.limit));
        if (args.nextCursor !== undefined)
            query.set('nextCursor', String(args.nextCursor));
        const endpoint = query.toString() ? `/search?${query.toString()}` : '/search';
        const body = {
            q: args.q,
            elementType: 'requests',
            filters: PRIVATE_NETWORK_FILTER,
        };
        const options = {
            body: JSON.stringify(body),
            contentType: ContentType.Json,
            headers: extra.headers,
        };
        const result = await extra.client.post(endpoint, options);
        if (args.entityType === 'collections') {
            const collectionsMap = new Map();
            const data = result?.data || [];
            for (const item of data) {
                if (item.collection && !collectionsMap.has(item.collection.id)) {
                    collectionsMap.set(item.collection.id, {
                        collectionId: item.collection.id,
                        collectionName: item.collection.name,
                        workspaceId: item.workspace?.id,
                        workspaceName: item.workspace?.name,
                        publisher: item.publisher?.name,
                        publisherVerified: item.publisher?.isVerified,
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
