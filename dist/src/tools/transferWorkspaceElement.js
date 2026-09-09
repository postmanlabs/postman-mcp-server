import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'transferWorkspaceElement';
export const title = 'Transfer element to a workspace';
export const description = "Moves or copies an element — a collection, environment, mock, monitor, or Flows module or\naction — from one workspace into another. Both workspaces' activity feeds record the\nchange.\nTransferring changes who can see the element, since access follows the destination\nworkspace. Team workspaces cannot transfer into personal workspaces. To duplicate a\ncollection without moving it, use duplicateCollection instead.\n";
export const parameters = z.object({
    workspaceId: z.string().describe("The workspace's ID."),
    id: z.union([z.string(), z.string()]).describe("The workspace element's ID."),
    type: z
        .enum(['collection', 'environment', 'api', 'flow', 'mock', 'monitor'])
        .describe('The type of element to transfer.'),
    to: z.string().describe('The workspace ID to transfer the element into.'),
});
export const annotations = {
    title: 'Transfer element to a workspace',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: false,
    idempotentHint: false,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/workspaces/${encodeURIComponent(String(args.workspaceId))}/element-transfers`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.id !== undefined)
            bodyPayload.id = args.id;
        if (args.type !== undefined)
            bodyPayload.type = args.type;
        if (args.to !== undefined)
            bodyPayload.to = args.to;
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
