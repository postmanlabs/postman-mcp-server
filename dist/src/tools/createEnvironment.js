import { z } from 'zod';
import { fetchPostmanAPI, ContentType } from '../clients/postman.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'createEnvironment';
export const description = 'Creates an environment.\n\n**Note:**\n\n- The request body size cannot exceed the maximum allowed size of 30MB.\n- If you receive an HTTP \\`411 Length Required\\` error response, manually pass the \\`Content-Length\\` header and its value in the request header.\n- If you do not include the \\`workspace\\` query parameter, the system creates the environment in the oldest personal Internal workspace you own.\n';
export const parameters = z.object({
    workspace: z.string().describe("The workspace's ID."),
    environment: z
        .object({
        name: z.string().describe("The environment's name."),
        values: z
            .array(z.object({
            enabled: z.boolean().describe('If true, the variable is enabled.').optional(),
            key: z.string().describe("The variable's name.").optional(),
            value: z.string().describe("The variable's value.").optional(),
            type: z.enum(['secret', 'default']).describe('The variable type.').optional(),
        }))
            .describe("Information about the environment's variables.")
            .optional(),
    })
        .describe('Information about the environment.')
        .optional(),
});
export const annotations = {
    title: 'Creates an environment.\n\n**Note:**\n\n- The request body size cannot exceed the maximum allowed size of 30MB.\n- If you receive an HTTP \\`411 Length Required\\` error response, manually pass the \\`Content-Length\\` header and its value in the request header.\n- If you do not include the \\`workspace\\` query parameter, the system creates the environment in the oldest personal Internal workspace you own.\n',
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
};
export async function handler(params, extra) {
    try {
        const endpoint = `/environments`;
        const query = new URLSearchParams();
        if (params.workspace !== undefined)
            query.set('workspace', String(params.workspace));
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (params.environment !== undefined)
            bodyPayload.environment = params.environment;
        const result = await fetchPostmanAPI(url, {
            method: 'POST',
            body: JSON.stringify(bodyPayload),
            contentType: ContentType.Json,
            apiKey: extra.apiKey,
            headers: extra.headers,
        });
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
