import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'reviewPullRequest';
export const title = 'Review a pull request';
export const description = 'Reviews a pull request by performing an action on it. The required \\`action\\` field\ndetermines the outcome:\n  - \\`approve\\`  — approve the pull request for merge.\n  - \\`merge\\`    — merge the pull request into its destination (parent) collection.\n  - \\`decline\\`  — decline the pull request; optionally include a \\`comment\\` explaining why.\n  - \\`unapprove\\` — revoke a previous \\`approve\\` (does not decline the pull request).\nUse this tool to formally approve, merge, decline, or unapprove a pull request.\n';
export const parameters = z.object({
    pullRequestId: z.string().describe("The pull request's ID."),
    action: z
        .enum(['approve', 'decline', 'merge', 'unapprove'])
        .describe("The action to perform on the pull request:\n- `approve` — Approve the pull request for merge.\n- `decline` — Decline the pull request.\n- `merge` — Merge the pull request into its parent element.\n- `unapprove` — Revokes a pull request's `approve` status. This action does not decline the pull request.\n"),
    comment: z
        .string()
        .describe('If the pull request is a `decline` status, an optoinal comment about why the pull request was declined.')
        .optional(),
});
export const annotations = {
    title: 'Review a pull request',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: false,
    idempotentHint: false,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/pull-requests/${encodeURIComponent(String(args.pullRequestId))}/tasks`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.action !== undefined)
            bodyPayload.action = args.action;
        if (args.comment !== undefined)
            bodyPayload.comment = args.comment;
        const options = {
            body: JSON.stringify(bodyPayload),
            contentType: ContentType.Json,
            headers: extra.headers,
        };
        const result = await extra.client.post(url, options);
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
