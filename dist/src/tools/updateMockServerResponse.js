import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'updateMockServerResponse';
export const description = "Updates a server response's name, statusCode, body, headers, or language.\n\n- \\`statusCode\\` must remain a 5xx value (500–599).\n- \\`body\\` is the raw response body string. Pass the full desired body — this is a full replacement, not a partial update.\n- Updating a server response does not change which response is active. To activate it, call \\`updateMock\\` with \\`config.serverResponseId\\`.\n";
export const parameters = z.object({
    mockId: z.string().describe("The mock's ID."),
    serverResponseId: z.string().describe("The server response's ID."),
    serverResponse: z
        .object({
        name: z.string().describe("The server response's name.").optional(),
        statusCode: z
            .number()
            .int()
            .gte(500)
            .lte(599)
            .describe('The HTTP status code the mock returns. Must be a 5xx value (500–599).')
            .optional(),
        headers: z
            .array(z
            .object({
            key: z.string().describe("The request header's key value.").optional(),
            value: z
                .string()
                .describe("The request header's value. This value defines the corresponding value for the header key.")
                .optional(),
        })
            .describe('Information about the key-value pair.'))
            .describe("The server response's request headers, such as Content-Type, Accept, encoding, and other information.")
            .optional(),
        language: z
            .enum(['text', 'javascript', 'json', 'html', 'xml'])
            .nullable()
            .describe("The server response's body language type.")
            .optional(),
        body: z
            .string()
            .describe("The server response's body that returns when you call the mock server.")
            .optional(),
    })
        .optional(),
});
export const annotations = {
    title: "Updates a server response's name, statusCode, body, headers, or language.",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/mocks/${args.mockId}/server-responses/${args.serverResponseId}`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.serverResponse !== undefined)
            bodyPayload.serverResponse = args.serverResponse;
        const options = {
            body: JSON.stringify(bodyPayload),
            contentType: ContentType.Json,
            headers: extra.headers,
        };
        const result = await extra.client.put(url, options);
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
