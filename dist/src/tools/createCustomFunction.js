import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'createCustomFunction';
export const title = 'Create a custom function';
export const description = "Creates a custom Spectral function that rulesets can call. \\`path\\` must be\n\\`functions/<name>.js\\`, where the name is at least two characters and starts with a\nletter, underscore, or dollar sign; nested paths aren't supported. \\`content\\` is the\nfunction's JavaScript source, up to 500 KB.\n";
export const parameters = z.object({
    path: z
        .string()
        .regex(new RegExp('^functions/[a-zA-Z_$][a-zA-Z0-9_$]+\\.js$'))
        .max(512)
        .describe("The custom function's path, in the form `functions/<name>.js`. Root-level paths and nested paths are not supported. The name must be at least two characters, start with a letter, underscore, or dollar sign, and contain only letters, numbers, underscores, and dollar signs."),
    description: z.string().max(255).describe("The custom function's description.").optional(),
    content: z.string().describe("The custom function's content, up to a maximum of 500 KB (UTF-8)."),
});
export const annotations = {
    title: 'Create a custom function',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: false,
    idempotentHint: false,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/custom-functions`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.path !== undefined)
            bodyPayload.path = args.path;
        if (args.description !== undefined)
            bodyPayload.description = args.description;
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
