import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'updateMock';
export const description = 'Updates a mock server.';
export const parameters = z.object({
    mockId: z.string().describe("The mock's ID."),
    mock: z
        .object({
        name: z.string().describe("The mock server's name.").optional(),
        environment: z.string().describe("The associated environment's unique ID.").optional(),
        description: z.string().describe("The mock server's description.").optional(),
        private: z
            .boolean()
            .describe('If true, the mock server is set private. By default, mock servers are public and can receive requests from anyone and anywhere.')
            .default(false),
        versionTag: z.string().describe("The API's version tag ID.").optional(),
        config: z
            .object({
            serverResponseId: z
                .string()
                .nullable()
                .describe('The server response ID. This sets the given server response as the default response for each request. To deactivate a server response, pass a null value.')
                .optional(),
        })
            .describe("The mock server's configuration settings.")
            .optional(),
    })
        .optional(),
});
export const annotations = {
    title: 'Updates a mock server.',
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(params, extra) {
    try {
        const endpoint = `/mocks/${params.mockId}`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (params.mock !== undefined)
            bodyPayload.mock = params.mock;
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
