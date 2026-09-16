import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'updateComponent';
export const title = 'Update a component';
export const description = "Renames a component or changes its lifecycle status. Send \\`name\\` to rename, or\n\\`status\\` to archive (\\`archive\\`, making the component read-only while keeping its\npublished versions accessible) or restore it (\\`active\\`). Send only one of the two per\ncall: name and status cannot change together. Archived components cannot be renamed,\nedited, or published until they are set back to \\`active\\`.\nDo not use this tool to change a component's content; use updateComponentDraft instead.\nRequires a Postman Enterprise plan.\n";
export const parameters = z.object({
    componentId: z.string().describe("The component's ID."),
    name: z
        .string()
        .describe("The component's name. The new name must be unique within the team.")
        .optional(),
    status: z
        .enum(['active', 'archive'])
        .describe("The component's lifecycle state:\n- `active` — The component is active and can be edited and published.\n- `archive` — The component is archived and read-only. Archived components can't be edited or published, but their existing versions remain accessible.\n")
        .optional(),
});
export const annotations = {
    title: 'Update a component',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/components/${encodeURIComponent(String(args.componentId))}`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.name !== undefined)
            bodyPayload.name = args.name;
        if (args.status !== undefined)
            bodyPayload.status = args.status;
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
