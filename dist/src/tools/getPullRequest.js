import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getPullRequest';
export const title = 'Get a pull request';
export const description = 'Gets a single pull request by its ID, including source and destination details,\nreviewers, and the current merge/review status. Use this to inspect a specific\npull request returned by getCollectionPullRequests.\n';
export const parameters = z.object({
    pullRequestId: z.string().describe("The pull request's ID."),
});
export const annotations = {
    title: 'Get a pull request',
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/pull-requests/${encodeURIComponent(String(args.pullRequestId))}`;
        const query = new URLSearchParams();
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
