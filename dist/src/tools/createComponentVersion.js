import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'createComponentVersion';
export const title = 'Create a component version';
export const description = "Publishes the component's current draft as a new immutable version under the \\`label\\`\nyou supply, making it referenceable by the team's specifications. Labels must be\nunique per component. Publishing cannot be undone and the resulting version cannot be\nedited — publish another version to supersede it. Archived components cannot be\npublished; restore them with updateComponent first.\nDo not use this tool to save work in progress; use updateComponentDraft instead.\nRequires a Postman Enterprise plan.\n";
export const parameters = z.object({
    componentId: z.string().describe("The component's ID."),
    label: z
        .string()
        .regex(new RegExp('^[a-zA-Z0-9]([a-zA-Z0-9._+-]{0,58}[a-zA-Z0-9])?$'))
        .min(1)
        .max(60)
        .describe("The component version's label. This must begin and end with an alphanumeric character and may only contain letters, digits, dots, underscores, plus signs, and hyphens and cannot exceed 60 characters."),
    source: z
        .object({ type: z.literal('draft').describe('The `draft` value.').optional() })
        .strict()
        .describe("The source to publish the version from. Defaults to the component's current draft.")
        .optional(),
});
export const annotations = {
    title: 'Create a component version',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: false,
    idempotentHint: false,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/components/${encodeURIComponent(String(args.componentId))}/versions`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.label !== undefined)
            bodyPayload.label = args.label;
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
