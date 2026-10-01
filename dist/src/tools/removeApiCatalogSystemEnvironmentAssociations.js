import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'removeApiCatalogSystemEnvironmentAssociations';
export const title = 'Remove API Catalog system environment associations';
export const description = 'Detaches workspace environments from a system environment. Send 1 to 25\n\\`workspaceEnvironmentIds\\` per call, each an environment UID\n(\\`userId\\`-\\`environmentId\\`). This only removes the association — the underlying Postman\nenvironments are left intact.\nDo not use this tool to delete an environment; use deleteEnvironment instead. Requires\na Postman Enterprise plan.\n';
export const parameters = z.object({
    systemEnvironmentId: z.string().describe("The system environment's ID."),
    workspaceEnvironmentIds: z
        .array(z
        .string()
        .regex(new RegExp('^[0-9]+-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'))
        .describe("A workspace environment's unique ID (`userId`-`environmentId`)."))
        .min(1)
        .max(25)
        .describe('A list of workspace environment unique IDs (`userId`-`environmentId`).'),
});
export const annotations = {
    title: 'Remove API Catalog system environment associations',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: true,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/api-catalog/system-environments/${encodeURIComponent(String(args.systemEnvironmentId))}/associations`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.workspaceEnvironmentIds !== undefined)
            bodyPayload.workspaceEnvironmentIds = args.workspaceEnvironmentIds;
        const options = {
            body: JSON.stringify(bodyPayload),
            contentType: ContentType.Json,
            headers: extra.headers,
        };
        const result = await extra.client.delete(url, options);
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
