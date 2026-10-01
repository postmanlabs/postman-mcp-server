import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getApiCatalogServiceMonitorRuns';
export const title = "Get an API Catalog service's monitor runs";
export const description = "Lists scheduled monitor runs for a service, with summary statistics per run. Use this\nto check whether a service's monitors are passing and when they last ran.\n\\`systemEnvironmentId\\` is required. Filter with \\`collectionId\\`, \\`environmentId\\`, and\n\\`status\\`; order with \\`sort\\` in \\`field:direction\\` form over \\`timestamp\\`, \\`duration\\`, or\n\\`failedAssertions\\`.\nDo not use this tool for CI-triggered runs; those are separate and read with\ngetApiCatalogServiceCiRuns. Requires a Postman Enterprise plan.\n";
export const parameters = z.object({
    serviceId: z.string().describe("The service's ID."),
    systemEnvironmentId: z.string().describe("The system environment's ID."),
    collectionId: z
        .string()
        .describe("Filter results to only the given collection ID's runs.")
        .optional(),
    sort: z
        .string()
        .regex(new RegExp('^(timestamp|duration|failedAssertions):(asc|desc)$'))
        .describe('Sort the results in field:direction order format. Accepts the `timestamp`, `duration`, and `failedAssertions` fields. Supports the `asc` and `desc` directions.')
        .optional(),
    environmentId: z
        .string()
        .describe('Filter results to only the given environment ID runs.')
        .optional(),
    status: z.enum(['passed', 'failed']).describe('Filter results by run status.').optional(),
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
    title: "Get an API Catalog service's monitor runs",
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/api-catalog/services/${encodeURIComponent(String(args.serviceId))}/monitor-runs`;
        const query = new URLSearchParams();
        if (args.systemEnvironmentId !== undefined)
            query.set('systemEnvironmentId', String(args.systemEnvironmentId));
        if (args.collectionId !== undefined)
            query.set('collectionId', String(args.collectionId));
        if (args.sort !== undefined)
            query.set('sort', String(args.sort));
        if (args.environmentId !== undefined)
            query.set('environmentId', String(args.environmentId));
        if (args.status !== undefined)
            query.set('status', String(args.status));
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
