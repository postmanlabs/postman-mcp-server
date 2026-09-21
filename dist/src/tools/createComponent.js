import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'createComponent';
export const title = 'Create a component';
export const description = "Creates a component in the team's component library and seeds its first draft with\nthe content you provide. Use this when a team wants a reusable schema, parameter,\nresponse, or security scheme that specifications can reference instead of redefining.\nThe component starts active and unpublished: the content lands in its draft only.\nCall createComponentVersion afterwards to publish it and make it referenceable.\nDo not use this tool to edit an existing component's content; use updateComponentDraft\ninstead. Requires a Postman Enterprise plan.\n";
export const parameters = z.object({
    name: z
        .string()
        .regex(new RegExp('^[a-zA-Z0-9\\-_.]+$'))
        .min(1)
        .max(60)
        .describe("The component's name. This must be unique within the team and can only contain letters, digits, hyphens, underscores, and periods and can't exceed 60 characters."),
    type: z
        .preprocess((v) => (typeof v === 'string' ? v.toUpperCase() : v), z.enum(['OAS2', 'OAS3', 'OAS3_1']))
        .describe("The component's type. Corresponds to the specification that the component's content adheres to."),
    content: z.string().describe("The component's content, up to a maximum of 500 KB (UTF-8)."),
    format: z
        .preprocess((v) => (typeof v === 'string' ? v.toUpperCase() : v), z.enum(['JSON', 'YAML']))
        .describe("The component's content format. Defaults to YAML.")
        .default('YAML'),
});
export const annotations = {
    title: 'Create a component',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: false,
    idempotentHint: false,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/components`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.name !== undefined)
            bodyPayload.name = args.name;
        if (args.type !== undefined)
            bodyPayload.type = args.type;
        if (args.content !== undefined)
            bodyPayload.content = args.content;
        if (args.format !== undefined)
            bodyPayload.format = args.format;
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
