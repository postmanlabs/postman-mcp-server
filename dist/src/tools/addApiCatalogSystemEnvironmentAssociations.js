import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'addApiCatalogSystemEnvironmentAssociations';
export const title = 'Add system environment associations';
export const description = 'Attaches workspace environments to a system environment. Send 1 to 25\n\\`workspaceEnvironmentIds\\` per call, each an environment UID\n(\\`userId\\`-\\`environmentId\\`). \\`allowPartial=false\\` rejects the whole\ncall if any single association is ineligible, while \\`allowPartial=true\\` adds the\neligible ones and skips the rest — prefer \\`false\\` unless you intend to accept a\npartial result, and read the response to see which were skipped.\nDo not use this tool to create the environments themselves; use createEnvironment\nfirst. Requires a Postman Enterprise plan.\n';
export const parameters = z.object({
    systemEnvironmentId: z.string().describe("The system environment's ID."),
    allowPartial: z
        .boolean()
        .describe('If false, the system only adds associations when there are no status errors. If true, the system skips any ineligible associations and adds eligible associations.')
        .default(false),
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
    title: 'Add system environment associations',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: false,
    idempotentHint: false,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/api-catalog/system-environments/${encodeURIComponent(String(args.systemEnvironmentId))}/associations`;
        const query = new URLSearchParams();
        if (args.allowPartial !== undefined)
            query.set('allowPartial', String(args.allowPartial));
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.workspaceEnvironmentIds !== undefined)
            bodyPayload.workspaceEnvironmentIds = args.workspaceEnvironmentIds;
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
