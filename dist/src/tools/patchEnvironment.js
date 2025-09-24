import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { McpError, ErrorCode, } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'patchEnvironment';
export const description = 'Updates specific environment properties, such as its name and variables.\n\n**Note:**\n\n- You can only perform one type of operation at a time. For example, you cannot perform an \\`add\\` and \\`replace\\` operation in the same call.\n- The request body size cannot exceed the maximum allowed size of 30MB.\n- If you receive an HTTP \\`411 Length Required\\` error response, manually pass the \\`Content-Length\\` header and its value in the request header.\n- To add a description to an existing variable, use the \\`add\\` operation.\n';
export const parameters = z.object({
    environmentId: z.string().describe("The environment's ID."),
    body: z.union([
        z.array(z.object({
            op: z.string().describe('The `add` operation.'),
            path: z
                .string()
                .describe('The [JSON Pointer syntax](https://datatracker.ietf.org/doc/html/rfc6901) that indicates the entry to update, in `/values/#` format, where `#` is the entry ID. The first record begins at the `0` value.'),
            value: z
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
                .describe("Information about the environment's variables."),
        })),
        z.array(z
            .object({
            op: z.string().describe('The `replace` operation.'),
            path: z.string().describe('The `/name` value.'),
            value: z.string().describe("The environment's updated name."),
        })
            .describe('Information about the environment.')),
        z.array(z.object({
            op: z.string().describe('The `replace` operation.'),
            path: z
                .string()
                .describe('The [JSON Pointer syntax](https://datatracker.ietf.org/doc/html/rfc6901) that indicates the entry to update, in `/values/#/{value}` format, where:\n- `#` — The entry ID. The first record begins at the `0` value.\n- `{value}` — The variable property to update. Accepts `key`, `value`, `type`, and `enable`.\n'),
            value: z.string().describe("The variable's value."),
        })),
        z.array(z.object({
            op: z.string().describe('The `remove` operation.'),
            path: z
                .string()
                .describe('The [JSON Pointer syntax](https://datatracker.ietf.org/doc/html/rfc6901) that indicates the entry to update, in `/values/#` format, where `#` is the entry ID. The first record begins at the `0` value.'),
        })),
    ]),
});
export const annotations = {
    title: 'Updates specific environment properties, such as its name and variables.\n\n**Note:**\n\n- You can only perform one type of operation at a time. For example, you cannot perform an \\`add\\` and \\`replace\\` operation in the same call.\n- The request body size cannot exceed the maximum allowed size of 30MB.\n- If you receive an HTTP \\`411 Length Required\\` error response, manually pass the \\`Content-Length\\` header and its value in the request header.\n- To add a description to an existing variable, use the \\`add\\` operation.\n',
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/environments/${args.environmentId}`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = args.body;
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
