import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'listPrivateNetworkWorkspaces';
export const description = "Gets information about workspaces added to your team's Private API Network.\n\nWARNING: This tool is for Private API Network management, not for general workspace operations. For workspace management use: getWorkspaces, getWorkspace, createWorkspace, updateWorkspace, deleteWorkspace.\n";
export const parameters = z.object({
    type: z.literal('workspace').describe('The `workspace` value.').optional(),
    name: z
        .string()
        .describe('Return only workspaces whose name includes the given value. Matching is not case-sensitive.')
        .optional(),
    summary: z
        .string()
        .describe('Return only workspaces whose summary includes the given value. Matching is not case-sensitive.')
        .optional(),
    description: z
        .string()
        .describe('Return only workspaces whose description includes the given value. Matching is not case-sensitive.')
        .optional(),
    since: z
        .string()
        .datetime({ offset: true })
        .describe('Return only results created since the given time, in [ISO 8601](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6) format. This value cannot be later than the `until` value.')
        .optional(),
    until: z
        .string()
        .datetime({ offset: true })
        .describe('Return only results created until this given time, in [ISO 8601](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6) format. This value cannot be earlier than the `since` value.')
        .optional(),
    addedBy: z
        .number()
        .int()
        .describe('Return only workspaces published by the given user ID.')
        .optional(),
    sort: z
        .enum(['createdAt', 'updatedAt'])
        .describe('Sort the results by the given value. If you use this query parameter, you must also use the `direction` parameter.')
        .optional(),
    direction: z
        .enum(['asc', 'desc'])
        .describe('Sort in ascending (`asc`) or descending (`desc`) order. Matching is not case-sensitive. If you use this query parameter, you must also use the `sort` parameter.')
        .optional(),
    createdBy: z
        .number()
        .int()
        .describe('Return only results created by the given user ID.')
        .optional(),
    offset: z
        .number()
        .int()
        .describe('The zero-based offset of the first item to return.')
        .default(0),
    limit: z
        .number()
        .int()
        .describe('The maximum number of results to return. If the value exceeds the maximum value of `1000`, then the system uses the `1000` value.')
        .default(1000),
    parentFolderId: z.number().int().describe('This parameter is deprecated.').default(0),
});
export const annotations = {
    title: "Gets information about workspaces added to your team's Private API Network.",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/network/private`;
        const query = new URLSearchParams();
        if (args.type !== undefined)
            query.set('type', String(args.type));
        if (args.name !== undefined)
            query.set('name', String(args.name));
        if (args.summary !== undefined)
            query.set('summary', String(args.summary));
        if (args.description !== undefined)
            query.set('description', String(args.description));
        if (args.since !== undefined)
            query.set('since', String(args.since));
        if (args.until !== undefined)
            query.set('until', String(args.until));
        if (args.addedBy !== undefined)
            query.set('addedBy', String(args.addedBy));
        if (args.sort !== undefined)
            query.set('sort', String(args.sort));
        if (args.direction !== undefined)
            query.set('direction', String(args.direction));
        if (args.createdBy !== undefined)
            query.set('createdBy', String(args.createdBy));
        if (args.offset !== undefined)
            query.set('offset', String(args.offset));
        if (args.limit !== undefined)
            query.set('limit', String(args.limit));
        if (args.parentFolderId !== undefined)
            query.set('parentFolderId', String(args.parentFolderId));
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
