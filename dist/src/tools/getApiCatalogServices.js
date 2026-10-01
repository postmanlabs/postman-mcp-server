import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getApiCatalogServices';
export const title = 'Get all API Catalog services';
export const description = 'Lists the services catalogued in one system environment, with their analytics,\ncompliance, and governance metadata. \\`systemEnvironmentId\\` is required — call\ngetApiCatalogSystemEnvironments first to get one, and repeat this call per environment\nwhen you need a cross-environment view. Narrow with \\`name\\`, \\`tags\\`, and\n\\`governanceGroupId\\`; page with \\`limit\\` (max 100) and \\`cursor\\`.\nDo not use this tool to find services that are not catalogued yet; use\ngetApiCatalogDiscoveryServices instead. Requires a Postman Enterprise plan.\n';
export const parameters = z.object({
    systemEnvironmentId: z.string().describe("The system environment's ID."),
    name: z
        .string()
        .max(255)
        .describe('Filter results to the given the service name. This is case-insensitive.')
        .optional(),
    tags: z
        .string()
        .regex(new RegExp('^[^,]+(,[^,]+)*$'))
        .describe('A comma-separated list of tag names to filter by.')
        .optional(),
    governanceGroupId: z
        .string()
        .describe('Filter results to only services that belong to the given governance group ID.')
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
    title: 'Get all API Catalog services',
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/api-catalog/services`;
        const query = new URLSearchParams();
        if (args.systemEnvironmentId !== undefined)
            query.set('systemEnvironmentId', String(args.systemEnvironmentId));
        if (args.name !== undefined)
            query.set('name', String(args.name));
        if (args.tags !== undefined)
            query.set('tags', String(args.tags));
        if (args.governanceGroupId !== undefined)
            query.set('governanceGroupId', String(args.governanceGroupId));
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
