import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getApiCatalogServiceCiRuns';
export const title = "Get a service's CI runs";
export const description = 'Lists CI collection runs for a service, with summary statistics, pipeline details, and\nGit metadata. Use this to tie test results back to a branch, workflow, or commit\nauthor. \\`systemEnvironmentId\\` is required. Filter with \\`collectionId\\`,\n\\`environmentId\\`, \\`status\\`, \\`branch\\`, \\`workflowName\\`, \\`actor\\`, \\`repoName\\`, and\n\\`repoOwner\\`; order with \\`sort\\` in \\`field:direction\\` form over \\`timestamp\\` or\n\\`duration\\`.\nDo not use this tool for scheduled monitor runs; use getApiCatalogServiceMonitorRuns\ninstead. Requires a Postman Enterprise plan.\n';
export const parameters = z.object({
    serviceId: z.string().describe("The service's ID."),
    systemEnvironmentId: z.string().describe("The system environment's ID."),
    collectionId: z
        .string()
        .describe("Filter results to only the given collection ID's runs.")
        .optional(),
    environmentId: z
        .string()
        .describe('Filter results to only the given environment ID runs.')
        .optional(),
    status: z.enum(['passed', 'failed']).describe('Filter results by run status.').optional(),
    branch: z.string().max(255).describe('Filter results by the given Git branch name.').optional(),
    workflowName: z
        .string()
        .max(255)
        .describe('Filter results by the given CI workflow name.')
        .optional(),
    actor: z
        .string()
        .max(100)
        .describe('Filter results by the given CI user that triggered the run.')
        .optional(),
    repoName: z.string().max(255).describe('Filter results by the given repository name.').optional(),
    repoOwner: z
        .string()
        .max(100)
        .describe('Filter results by the given repository owner.')
        .optional(),
    sort: z
        .string()
        .regex(new RegExp('^(timestamp|duration):(asc|desc)$'))
        .describe('Sort the results in field:direction order format. Accepts the `timestamp` and `duration` fields. Supports the `asc` and `desc` directions.')
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
    title: "Get a service's CI runs",
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/api-catalog/services/${encodeURIComponent(String(args.serviceId))}/ci-runs`;
        const query = new URLSearchParams();
        if (args.systemEnvironmentId !== undefined)
            query.set('systemEnvironmentId', String(args.systemEnvironmentId));
        if (args.collectionId !== undefined)
            query.set('collectionId', String(args.collectionId));
        if (args.environmentId !== undefined)
            query.set('environmentId', String(args.environmentId));
        if (args.status !== undefined)
            query.set('status', String(args.status));
        if (args.branch !== undefined)
            query.set('branch', String(args.branch));
        if (args.workflowName !== undefined)
            query.set('workflowName', String(args.workflowName));
        if (args.actor !== undefined)
            query.set('actor', String(args.actor));
        if (args.repoName !== undefined)
            query.set('repoName', String(args.repoName));
        if (args.repoOwner !== undefined)
            query.set('repoOwner', String(args.repoOwner));
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
