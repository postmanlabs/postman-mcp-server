import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'updateComponentDraft';
export const title = 'Update a component draft';
export const description = "Updates a component's working draft content, format, or both. Include at least one\nfield; omitted fields remain unchanged. Edits are not visible to teammates referencing\nthe component until you publish them with createComponentVersion. Archived components\ncannot be edited — restore them with updateComponent first.\nDo not use this tool to publish changes; use createComponentVersion instead.\nRequires a Postman Enterprise plan.\n";
export const parameters = z.object({
    componentId: z.string().describe("The component's ID."),
    content: z
        .string()
        .describe("The component's contents, up to a maximum of 500 KB (UTF-8).")
        .optional(),
    format: z
        .preprocess((v) => (typeof v === 'string' ? v.toUpperCase() : v), z.enum(['JSON', 'YAML']))
        .describe("The component's content format.")
        .optional(),
});
export const annotations = {
    title: 'Update a component draft',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        if ([args['content'], args['format']].filter((value) => value !== undefined).length < 1) {
            throw new McpError(ErrorCode.InvalidParams, 'Request body must include at least 1 property.');
        }
        const endpoint = `/components/${encodeURIComponent(String(args.componentId))}/drafts`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.content !== undefined)
            bodyPayload.content = args.content;
        if (args.format !== undefined)
            bodyPayload.format = args.format;
        const options = {
            body: JSON.stringify(bodyPayload),
            contentType: ContentType.Json,
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
