import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'pullEnvironment';
export const title = 'Pull changes into an environment fork';
export const description = "Pulls a parent environment's changes down into a fork. The path holds the fork being\nupdated and \\`source\\` holds the parent environment's unique ID — this direction leaves\nthe parent untouched. Use it to bring a fork back up to date before merging, which\nkeeps the merge from overwriting newer parent values.\nTo send a fork's changes up to the parent, use mergeEnvironmentFork instead.\n";
export const parameters = z.object({
    environmentUid: z.string().describe("The destination environment's unique ID."),
    source: z.string().describe("The source environment's unique ID to pull data from."),
});
export const annotations = {
    title: 'Pull changes into an environment fork',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: false,
    idempotentHint: false,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/environments/${encodeURIComponent(String(args.environmentUid))}/pulls`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.source !== undefined)
            bodyPayload.source = args.source;
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
