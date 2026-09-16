import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'updateApiCatalogSystemEnvironment';
export const title = 'Update a system environment';
export const description = "Updates a system environment's \\`name\\`, \\`description\\`, \\`color\\`, or \\`isProduction\\`. Send\nat least one field; omitted fields are left unchanged. A new name must stay unique\nwithin the team — a duplicate returns 409. Pass \\`description\\` as an empty string to\nclear it. \\`label\\` cannot be changed after creation.\nDo not use this tool to change which workspace environments are attached; use\naddApiCatalogSystemEnvironmentAssociations or\nremoveApiCatalogSystemEnvironmentAssociations instead. Requires a Postman Enterprise\nplan.\n";
export const parameters = z.object({
    systemEnvironmentId: z.string().describe("The system environment's ID."),
    name: z
        .string()
        .min(1)
        .max(255)
        .describe("The system environment's name. This value must be unique within the team.")
        .optional(),
    description: z
        .string()
        .max(500)
        .describe('A description of the system environment. To remove a description, pass this value as an empty string.')
        .optional(),
    color: z
        .string()
        .regex(new RegExp('^#[0-9A-Fa-f]{6}$'))
        .describe('A six-digit hex color code.')
        .optional(),
    isProduction: z
        .boolean()
        .describe('If true, the system environment is a production environment.')
        .optional(),
});
export const annotations = {
    title: 'Update a system environment',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        if ([args['name'], args['description'], args['color'], args['isProduction']].filter((value) => value !== undefined).length < 1) {
            throw new McpError(ErrorCode.InvalidParams, 'Request body must include at least 1 property.');
        }
        const endpoint = `/api-catalog/system-environments/${encodeURIComponent(String(args.systemEnvironmentId))}`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.name !== undefined)
            bodyPayload.name = args.name;
        if (args.description !== undefined)
            bodyPayload.description = args.description;
        if (args.color !== undefined)
            bodyPayload.color = args.color;
        if (args.isProduction !== undefined)
            bodyPayload.isProduction = args.isProduction;
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
