import { z } from 'zod';
import { McpError, ErrorCode, } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'getAllPanAddElementRequests';
export const description = "Gets a list requests to add elements to your team's [Private API Network](https://learning.postman.com/docs/collaborating-in-postman/adding-private-network/).";
export const parameters = z.object({
    since: z
        .string()
        .datetime({ offset: true })
        .describe('Return only results created since the given time, in [ISO 8601](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6) format. This value cannot be later than the `until` value. To use time-numoffset format, you must use `%2B` URL-encoding for the `+` character.')
        .optional(),
    until: z
        .string()
        .datetime({ offset: true })
        .describe('Return only results created until this given time, in [ISO 8601](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6) format. This value cannot be earlier than the `since` value. To use time-numoffset format, you must use `%2B` URL-encoding for the `+` character.')
        .optional(),
    requestedBy: z
        .number()
        .int()
        .describe("Return a user's element requests by their user ID.")
        .optional(),
    type: z
        .enum(['api', 'folder', 'collection', 'workspace'])
        .describe('Filter by the element type.')
        .optional(),
    status: z.enum(['pending', 'denied']).describe('Filter by the request status.').optional(),
    name: z
        .string()
        .describe('Return only elements whose name includes the given value. Matching is not case-sensitive.')
        .optional(),
    sort: z
        .enum(['createdAt', 'updatedAt'])
        .describe('Sort the results by the given value. If you use this query parameter, you must also use the `direction` parameter.')
        .optional(),
    direction: z
        .enum(['asc', 'desc'])
        .describe('Sort in ascending (`asc`) or descending (`desc`) order. Matching is not case-sensitive. If you use this query parameter, you must also use the `sort` parameter.')
        .optional(),
    offset: z
        .number()
        .int()
        .describe('The zero-based offset of the first item to return.')
        .default(0),
    limit: z
        .number()
        .int()
        .describe('The maximum number of elements to return. If the value exceeds the maximum value of `1000`, then the system uses the `1000` value.')
        .default(1000),
});
export const annotations = {
    title: "Gets a list requests to add elements to your team's [Private API Network](https://learning.postman.com/docs/collaborating-in-postman/adding-private-network/).",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/network/private/network-entity/request/all`;
        const query = new URLSearchParams();
        if (args.since !== undefined)
            query.set('since', String(args.since));
        if (args.until !== undefined)
            query.set('until', String(args.until));
        if (args.requestedBy !== undefined)
            query.set('requestedBy', String(args.requestedBy));
        if (args.type !== undefined)
            query.set('type', String(args.type));
        if (args.status !== undefined)
            query.set('status', String(args.status));
        if (args.name !== undefined)
            query.set('name', String(args.name));
        if (args.sort !== undefined)
            query.set('sort', String(args.sort));
        if (args.direction !== undefined)
            query.set('direction', String(args.direction));
        if (args.offset !== undefined)
            query.set('offset', String(args.offset));
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
