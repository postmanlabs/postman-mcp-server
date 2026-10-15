import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'createApiCatalogSystemEnvironment';
export const title = 'Create an API Catalog system environment';
export const description = 'Creates a system environment for the team. \\`name\\` and \\`color\\` (a six-digit hex code\nsuch as \\`#00FF00\\`) are both required, and the name must be unique within the team — a\nduplicate returns 409. Optionally set \\`label\\` (lowercase alphanumerics, hyphens, and\nunderscores only), \\`description\\`, and \\`isProduction\\`.\nDo not use this tool to create a Postman environment with variables; use\ncreateEnvironment instead. Requires a Postman Enterprise plan.\n';
export const parameters = z.object({
    name: z
        .string()
        .min(1)
        .max(255)
        .describe("The system environment's name. This value must be unique within the team."),
    label: z
        .string()
        .regex(new RegExp('^[a-z0-9_-]+$'))
        .max(50)
        .describe('A lowercase, terminal-friendly identifier for the system environment. Accepts only alphanumeric characters, hyphens, and underscores.')
        .optional(),
    description: z
        .string()
        .max(500)
        .describe('A description of the system environment. To remove a description, pass this value as an empty string.')
        .optional(),
    color: z.string().regex(new RegExp('^#[0-9A-Fa-f]{6}$')).describe('A six-digit hex color code.'),
    isProduction: z
        .boolean()
        .describe('If true, the system environment is a production environment.')
        .default(false),
});
export const annotations = {
    title: 'Create an API Catalog system environment',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: false,
    idempotentHint: false,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/api-catalog/system-environments`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.name !== undefined)
            bodyPayload.name = args.name;
        if (args.label !== undefined)
            bodyPayload.label = args.label;
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
