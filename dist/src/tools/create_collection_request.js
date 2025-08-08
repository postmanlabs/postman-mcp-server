import { z } from 'zod';
import { fetchPostmanAPI, ContentType } from '../clients/postman.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'create-collection-request';
export const description = 'Creates a request in a collection. For a complete list of properties, refer to the **Request** entry in the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).\n\n**Note:**\n\nIt is recommended that you pass the \\`name\\` property in the request body. If you do not, the system uses a null value. As a result, this creates a request with a blank name.\n';
export const parameters = z.object({
    collectionId: z.string().describe("The collection's ID."),
    folderId: z
        .string()
        .describe('The folder ID in which to create the request. By default, the system will create the request at the collection level.')
        .optional(),
    name: z
        .string()
        .describe("The request's name. It is recommended that you pass the `name` property in the request body. If you do not, the system uses a null value. As a result, this creates a request with a blank name.")
        .optional(),
});
export const annotations = {
    title: 'Creates a request in a collection. For a complete list of properties, refer to the **Request** entry in the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).\n\n**Note:**\n\nIt is recommended that you pass the \\`name\\` property in the request body. If you do not, the system uses a null value. As a result, this creates a request with a blank name.\n',
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
};
export async function handler(params, extra) {
    try {
        const endpoint = `/collections/${params.collectionId}/requests`;
        const query = new URLSearchParams();
        if (params.folderId !== undefined)
            query.set('folderId', String(params.folderId));
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (params.name !== undefined)
            bodyPayload.name = params.name;
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
