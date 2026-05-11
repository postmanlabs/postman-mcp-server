import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'searchPostmanElements';
export const description = `Search for Postman entities (requests, collections, workspaces, specs, and flows).

**Ownership:**
- \`organization\` — Search within all resources owned by your organization (default).
- \`external\` — Search within the public Postman network (third-party and community APIs).
- \`all\` — Search across all scopes.

**When to use each ownership value and filters:**

| Goal | Recommended approach |
|------|----------------------|
| Find an internal API (e.g. "our notification service") | \`ownership: organization\` |
| Find a trusted API published to the Private Network | \`ownership: organization\` + \`privateNetwork: true\` filter |
| Find an internal API in all resources of organization and are visible to the organization only | \`ownership: organization\` + \`visibility: internal\` filter |
| Find an API by your organization that is made publicly visible | \`ownership: organization\` + \`visibility: public\` filter |
| Find a third party publicly visible API (e.g. "Stripe API", "Twilio API") | \`ownership: external\` + \`visibility: public\` filter |
| User says "our APIs", "internal", "team" | \`ownership: organization\` |
| Search across all scopes | \`ownership: all\` |

**Element Types:**
- \`requests\`: Search for individual API requests.
- \`collections\`: Search for API collections.
- \`workspaces\`: Search for Postman workspaces.
- \`specs\`: Search for API specifications.
- \`flows\`: Search for Postman Flows.

**Filters:**

Use the \`filters\` parameter to narrow results. The top-level key must be \`$and\` with an array of condition objects. Each condition object must contain exactly one field key.

Supported filter fields:
| Field | Operators | Notes |
|-------|-----------|-------|
| \`workspaceId\` | \`$eq\`, \`$ne\`, \`$in\`, \`$nin\` | All element types. \`$in\`/\`$nin\` accept arrays. |
| \`collectionId\` | \`$eq\`, \`$ne\`, \`$in\`, \`$nin\` | Requests and collections only. |
| \`visibility\` | \`$eq\`, \`$ne\` | Values: \`public\`, \`partner\`, \`internal\`. All element types. |
| \`privateNetwork\` | \`$eq\`, \`$ne\` | Boolean. All element types. |
| \`publisherIsVerified\` | \`$eq\`, \`$ne\` | Boolean. All element types. |
| \`method\` | \`$eq\`, \`$ne\`, \`$in\`, \`$nin\` | HTTP methods (GET, POST, etc.). Requests only. |
| \`tags\` | \`$eq\`, \`$ne\`, \`$in\`, \`$nin\` | Workspaces and collections only. |
| \`requestId\` | \`$eq\`, \`$ne\`, \`$in\`, \`$nin\` | Requests only. |
| \`specificationId\` | \`$eq\`, \`$ne\`, \`$in\`, \`$nin\` | Specs only. |
| \`flowId\` | \`$eq\`, \`$ne\`, \`$in\`, \`$nin\` | Flows only. |
| \`createdBy\` | \`$eq\`, \`$ne\`, \`$in\`, \`$nin\` | All element types. |
| \`organizationId\` | \`$eq\`, \`$ne\`, \`$in\`, \`$nin\` | All element types. |
| \`teamId\` | \`$eq\`, \`$ne\`, \`$in\`, \`$nin\` | All element types. |
| \`isGitConnected\` | \`$eq\`, \`$ne\` | Boolean. Workspaces, collections, requests, specs, flows. |
| \`type\` | \`$eq\`, \`$ne\`, \`$in\`, \`$nin\` | Requests only. |

**Filter examples:**
- Private API Network only: \`{"$and":[{"privateNetwork":{"$eq":true}}]}\`
- Single workspace: \`{"$and":[{"workspaceId":{"$eq":"ws-abc123"}}]}\`
- Multiple workspaces: \`{"$and":[{"workspaceId":{"$in":["ws-1","ws-2"]}}]}\`
- Public visibility: \`{"$and":[{"visibility":{"$eq":"public"}}]}\`
- GET requests only: \`{"$and":[{"method":{"$eq":"GET"}}]}\`
- Combine conditions: \`{"$and":[{"visibility":{"$eq":"public"}},{"workspaceId":{"$eq":"ws-abc123"}}]}\``;
const booleanOperator = z
    .object({
    $eq: z.boolean().optional(),
    $ne: z.boolean().optional(),
})
    .refine((obj) => Object.keys(obj).length === 1, {
    message: 'Exactly one of $eq or $ne must be provided.',
});
const stringOperator = z
    .object({
    $eq: z.string().min(1).optional(),
    $ne: z.string().min(1).optional(),
    $in: z.array(z.string().min(1)).min(1).optional(),
    $nin: z.array(z.string().min(1)).min(1).optional(),
})
    .refine((obj) => Object.keys(obj).length === 1, {
    message: 'Exactly one of $eq, $ne, $in, or $nin must be provided.',
});
const visibilityOperator = z
    .object({
    $eq: z.enum(['internal', 'public', 'partner']).optional(),
    $ne: z.enum(['internal', 'public', 'partner']).optional(),
})
    .refine((obj) => Object.keys(obj).length === 1, {
    message: 'Exactly one of $eq or $ne must be provided.',
});
const filterCondition = z
    .object({
    privateNetwork: booleanOperator.optional(),
    publisherIsVerified: booleanOperator.optional(),
    isGitConnected: booleanOperator.optional(),
    visibility: visibilityOperator.optional(),
    workspaceId: stringOperator.optional(),
    collectionId: stringOperator.optional(),
    method: stringOperator.optional(),
    tags: stringOperator.optional(),
    requestId: stringOperator.optional(),
    specificationId: stringOperator.optional(),
    flowId: stringOperator.optional(),
    createdBy: stringOperator.optional(),
    organizationId: stringOperator.optional(),
    teamId: stringOperator.optional(),
    type: stringOperator.optional(),
})
    .refine((obj) => Object.values(obj).filter((v) => v !== undefined).length === 1, {
    message: 'Each filter condition must contain exactly one field.',
});
const filtersSchema = z
    .object({
    $and: z
        .array(filterCondition)
        .min(1)
        .describe('Array of filter conditions. Each condition must contain exactly one field key mapped to an operator object.'),
})
    .describe('Structured filter expression. Top-level key must be "$and" with an array of condition objects. ' +
    'Each condition: { "<field>": { "<operator>": <value> } }. ' +
    'Example: {"$and":[{"privateNetwork":{"$eq":true}}]}');
export const parameters = z.object({
    entityType: z
        .enum(['requests', 'collections', 'workspaces', 'specs', 'flows'])
        .describe('The type of Postman entity to search for: `requests` (individual API requests), `collections` (API collections), `workspaces` (Postman workspaces), `specs` (API specifications), or `flows` (Postman Flows).')
        .default('requests'),
    q: z
        .string()
        .max(512)
        .describe('The search query (e.g. "payment API", "notification service", "Stripe").')
        .optional(),
    ownership: z
        .enum(['organization', 'external', 'all'])
        .describe('The ownership scope. Use `organization` to search all resources in your organization (default), `external` to search the public Postman network, or `all` to search across all scopes.')
        .default('organization'),
    filters: filtersSchema.optional(),
    cursor: z
        .string()
        .describe('The cursor to get the next set of results in the paginated response. Pass the `nextCursor` value from the previous response.')
        .optional(),
    limit: z
        .number()
        .int()
        .gte(1)
        .lte(25)
        .describe('The maximum number of search results to return. Maximum: 25.')
        .default(10)
        .optional(),
});
export const annotations = {
    title: 'Search for Postman entities (requests, collections, workspaces, specs, flows).',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const query = new URLSearchParams();
        if (args.limit !== undefined)
            query.set('limit', String(args.limit));
        if (args.cursor !== undefined)
            query.set('nextCursor', String(args.cursor));
        const endpoint = query.toString() ? `/search?${query.toString()}` : '/search';
        const body = {
            ownership: args.ownership,
            elementType: args.entityType,
        };
        if (args.q !== undefined) {
            body.q = args.q;
        }
        if (args.filters !== undefined) {
            body.filters = args.filters;
        }
        const result = await extra.client.post(endpoint, {
            body: JSON.stringify(body),
            contentType: ContentType.Json,
            headers: extra.headers,
        });
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
