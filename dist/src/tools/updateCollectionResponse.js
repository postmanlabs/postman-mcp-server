import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { McpError, ErrorCode, } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'updateCollectionResponse';
export const description = 'Updates a response in a collection. For a complete list of properties, see the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).\n\n**Note:**\n\n- You must pass a collection ID (\\`12ece9e1-2abf-4edc-8e34-de66e74114d2\\`), not a collection UID (\\`12345678-12ece9e1-2abf-4edc-8e34-de66e74114d2\\`), in this endpoint.\n- This endpoint acts like a PATCH method. It only updates the values that you pass in the request body (for example, the \\`name\\` property). The endpoint does not update the entire resource.\n';
export const parameters = z.object({
    responseId: z.string().describe("The response's ID."),
    collectionId: z.string().describe("The collection's ID."),
    name: z.string().describe("The response's name.").optional(),
    responseCode: z
        .object({
        code: z.number().describe("The response's HTTP response status code.").optional(),
        name: z.string().describe('The name of the status code.').optional(),
    })
        .describe("The response's HTTP response code information.")
        .optional(),
});
export const annotations = {
    title: 'Updates a response in a collection. For a complete list of properties, see the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).\n\n**Note:**\n\n- You must pass a collection ID (\\`12ece9e1-2abf-4edc-8e34-de66e74114d2\\`), not a collection UID (\\`12345678-12ece9e1-2abf-4edc-8e34-de66e74114d2\\`), in this endpoint.\n- This endpoint acts like a PATCH method. It only updates the values that you pass in the request body (for example, the \\`name\\` property). The endpoint does not update the entire resource.\n',
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/collections/${args.collectionId}/responses/${args.responseId}`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.name !== undefined)
            bodyPayload.name = args.name;
        if (args.responseCode !== undefined)
            bodyPayload.responseCode = args.responseCode;
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
