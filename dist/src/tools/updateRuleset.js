import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'updateRuleset';
export const title = 'Update a ruleset';
export const description = "Updates a custom ruleset's name, description, or content. Only the fields you send\nchange, but \\`content\\` replaces the entire ruleset rather than merging rules, so read\nthe current content with getRuleset (\\`include=content\\`) and send the full edited\ndocument. Changes take effect for every governance group the ruleset is assigned to.\nPostman-managed rulesets (\\`type: system\\`) can't be updated and return 403.\n";
export const parameters = z.object({
    rulesetId: z.string().describe("The ruleset's ID."),
    name: z
        .string()
        .regex(new RegExp('^[a-zA-Z0-9_.-]+$'))
        .max(255)
        .describe("The ruleset's name.")
        .optional(),
    description: z.string().max(1000).describe("The ruleset's description.").optional(),
    content: z
        .string()
        .describe("The ruleset's content, up to a maximum of 500 KB (UTF-8).")
        .optional(),
});
export const annotations = {
    title: 'Update a ruleset',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        if ([args['name'], args['description'], args['content']].filter((value) => value !== undefined)
            .length < 1) {
            throw new McpError(ErrorCode.InvalidParams, 'Request body must include at least 1 property.');
        }
        const endpoint = `/rulesets/${encodeURIComponent(String(args.rulesetId))}`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.name !== undefined)
            bodyPayload.name = args.name;
        if (args.description !== undefined)
            bodyPayload.description = args.description;
        if (args.content !== undefined)
            bodyPayload.content = args.content;
        const options = {
            body: JSON.stringify(bodyPayload),
            contentType: ContentType.JsonMergePatch,
            headers: extra.headers,
        };
        const result = await extra.client.patch(url, options);
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
