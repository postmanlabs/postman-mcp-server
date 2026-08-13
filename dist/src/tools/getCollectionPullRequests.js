import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getCollectionPullRequests';
export const title = "Get a collection's pull requests";
export const description = "Lists the pull requests opened against a collection. Returns each pull request's\nID, title, status, and the source and destination collection details.\nUse this to discover open pull requests on a collection before reviewing or merging one.\n";
export const parameters = z.object({
    collectionId: z.string().describe("The collection's unique ID."),
});
export const annotations = {
    title: "Get a collection's pull requests",
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/collections/${encodeURIComponent(String(args.collectionId))}/pull-requests`;
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
