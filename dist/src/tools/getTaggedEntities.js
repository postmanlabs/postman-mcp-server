import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getTaggedEntities';
export const description = '**Requires an Enterprise plan.** Tagging is only available on Postman Enterprise plans. This tool returns a 404 error on Free, Basic, and Professional accounts.\n\nGets Postman elements (entities) by a given tag. Tags enable you to organize and search workspaces, APIs, and collections that contain shared tags.\n';
export const parameters = z.object({
    slug: z
        .string()
        .regex(new RegExp('^[a-z][a-z0-9-]*[a-z0-9]+$'))
        .min(2)
        .max(64)
        .describe("The tag's ID within a team or individual (non-team) user scope."),
    limit: z
        .number()
        .int()
        .lte(50)
        .describe('The maximum number of tagged elements to return in a single call.')
        .default(10),
    direction: z
        .enum(['asc', 'desc'])
        .describe("The ascending (`asc`) or descending (`desc`) order to sort the results by, based on the time of the entity's tagging.")
        .default('desc'),
    cursor: z
        .string()
        .describe('The cursor to get the next set of results in the paginated response. If you pass an invalid value, the API only returns the first set of results.')
        .optional(),
    entityType: z
        .enum(['api', 'collection', 'workspace'])
        .describe('Filter results for the given entity type.')
        .optional(),
});
export const annotations = {
    title: '**Requires an Enterprise plan.** Tagging is only available on Postman Enterprise plans. This tool returns a 404 error on Free, Basic, and Professional accounts.',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/tags/${args.slug}/entities`;
        const query = new URLSearchParams();
        if (args.limit !== undefined)
            query.set('limit', String(args.limit));
        if (args.direction !== undefined)
            query.set('direction', String(args.direction));
        if (args.cursor !== undefined)
            query.set('cursor', String(args.cursor));
        if (args.entityType !== undefined)
            query.set('entityType', String(args.entityType));
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
