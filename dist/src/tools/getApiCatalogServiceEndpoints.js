import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getApiCatalogServiceEndpoints';
export const title = "Get an API Catalog service's endpoints";
export const description = "Lists the endpoints Postman has observed for a service, with per-endpoint traffic and\nperformance metrics. Use this to find a service's slowest or most error-prone\nendpoints. \\`systemEnvironmentId\\` is required. Filter with \\`httpMethods\\`, \\`hosts\\`,\n\\`responseCodes\\`, and \\`search\\` on the path; order with \\`sort\\` in \\`field:direction\\` form\nover \\`count\\`, \\`endpoint\\`, \\`p95LatencyMs\\`, or \\`errorRate\\`.\nThese are observed endpoints, not a specification — do not use this tool to read a\nservice's OpenAPI definition. Requires a Postman Enterprise plan.\n";
export const parameters = z.object({
    serviceId: z.string().describe("The service's ID."),
    systemEnvironmentId: z.string().describe("The system environment's ID."),
    httpMethods: z
        .string()
        .regex(new RegExp('^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|TRACE)(,(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|TRACE))*$'))
        .describe('A.comma-separated list of HTTP methods to filter the results by.')
        .optional(),
    hosts: z
        .string()
        .regex(new RegExp('^[^,]+(,[^,]+)*$'))
        .describe('A comma-separated list of hostnames to filter the results by.')
        .optional(),
    responseCodes: z
        .string()
        .regex(new RegExp('^\\\\d{3}(,\\\\d{3})*$'))
        .describe('A comma-separated list of HTTP status codes to filter the results by.')
        .optional(),
    search: z
        .string()
        .max(500)
        .describe("Filter results to the search filter given on the endpoint's path.")
        .optional(),
    sort: z
        .string()
        .regex(new RegExp('^(count|endpoint|p95LatencyMs|errorRate):(asc|desc)$'))
        .describe('Sort the results in field:direction order format. Accepts the `count`, `endpoint`, `p95LatencyMs`, and `errorRate` fields. Supports the `asc` and `desc` directions.')
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
    title: "Get an API Catalog service's endpoints",
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/api-catalog/services/${encodeURIComponent(String(args.serviceId))}/endpoints`;
        const query = new URLSearchParams();
        if (args.systemEnvironmentId !== undefined)
            query.set('systemEnvironmentId', String(args.systemEnvironmentId));
        if (args.httpMethods !== undefined)
            query.set('httpMethods', String(args.httpMethods));
        if (args.hosts !== undefined)
            query.set('hosts', String(args.hosts));
        if (args.responseCodes !== undefined)
            query.set('responseCodes', String(args.responseCodes));
        if (args.search !== undefined)
            query.set('search', String(args.search));
        if (args.sort !== undefined)
            query.set('sort', String(args.sort));
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
