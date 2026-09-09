import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getSdkGitConnections';
export const title = 'Get all SDK Git connections';
export const description = 'Lists the Git repository connections in a workspace. Each connection ties one collection\nor specification, in one SDK language, to one target repository, so a source with\nseveral languages has several connections. \\`workspaceId\\` is required. Filter with\n\\`sourceId\\`, \\`language\\`, \\`status\\`, and \\`repositoryUrl\\`.\nRequires a Postman Team or Enterprise plan.\n';
export const parameters = z.object({
    workspaceId: z.string().describe('The ID of the workspace that owns the source entities.'),
    sourceId: z
        .string()
        .describe('Filter results by the originating Postman Collection or specification ID.')
        .optional(),
    language: z
        .enum(['typescript', 'python', 'go', 'java', 'csharp', 'ruby', 'php', 'kotlin', 'rust', 'cli'])
        .describe('Filter results by SDK language.')
        .optional(),
    status: z
        .enum(['active', 'disconnected', 'inaccessible'])
        .describe('Filter results by connection status.')
        .optional(),
    repositoryUrl: z
        .string()
        .url()
        .describe('Filter results by the canonical URL of the target Git repository.')
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
    title: 'Get all SDK Git connections',
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/sdk-git-connections`;
        const query = new URLSearchParams();
        if (args.workspaceId !== undefined)
            query.set('workspaceId', String(args.workspaceId));
        if (args.sourceId !== undefined)
            query.set('sourceId', String(args.sourceId));
        if (args.language !== undefined)
            query.set('language', String(args.language));
        if (args.status !== undefined)
            query.set('status', String(args.status));
        if (args.repositoryUrl !== undefined)
            query.set('repositoryUrl', String(args.repositoryUrl));
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
