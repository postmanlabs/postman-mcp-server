import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
const requestAuthSchema = z.array(z
    .object({
    key: z.string().describe("The auth method's key value."),
    value: z.unknown().describe("The key's value.").optional(),
    type: z
        .enum(['string', 'boolean', 'number', 'array', 'object', 'any'])
        .describe("The value's type.")
        .optional(),
})
    .passthrough());
const requestSchema = z
    .object({
    name: z.string().describe("The request's name.").optional(),
    description: z
        .string()
        .nullable()
        .describe("The request's description, in markdown format.")
        .optional(),
    method: z
        .enum([
        'GET',
        'PUT',
        'POST',
        'PATCH',
        'DELETE',
        'COPY',
        'HEAD',
        'OPTIONS',
        'LINK',
        'UNLINK',
        'PURGE',
        'LOCK',
        'UNLOCK',
        'PROPFIND',
        'VIEW',
    ])
        .describe("The request's standard HTTP method.")
        .optional()
        .nullable(),
    url: z.string().nullable().describe("The request's raw URL.").optional(),
    headerData: z
        .array(z
        .object({
        key: z
            .string()
            .describe("The header's key, such as `Content-Type` or `X-Custom-Header`."),
        value: z.string().describe("The header key's value."),
        description: z.string().nullable().describe("The header's description.").optional(),
    })
        .passthrough())
        .describe('A list of headers.')
        .optional(),
    queryParams: z
        .array(z
        .object({
        key: z.string().describe("The query parameter's key."),
        value: z.string().describe("The query parameter's value."),
        description: z
            .string()
            .nullable()
            .describe("The query parameter's description.")
            .optional(),
        enabled: z
            .boolean()
            .describe('If false, the query parameter is not sent with the request.')
            .optional(),
    })
        .passthrough())
        .describe('A list of query parameters.')
        .optional(),
    dataMode: z
        .enum(['raw', 'urlencoded', 'formdata', 'binary', 'graphql'])
        .describe('The data associated with the request.')
        .optional()
        .nullable(),
    data: z
        .array(z
        .object({
        key: z.string().describe('The key value.'),
        value: z.string().describe("The key's value.").optional(),
        description: z.string().nullable().describe("The key's description.").optional(),
        enabled: z
            .boolean()
            .describe('If false, the key/value pair is not sent with the request.')
            .optional(),
        type: z
            .enum(['text', 'file'])
            .describe('The type of the value (for `formdata` mode).')
            .optional(),
        uuid: z.string().describe('The UUID of the file (for `formdata` mode).').optional(),
    })
        .passthrough())
        .describe('A list of key/value pairs.')
        .optional()
        .nullable(),
    rawModeData: z
        .string()
        .describe('If the `dataMode` value is `raw` or `binary`, the raw content of the request body.')
        .optional()
        .nullable(),
    graphqlModeData: z
        .object({
        query: z.string().describe('The GraphQL query.').optional(),
        variables: z
            .string()
            .describe('Variables to use in the GraphQL query, in JSON format.')
            .optional(),
    })
        .passthrough()
        .describe('The GraphQL request data.')
        .optional()
        .nullable(),
    dataOptions: z
        .object({
        raw: z.record(z.string(), z.unknown()).optional(),
        urlencoded: z.record(z.string(), z.unknown()).optional(),
        params: z.record(z.string(), z.unknown()).optional(),
        binary: z.record(z.string(), z.unknown()).optional(),
        graphql: z.record(z.string(), z.unknown()).optional(),
    })
        .passthrough()
        .describe('Additional configurations and options set for various modes.')
        .optional()
        .nullable(),
    auth: z
        .object({
        type: z
            .enum([
            'noauth',
            'basic',
            'bearer',
            'apikey',
            'digest',
            'oauth1',
            'oauth2',
            'hawk',
            'awsv4',
            'ntlm',
            'edgegrid',
            'jwt',
            'asap',
        ])
            .describe('The authorization type.'),
        apikey: requestAuthSchema.describe("The API key's authentication information.").optional(),
        bearer: requestAuthSchema
            .describe('The attributes for [Bearer Token](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/#bearer-token) authentication.')
            .optional(),
        basic: requestAuthSchema
            .describe('The attributes for [Basic Auth](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/#basic-auth).')
            .optional(),
        digest: requestAuthSchema
            .describe('The attributes for [Digest Auth](https://learning.postman.com/docs/sending-requests/authorization/digest-auth/).')
            .optional(),
        oauth1: requestAuthSchema
            .describe('The attributes for [OAuth1](https://learning.postman.com/docs/sending-requests/authorization/oauth-10/) authentication.')
            .optional(),
        oauth2: requestAuthSchema
            .describe('The attributes for [OAuth2](https://learning.postman.com/docs/sending-requests/authorization/oauth-20/) authentication.')
            .optional(),
        hawk: requestAuthSchema
            .describe('The attributes for [Hawk](https://learning.postman.com/docs/sending-requests/authorization/hawk-authentication/).')
            .optional(),
        awsv4: requestAuthSchema
            .describe('The attributes for [AWS V4](https://learning.postman.com/docs/sending-requests/authorization/aws-signature/).')
            .optional(),
        ntlm: requestAuthSchema
            .describe('The attributes for [NTLM](https://learning.postman.com/docs/sending-requests/authorization/ntlm-authentication/).')
            .optional(),
        edgegrid: requestAuthSchema
            .describe('The attributes for [Edgegrid](https://learning.postman.com/docs/sending-requests/authorization/akamai-edgegrid/).')
            .optional(),
        jwt: requestAuthSchema
            .describe('The attributes for [JWT](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/#jwt).')
            .optional(),
        asap: requestAuthSchema
            .describe('The attributes for [ASAP](https://learning.postman.com/docs/sending-requests/authorization/atlassian/).')
            .optional(),
    })
        .passthrough()
        .describe('The [authorization type supported by Postman](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).')
        .optional()
        .nullable(),
})
    .passthrough();
export const method = 'createCollectionRequest';
export const description = 'Creates a request in a collection. For a complete list of properties, refer to the **Request** entry in the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).\n\n**Note:**\n\nIt is recommended that you pass the \\`name\\` property in the request body. If you do not, the system uses a null value. As a result, this creates a request with a blank name.\n';
export const parameters = z.object({
    collectionId: z.string().describe("The collection's ID."),
    folderId: z
        .string()
        .describe('The folder ID in which to create the request. By default, the system will create the request at the collection level.')
        .optional(),
    request: requestSchema
        .describe('The full request object following the Postman Collection Format v2.1.0. Includes name, method, URL, headers, body, auth, etc.')
        .optional(),
    name: z
        .string()
        .describe("The request's name (deprecated: use request.name instead). It is recommended that you pass the `name` property. If you do not, the system uses a null value.")
        .optional(),
});
export const annotations = {
    title: 'Creates a request in a collection. For a complete list of properties, refer to the **Request** entry in the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).\n\n**Note:**\n\nIt is recommended that you pass the \\`name\\` property in the request body. If you do not, the system uses a null value. As a result, this creates a request with a blank name.\n',
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/collections/${args.collectionId}/requests`;
        const query = new URLSearchParams();
        if (args.folderId !== undefined)
            query.set('folderId', String(args.folderId));
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.request !== undefined) {
            Object.assign(bodyPayload, args.request);
        }
        else if (args.name !== undefined) {
            bodyPayload.name = args.name;
        }
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
