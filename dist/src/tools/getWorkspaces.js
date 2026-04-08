import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getWorkspaces';
export const description = "Gets all workspaces you have access to.\n- For “my …” requests, first call GET \\`/me\\` and pass \\`createdBy={me.user.id}\\`.\n- This endpoint's response contains the visibility field. Visibility determines who can access the workspace:\n  - \\`personal\\` — Only you can access the workspace.\n  - \\`team\\` — All team members can access the workspace.\n  - \\`private\\` — Only invited team members can access the workspace (Professional and Enterprise).\n  - \\`public\\` — Everyone can access the workspace.\n  - \\`partner\\` — Invited team members and partners (Professional and Enterprise).\n- For tools that require the workspace ID, and no workspace ID is provided, ask the user to provide the workspace ID. If the user does not provide the workspace ID, call this first with the createdBy parameter to use the first workspace.\n- Results are paginated. Use the \\`cursor\\` parameter to retrieve additional pages.\n- Examples:\n  - “List my workspaces” → GET \\`/me\\`, then GET \\`/workspaces?createdBy={me.user.id}&limit=100\\`\n  - “List my personal workspaces” → GET \\`/me\\`, then GET \\`/workspaces?type=personal&createdBy={me.user.id}&limit=100\\`\n  - “List all public workspaces” → GET \\`/workspaces?type=public&limit=100\\`\n";
export const parameters = z.object({
    type: z
        .enum(['personal', 'team', 'private', 'public', 'partner'])
        .describe('The type of workspace to filter the response by. One of: `personal`, `team`, `private`, `public`, `partner`.\n- For “my …” requests, this can be combined with `createdBy`. If type is not specified, it will search across all types for that user.\n')
        .optional(),
    createdBy: z
        .number()
        .int()
        .describe("Return only workspaces created by the specified Postman user ID.\n- For “my …” requests, set `createdBy` to the current user’s ID from GET `/me` (`me.user.id`).\n- If the user's ID is not known, first call GET `/me`, then retry with `createdBy`.\n")
        .optional(),
    include: z
        .enum(['mocks:deactivated', 'scim'])
        .describe("Include the following information in the endpoint's response:\n- `mocks:deactivated` — Include all deactivated mock servers in the response.\n- `scim` — Return the SCIM user IDs of the workspace creator and who last modified it.\n")
        .optional(),
    elementType: z
        .enum(['collection', 'specification'])
        .describe('Filter results to return the workspace where the given element type is located. If you pass this query parameter, you must also pass the `elementId` query parameter.')
        .optional(),
    elementId: z
        .string()
        .describe("Filter results to return the workspace where the given element's ID is located. When filtering by collection, you must use the collection's unique ID (`userId`-`collection`). If you pass this query parameter, you must also pass the `elementType` query parameter.")
        .optional(),
    cursor: z
        .string()
        .describe('The cursor to get the next set of results in a paginated response. Get this value from the `meta.nextCursor` field in the previous response.\n')
        .optional(),
    limit: z
        .number()
        .int()
        .gte(1)
        .lte(100)
        .describe('The maximum number of workspaces to return per page. Defaults to 100.\n')
        .default(100),
});
export const annotations = {
    title: 'Gets all workspaces you have access to.',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/workspaces`;
        const query = new URLSearchParams();
        if (args.type !== undefined)
            query.set('type', String(args.type));
        if (args.createdBy !== undefined)
            query.set('createdBy', String(args.createdBy));
        if (args.include !== undefined)
            query.set('include', String(args.include));
        if (args.elementType !== undefined)
            query.set('elementType', String(args.elementType));
        if (args.elementId !== undefined)
            query.set('elementId', String(args.elementId));
        if (args.cursor !== undefined)
            query.set('cursor', String(args.cursor));
        if (args.limit !== undefined)
            query.set('limit', String(args.limit));
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
