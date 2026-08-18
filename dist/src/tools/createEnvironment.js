import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'createEnvironment';
export const title = 'Create an environment';
export const description = "Creates an environment.\n\n**Note:**\n\n- The request body size cannot exceed the maximum allowed size of 30MB.\n- If you receive an HTTP \\`411 Length Required\\` error response, manually pass the \\`Content-Length\\` header and its value in the request header.\n- If you do not include the \\`workspace\\` query parameter, the system creates the environment in the oldest personal Internal workspace you own.\n- Only [shared variable](https://learning.postman.com/docs/use/send-requests/variables/variables/#share-variable-values) values can be modified through the Postman API. A shared variable is an environment variable with its value synced and stored in the Postman cloud, and can be accessed by your teammates in the environment's workspace.\n";
export const parameters = z.object({
    workspace: z.string().describe("The workspace's ID."),
    environment: z
        .object({
        name: z.string().describe("The environment's name."),
        values: z
            .array(z.union([
            z
                .object({
                enabled: z.boolean().describe('If true, the variable is enabled.').optional(),
                key: z.string().describe("The variable's name.").optional(),
                value: z.string().describe("The variable's value.").optional(),
                type: z
                    .enum(['secret', 'default'])
                    .describe("The variable's type:\n- `secret` — The variable value is masked.\n- `default` — The variable value is visible in plain text.\n")
                    .optional(),
                description: z.string().max(512).describe("The variable's description.").optional(),
            })
                .describe('Information about the variable.'),
            z
                .object({
                enabled: z.boolean().describe('If true, the variable is enabled.').optional(),
                key: z.string().describe("The variable's name.").optional(),
                value: z.string().describe("The variable's value.").optional(),
                type: z
                    .enum(['secret', 'default'])
                    .describe("The variable's type:\n- `secret` — The variable value is masked.\n- `default` — The variable value is visible in plain text.\n")
                    .optional(),
                secret: z
                    .boolean()
                    .describe('If true, the variable is marked as secret and its value is retrieved from the mentioned provider in the source field.')
                    .optional(),
                source: z
                    .object({
                    postman: z
                        .object({
                        secretId: z.string().describe("The variable's secret ID.").optional(),
                        type: z
                            .literal('cloud')
                            .describe("The variable's type:\n- `cloud` — The variable value is synced and stored in the Postman Cloud.\n")
                            .optional(),
                        vaultId: z
                            .string()
                            .describe("The variable's ID in the Postman Vault.")
                            .optional(),
                    })
                        .describe("Information about the Postman-specific source of the variable's value.")
                        .optional(),
                    provider: z.literal('postman').describe("The secret's provider.").optional(),
                })
                    .describe("Information about the source of the variable's value.")
                    .optional(),
                description: z.string().max(512).describe("The variable's description.").optional(),
            })
                .describe('Information about the variable stored in the Postman Vault. This property only returns when a variable is defined as secret.'),
        ]))
            .describe("Information about the environment's variables.")
            .optional(),
    })
        .describe('Information about the environment.')
        .optional(),
});
export const annotations = {
    title: 'Create an environment',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: false,
    idempotentHint: false,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/environments`;
        const query = new URLSearchParams();
        if (args.workspace !== undefined)
            query.set('workspace', String(args.workspace));
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.environment !== undefined)
            bodyPayload.environment = args.environment;
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
