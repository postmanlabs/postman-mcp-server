import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getSdks';
export const title = 'Get all SDKs';
export const description = "Lists the SDKs the caller can see in a workspace, with each one's build status.\n\\`workspaceId\\` is required. Filter with \\`buildStatus\\`, \\`language\\`, and \\`sourceId\\`, or\npass \\`sdkIds\\` (up to 100, comma-separated) to check several known SDKs at once — note\nthat \\`sdkIds\\` overrides every other filter. Page with \\`limit\\` and \\`cursor\\`.\nUse \\`sdkIds\\` here rather than calling getSdk in a loop when you are polling more than\none generation job. Requires a Postman Team or Enterprise plan.\n";
export const parameters = z.object({
    workspaceId: z.string().describe('The ID of the workspace that contains the SDK.'),
    sdkIds: z
        .array(z.string().describe("The SDK's ID."))
        .max(100)
        .describe('A comma-separated list of SDK IDs to return in the response. If you pass this query parameter with other filters, the other filters are ignored.')
        .optional(),
    buildStatus: z
        .enum(['queued', 'in_progress', 'succeeded', 'failed'])
        .describe('Filter results by build status.')
        .optional(),
    language: z
        .enum(['typescript', 'python', 'go', 'java', 'csharp', 'ruby', 'php', 'kotlin', 'rust', 'cli'])
        .describe('Filter results by SDK language.')
        .optional(),
    sourceId: z
        .string()
        .describe('Filter results by the originating Postman Collection or specification ID.')
        .optional(),
    cursor: z
        .string()
        .describe('The pointer to the first record of the set of paginated results. To view the next response, use the `nextCursor` value for this parameter.')
        .optional(),
    limit: z
        .number()
        .int()
        .lte(25)
        .describe('The maximum number of rows to return in the response, up to a maximum value of 25. Any value greater than 25 returns a 400 Bad Request response.')
        .default(25),
});
export const annotations = {
    title: 'Get all SDKs',
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/sdks`;
        const query = new URLSearchParams();
        if (args.workspaceId !== undefined)
            query.set('workspaceId', String(args.workspaceId));
        if (args.sdkIds !== undefined)
            query.set('sdkIds', String(args.sdkIds));
        if (args.buildStatus !== undefined)
            query.set('buildStatus', String(args.buildStatus));
        if (args.language !== undefined)
            query.set('language', String(args.language));
        if (args.sourceId !== undefined)
            query.set('sourceId', String(args.sourceId));
        if (args.cursor !== undefined)
            query.set('cursor', String(args.cursor));
        if (args.limit !== undefined)
            query.set('limit', String(args.limit));
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
