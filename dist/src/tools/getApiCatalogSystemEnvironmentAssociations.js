import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getApiCatalogSystemEnvironmentAssociations';
export const title = "Get a system environment's associations";
export const description = 'Lists the workspace environments attached to a system environment. Use this to see\nwhich Postman environments feed a deployment stage before adding or removing any.\nNarrow to one workspace with \\`workspaceId\\`; page with \\`limit\\` (max 100) and \\`cursor\\`.\nRequires a Postman Enterprise plan.\n';
export const parameters = z.object({
    systemEnvironmentId: z.string().describe("The system environment's ID."),
    workspaceId: z
        .string()
        .describe("The workspace's ID to which the environments in the association belong to.")
        .optional(),
    limit: z
        .number()
        .int()
        .gte(1)
        .lte(100)
        .describe('The maximum number of rows to return in the response, up to a maximum value of 100. Any value greater than 100 returns a 400 Bad Request response.')
        .default(20),
    cursor: z
        .string()
        .describe('The pointer to the first record of the set of paginated results. To view the next response, use the `nextCursor` value for this parameter.')
        .optional(),
});
export const annotations = {
    title: "Get a system environment's associations",
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/api-catalog/system-environments/${encodeURIComponent(String(args.systemEnvironmentId))}/associations`;
        const query = new URLSearchParams();
        if (args.workspaceId !== undefined)
            query.set('workspaceId', String(args.workspaceId));
        if (args.limit !== undefined)
            query.set('limit', String(args.limit));
        if (args.cursor !== undefined)
            query.set('cursor', String(args.cursor));
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
