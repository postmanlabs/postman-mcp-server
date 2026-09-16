import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getApiCatalogServiceSpecificationLints';
export const title = "Get a service's specification lints";
export const description = "Lists specification lint runs for a service, with per-severity issue counts. Use this\nto see whether a service's specifications pass governance rules and which severities\nare failing. Unlike the other service reads, this one takes no \\`systemEnvironmentId\\`;\nscope it with \\`specId\\` instead. \\`severity\\` is a threshold — higher severities are\nalways included. Order with \\`sort\\` in \\`field:direction\\` form over \\`timestamp\\` or\n\\`errorCount\\`.\nDo not use this tool to lint a specification on demand; it only reports runs that have\nalready happened. Requires a Postman Enterprise plan.\n";
export const parameters = z.object({
    serviceId: z.string().describe("The service's ID."),
    specId: z.string().describe('Filter results to the given API specification ID.').optional(),
    severity: z
        .enum(['info', 'warning', 'error'])
        .describe('Filter results to runs with issues at or above the given severity threshold. Higher severities are always included.')
        .optional(),
    status: z
        .enum(['passed', 'failed'])
        .describe('Filter results to the given spec lint outcome.')
        .optional(),
    sort: z
        .string()
        .regex(new RegExp('^(timestamp|errorCount):(asc|desc)$'))
        .describe('Sort the results in field:direction order format. Accepts the `timestamp` and `errorCount` fields. Supports the `asc` and `desc` directions.')
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
    title: "Get a service's specification lints",
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/api-catalog/services/${encodeURIComponent(String(args.serviceId))}/spec-lints`;
        const query = new URLSearchParams();
        if (args.specId !== undefined)
            query.set('specId', String(args.specId));
        if (args.severity !== undefined)
            query.set('severity', String(args.severity));
        if (args.status !== undefined)
            query.set('status', String(args.status));
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
