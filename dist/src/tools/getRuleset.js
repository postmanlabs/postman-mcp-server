import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getRuleset';
export const title = 'Get a ruleset';
export const description = "Gets a governance ruleset's metadata by ID. Pass \\`include=content\\` to also return the\nruleset's rule content, which is required before editing it with updateRuleset.\n";
export const parameters = z.object({
    rulesetId: z.string().describe("The ruleset's ID."),
    include: z
        .literal('content')
        .describe("The related fields to include in the response. Currently only `content` is supported. Omit this parameter to receive only the resource's metadata.")
        .optional(),
});
export const annotations = {
    title: 'Get a ruleset',
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/rulesets/${encodeURIComponent(String(args.rulesetId))}`;
        const query = new URLSearchParams();
        if (args.include !== undefined)
            query.set('include', String(args.include));
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
