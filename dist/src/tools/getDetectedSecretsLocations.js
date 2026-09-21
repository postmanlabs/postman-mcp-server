import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getDetectedSecretsLocations';
export const title = 'Get detected secrets locations';
export const description = 'Lists where one detected secret appears — the workspaces and resources holding it. Use\nthis after detectedSecretsQueries to turn a secret ID into the concrete places a person\nhas to go and fix. Requires a \\`workspaceId\\`, and can be narrowed further with\n\\`resourceType\\` and a \\`since\\`/\\`until\\` window.\nDo not use this tool to search for secrets across the team; use detectedSecretsQueries\ninstead. Requires a Postman Enterprise plan.\n';
export const parameters = z.object({
    secretId: z.string().describe("The secret's ID."),
    limit: z
        .number()
        .int()
        .describe('The maximum number of rows to return in the response.')
        .default(10),
    cursor: z
        .string()
        .describe('The pointer to the first record of the set of paginated results. To view the next response, use the `nextCursor` value for this parameter.')
        .optional(),
    workspaceId: z.string().describe("The workspace's ID."),
    since: z
        .string()
        .datetime({ offset: true })
        .describe('Return only results created since the given time, in [ISO 8601](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6) format. This value cannot be later than the `until` value. To use `time-numoffset` format, you must use `%2B` URL-encoding for the `+` character.')
        .optional(),
    until: z
        .string()
        .datetime({ offset: true })
        .describe('Return only results created until this given time, in [ISO 8601](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6) format. This value cannot be earlier than the `since` value. To use `time-numoffset` format, you must use `%2B` URL-encoding for the `+` character.')
        .optional(),
    resourceType: z
        .enum([
        'collection',
        'environment',
        'extensible-collection',
        'globals',
        'example',
        'request',
        'folder',
        'extensible-collection-meta',
        'extensible-request',
        'extensible-folder',
        'extensible-example',
        'extensible-message',
    ])
        .describe('Return only results that match the given resource type.')
        .optional(),
});
export const annotations = {
    title: 'Get detected secrets locations',
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/detected-secrets/${encodeURIComponent(String(args.secretId))}/locations`;
        const query = new URLSearchParams();
        if (args.limit !== undefined)
            query.set('limit', String(args.limit));
        if (args.cursor !== undefined)
            query.set('cursor', String(args.cursor));
        if (args.workspaceId !== undefined)
            query.set('workspaceId', String(args.workspaceId));
        if (args.since !== undefined)
            query.set('since', String(args.since));
        if (args.until !== undefined)
            query.set('until', String(args.until));
        if (args.resourceType !== undefined)
            query.set('resourceType', String(args.resourceType));
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
