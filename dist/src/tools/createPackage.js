import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'createPackage';
export const title = 'Create a package';
export const description = 'Creates a Postman Package Library package and its initial index script.\nUse this when you want to add reusable JavaScript functions, tests, or utilities\nfor a team to import into Postman scripts. A workspace ID is required to identify\nthe workspace where the package is created.\nDo not use this tool to modify an existing package; use updatePackage instead.\n';
export const parameters = z.object({
    workspace: z.string().describe("The workspace's ID."),
    name: z
        .string()
        .regex(new RegExp('^[a-zA-Z][a-zA-Z0-9_-]*$'))
        .min(1)
        .max(200)
        .describe("The package's import name. The service stores this value in lowercase."),
    description: z
        .string()
        .regex(new RegExp('^[ -~]*$'))
        .max(500)
        .describe("The package's description. This value may be empty and only supports printable ASCII characters.")
        .default(''),
    script: z
        .string()
        .max(512000)
        .describe("The package's initial index script content. This value may be empty.")
        .default(''),
});
export const annotations = {
    title: 'Create a package',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: false,
    idempotentHint: false,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/packages`;
        const query = new URLSearchParams();
        if (args.workspace !== undefined)
            query.set('workspace', String(args.workspace));
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.name !== undefined)
            bodyPayload.name = args.name;
        if (args.description !== undefined)
            bodyPayload.description = args.description;
        if (args.script !== undefined)
            bodyPayload.script = args.script;
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
