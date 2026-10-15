import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'createRuleset';
export const title = 'Create a ruleset';
export const description = 'Creates a custom governance ruleset for the team. \\`content\\` is the full ruleset\ndefinition (for the \\`spectral\\` engine, a Spectral ruleset document as a string, up to\n500 KB). \\`name\\` must be unique within the team and may only contain letters, numbers,\nhyphens, underscores, and periods. A new ruleset governs nothing until it is assigned\nto a governance group with createRulesetAssignment. If the ruleset calls custom\nfunctions, create them first with createCustomFunction.\n';
export const parameters = z.object({
    name: z
        .string()
        .regex(new RegExp('^[a-zA-Z0-9_.-]+$'))
        .max(255)
        .describe("The ruleset's name. Must be unique within the team and only contain letters, numbers, hyphens, underscores, and periods."),
    description: z.string().max(1000).describe("The ruleset's description."),
    engine: z.literal('spectral').describe('The governance engine that runs the ruleset.'),
    format: z.enum(['spectral', 'workspace']).describe('The type of resource the ruleset governs.'),
    content: z.string().describe("The ruleset's content, up to a maximum of 500 KB (UTF-8)."),
});
export const annotations = {
    title: 'Create a ruleset',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: false,
    idempotentHint: false,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/rulesets`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.name !== undefined)
            bodyPayload.name = args.name;
        if (args.description !== undefined)
            bodyPayload.description = args.description;
        if (args.engine !== undefined)
            bodyPayload.engine = args.engine;
        if (args.format !== undefined)
            bodyPayload.format = args.format;
        if (args.content !== undefined)
            bodyPayload.content = args.content;
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
