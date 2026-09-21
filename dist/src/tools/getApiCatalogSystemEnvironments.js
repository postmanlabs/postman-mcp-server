import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getApiCatalogSystemEnvironments';
export const title = 'Get all system environments';
export const description = "Lists the team's system environments — the deployment stages (for example staging,\nproduction) that every service-scoped API Catalog read is keyed by. Call this first\nwhenever you need a \\`systemEnvironmentId\\` for getApiCatalogServices,\ngetApiCatalogService, getApiCatalogServiceEndpoints, getApiCatalogServiceMonitorRuns,\nor getApiCatalogServiceCiRuns. Pass \\`isProduction=true\\` to return only production\nenvironments; page with \\`limit\\` (max 100) and \\`cursor\\`.\nThese are not Postman environments holding variables — do not confuse them with\ngetEnvironments. Requires a Postman Enterprise plan.\n";
export const parameters = z.object({
    isProduction: z
        .boolean()
        .describe('If true, filters the response results to return only system environments marked as production.')
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
    title: 'Get all system environments',
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/api-catalog/system-environments`;
        const query = new URLSearchParams();
        if (args.isProduction !== undefined)
            query.set('isProduction', String(args.isProduction));
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
