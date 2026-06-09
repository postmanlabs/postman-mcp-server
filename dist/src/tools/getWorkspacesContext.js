import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getWorkspacesContext';
export const description = 'Returns a markdown-formatted summary of all workspaces accessible to the user. Use this to discover available workspaces and their collections before diving into specific resources. Supports pagination and filtering by name.';
export const parameters = z.object({
    cursor: z
        .string()
        .describe('Pagination cursor returned by a previous request. Pass this to get the next page of results.')
        .optional(),
    limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .describe('Maximum number of workspaces to return per page. Defaults to 100.')
        .optional(),
    name: z.string().describe('Filter workspaces by name.').optional(),
});
export const annotations = {
    title: 'Get Workspaces Context',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const query = new URLSearchParams();
        if (args.cursor !== undefined)
            query.set('cursor', args.cursor);
        if (args.limit !== undefined)
            query.set('limit', String(args.limit));
        if (args.name !== undefined)
            query.set('name', args.name);
        const endpoint = '/context/workspaces';
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const result = await extra.client.get(url, { headers: extra.headers });
        return {
            content: [{ type: 'text', text: result }],
        };
    }
    catch (e) {
        if (e instanceof McpError) {
            throw e;
        }
        throw asMcpError(e);
    }
}
