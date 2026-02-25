import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'createCollectionResponse';
export const description = 'Creates a request response in a collection. For a complete list of request body properties, refer to the **Response** entry in the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).\n\n**Note:**\n\nIt is recommended that you pass the \\`name\\` property in the request body. If you do not, the system uses a null value. As a result, this creates a response with a blank name.\n';
export const parameters = z.object({
    collectionId: z.string().describe("The collection's ID."),
    request: z.string().describe("The parent request's ID."),
    name: z
        .string()
        .describe("The response's name. It is recommended that you pass the `name` property in the request body. If you do not, the system uses a null value. As a result, this creates a response with a blank name.")
        .optional(),
    originalRequest: z
        .object({
        url: z
            .union([
            z.string().nullable().describe("The request's raw URL."),
            z.object({
                raw: z.string().describe("The request's raw URL.").optional(),
                protocol: z.string().describe('The request protocol.').optional(),
                host: z.array(z.string().nullable()).describe("The host's URL.").optional(),
                path: z.array(z.string()).describe("A list of the URL's path components.").optional(),
                port: z
                    .string()
                    .describe("The URL's port number. An empty value indicates port `80` (http) or `443` (https).")
                    .optional(),
                query: z
                    .array(z.object({
                    key: z.string().nullable().describe("The query parameter's key.").optional(),
                    value: z.string().nullable().describe("The key's value.").optional(),
                    disabled: z
                        .boolean()
                        .describe("If true, the query parameter isn't sent with the request.")
                        .default(false),
                    description: z
                        .string()
                        .nullable()
                        .describe("The query parameter's description.")
                        .optional(),
                }))
                    .describe('A list of query parameters. These are the query string parts of the URL, parsed as separate variables.')
                    .optional(),
            }),
        ])
            .describe('Information about the URL.')
            .optional(),
        auth: z
            .object({
            type: z
                .enum([
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
            apikey: z
                .array(z
                .object({
                key: z.string().describe("The auth method's key value."),
                value: z
                    .union([z.string(), z.array(z.record(z.string(), z.unknown()))])
                    .describe("The key's value.")
                    .optional(),
                type: z
                    .enum(['string', 'boolean', 'number', 'array', 'object', 'any'])
                    .describe("The value's type.")
                    .optional(),
            })
                .describe('Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'))
                .describe("The API key's authentication information.")
                .optional(),
            awsv4: z
                .array(z
                .object({
                key: z.string().describe("The auth method's key value."),
                value: z
                    .union([z.string(), z.array(z.record(z.string(), z.unknown()))])
                    .describe("The key's value.")
                    .optional(),
                type: z
                    .enum(['string', 'boolean', 'number', 'array', 'object', 'any'])
                    .describe("The value's type.")
                    .optional(),
            })
                .describe('Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'))
                .describe('The attributes for [AWS Signature](https://learning.postman.com/docs/sending-requests/authorization/aws-signature/) authentication.')
                .optional(),
            basic: z
                .array(z
                .object({
                key: z.string().describe("The auth method's key value."),
                value: z
                    .union([z.string(), z.array(z.record(z.string(), z.unknown()))])
                    .describe("The key's value.")
                    .optional(),
                type: z
                    .enum(['string', 'boolean', 'number', 'array', 'object', 'any'])
                    .describe("The value's type.")
                    .optional(),
            })
                .describe('Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'))
                .describe('The attributes for [Basic Auth](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/#basic-auth).')
                .optional(),
            bearer: z
                .array(z
                .object({
                key: z.string().describe("The auth method's key value."),
                value: z
                    .union([z.string(), z.array(z.record(z.string(), z.unknown()))])
                    .describe("The key's value.")
                    .optional(),
                type: z
                    .enum(['string', 'boolean', 'number', 'array', 'object', 'any'])
                    .describe("The value's type.")
                    .optional(),
            })
                .describe('Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'))
                .describe('The attributes for [Bearer Token](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/#bearer-token) authentication.')
                .optional(),
            digest: z
                .array(z
                .object({
                key: z.string().describe("The auth method's key value."),
                value: z
                    .union([z.string(), z.array(z.record(z.string(), z.unknown()))])
                    .describe("The key's value.")
                    .optional(),
                type: z
                    .enum(['string', 'boolean', 'number', 'array', 'object', 'any'])
                    .describe("The value's type.")
                    .optional(),
            })
                .describe('Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'))
                .describe('The attributes for [Digest](https://learning.postman.com/docs/sending-requests/authorization/digest-auth/) access authentication.')
                .optional(),
            edgegrid: z
                .array(z
                .object({
                key: z.string().describe("The auth method's key value."),
                value: z
                    .union([z.string(), z.array(z.record(z.string(), z.unknown()))])
                    .describe("The key's value.")
                    .optional(),
                type: z
                    .enum(['string', 'boolean', 'number', 'array', 'object', 'any'])
                    .describe("The value's type.")
                    .optional(),
            })
                .describe('Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'))
                .describe('The attributes for [Akamai Edgegrid](https://learning.postman.com/docs/sending-requests/authorization/akamai-edgegrid/) authentication.')
                .optional(),
            hawk: z
                .array(z
                .object({
                key: z.string().describe("The auth method's key value."),
                value: z
                    .union([z.string(), z.array(z.record(z.string(), z.unknown()))])
                    .describe("The key's value.")
                    .optional(),
                type: z
                    .enum(['string', 'boolean', 'number', 'array', 'object', 'any'])
                    .describe("The value's type.")
                    .optional(),
            })
                .describe('Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'))
                .describe('The attributes for [Hawk](https://learning.postman.com/docs/sending-requests/authorization/hawk-authentication/) authentication.')
                .optional(),
            ntlm: z
                .array(z
                .object({
                key: z.string().describe("The auth method's key value."),
                value: z
                    .union([z.string(), z.array(z.record(z.string(), z.unknown()))])
                    .describe("The key's value.")
                    .optional(),
                type: z
                    .enum(['string', 'boolean', 'number', 'array', 'object', 'any'])
                    .describe("The value's type.")
                    .optional(),
            })
                .describe('Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'))
                .describe('The attributes for [NTLM](https://learning.postman.com/docs/sending-requests/authorization/ntlm-authentication/) authentication.')
                .optional(),
            oauth1: z
                .array(z
                .object({
                key: z.string().describe("The auth method's key value."),
                value: z
                    .union([z.string(), z.array(z.record(z.string(), z.unknown()))])
                    .describe("The key's value.")
                    .optional(),
                type: z
                    .enum(['string', 'boolean', 'number', 'array', 'object', 'any'])
                    .describe("The value's type.")
                    .optional(),
            })
                .describe('Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'))
                .describe('The attributes for [OAuth1](https://learning.postman.com/docs/sending-requests/authorization/oauth-10/) authentication.')
                .optional(),
            oauth2: z
                .array(z
                .object({
                key: z.string().describe("The auth method's key value."),
                value: z
                    .union([z.string(), z.array(z.record(z.string(), z.unknown()))])
                    .describe("The key's value.")
                    .optional(),
                type: z
                    .enum(['string', 'boolean', 'number', 'array', 'object', 'any'])
                    .describe("The value's type.")
                    .optional(),
            })
                .describe('Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'))
                .describe('The attributes for [OAuth2](https://learning.postman.com/docs/sending-requests/authorization/oauth-20/) authentication.')
                .optional(),
            jwt: z
                .array(z
                .object({
                key: z.string().describe("The auth method's key value."),
                value: z
                    .union([z.string(), z.array(z.record(z.string(), z.unknown()))])
                    .describe("The key's value.")
                    .optional(),
                type: z
                    .enum(['string', 'boolean', 'number', 'array', 'object', 'any'])
                    .describe("The value's type.")
                    .optional(),
            })
                .describe('Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'))
                .describe('The attributes for JWT (JSON Web Token). Includes the `payload`, `secret`, `algorithm`, `addTokenTo`, and `headerPrefix` properties.')
                .optional(),
            asap: z
                .array(z
                .object({
                key: z.string().describe("The auth method's key value."),
                value: z
                    .union([z.string(), z.array(z.record(z.string(), z.unknown()))])
                    .describe("The key's value.")
                    .optional(),
                type: z
                    .enum(['string', 'boolean', 'number', 'array', 'object', 'any'])
                    .describe("The value's type.")
                    .optional(),
            })
                .describe('Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'))
                .describe('The attributes for ASAP (Atlassian S2S Authentication Protocol). Includes the `kid`, `aud`, `iss`, `alg`, `privateKey`, and `claims` properties.')
                .optional(),
        })
            .describe('The [authorization type supported by Postman](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).')
            .optional(),
        method: z.string().describe("The request's standard HTTP method.").optional(),
        description: z.string().nullable().describe("The request's description.").optional(),
        header: z
            .array(z
            .object({
            key: z
                .string()
                .describe("The header's key, such as `Content-Type` or `X-Custom-Header`."),
            value: z.string().describe("The header key's value."),
            description: z.string().nullable().describe("The header's description.").optional(),
        })
            .describe('Information about the header.'))
            .describe('A list of headers.')
            .optional(),
        body: z
            .object({
            mode: z
                .enum(['raw', 'urlencoded', 'formdata', 'file', 'graphql'])
                .describe('The data associated with the request.')
                .optional(),
            raw: z
                .string()
                .describe('If the `mode` value is `raw`, the raw content of the request body.')
                .optional(),
            urlencoded: z
                .array(z.object({
                key: z.string().describe('The key value.'),
                value: z.string().describe("The key's value.").optional(),
                description: z.string().nullable().describe("The key's description.").optional(),
            }))
                .describe('A list of x-www-form-encoded key/value pairs.')
                .optional(),
            formdata: z
                .array(z.record(z.string(), z.unknown()).and(z.union([
                z.object({
                    key: z.string().describe('The key value.').optional(),
                    value: z.string().describe("The key's value.").optional(),
                    type: z.literal('text').describe('The `text` value.').optional(),
                    contentType: z
                        .string()
                        .describe('The form-data Content-Type header.')
                        .optional(),
                    description: z
                        .string()
                        .nullable()
                        .describe("The key's description.")
                        .optional(),
                }),
                z.object({
                    key: z.string().describe('The key value.').optional(),
                    src: z
                        .unknown()
                        .superRefine((x, ctx) => {
                        const schemas = [z.string().nullable(), z.array(z.string())];
                        const errors = schemas.reduce((errors, schema) => ((result) => (result.error ? [...errors, result.error] : errors))(schema.safeParse(x)), []);
                        if (schemas.length - errors.length !== 1) {
                            ctx.addIssue({
                                path: ctx.path,
                                code: 'invalid_union',
                                unionErrors: errors,
                                message: 'Invalid input: Should pass single schema',
                            });
                        }
                    })
                        .optional(),
                    type: z.literal('file').describe('The `file` value.').optional(),
                    contentType: z
                        .string()
                        .describe('The form-data Content-Type header.')
                        .optional(),
                    description: z
                        .string()
                        .nullable()
                        .describe("The key's description.")
                        .optional(),
                }),
            ])))
                .describe('If the `mode` value is `formdata`, then a list of form-data key/pair values.')
                .optional(),
            file: z
                .object({
                src: z
                    .string()
                    .nullable()
                    .describe('The name of the file to upload (not its path). A null value indicates that no file is selected as a part of the request body.')
                    .optional(),
            })
                .describe('If the `mode` value is `file`, an object containing the file request information.')
                .optional(),
            graphql: z
                .object({
                query: z.string().describe('The GraphQL query.').optional(),
                variables: z
                    .string()
                    .nullable()
                    .describe('The GraphQL query variables, in JSON format.')
                    .optional(),
            })
                .describe('If the `mode` value is `graphql`, an object containing the GraphQL request information.')
                .optional(),
            options: z
                .record(z.string(), z.unknown())
                .describe('Additional configurations and options set for various modes.')
                .optional(),
        })
            .describe("Information about the collection's request body.")
            .optional(),
    })
        .describe('Information about the collection request.')
        .optional(),
    responseTime: z
        .number()
        .nullable()
        .describe('The time taken by the request to complete. The unit is milliseconds.')
        .optional(),
    timings: z
        .record(z.string(), z.unknown())
        .nullable()
        .describe('Data related to the request and response timing, in milliseconds.')
        .optional(),
    header: z
        .union([
        z.string().nullable(),
        z
            .array(z
            .object({
            key: z
                .string()
                .describe("The header's key, such as `Content-Type` or `X-Custom-Header`."),
            value: z.string().describe("The header key's value."),
            description: z.string().nullable().describe("The header's description.").optional(),
        })
            .describe('Information about the header.'))
            .describe("A list of the response's headers."),
    ])
        .optional(),
    cookie: z
        .array(z
        .object({
        name: z.string().describe("The cookie's name.").optional(),
        value: z.string().describe("The cookie's value.").optional(),
    })
        .catchall(z.unknown()))
        .describe('A list of cookies included in the response.')
        .optional(),
    body: z.string().nullable().describe('The raw text of the response body.').optional(),
    status: z.string().describe("The response's HTTP status.").optional(),
    code: z.number().int().describe("The response's HTTP status code.").optional(),
});
export const annotations = {
    title: 'Creates a request response in a collection. For a complete list of request body properties, refer to the **Response** entry in the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).',
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/collections/${args.collectionId}/responses`;
        const query = new URLSearchParams();
        if (args.request !== undefined)
            query.set('request', String(args.request));
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.name !== undefined)
            bodyPayload.name = args.name;
        if (args.originalRequest !== undefined)
            bodyPayload.originalRequest = args.originalRequest;
        if (args.responseTime !== undefined)
            bodyPayload.responseTime = args.responseTime;
        if (args.timings !== undefined)
            bodyPayload.timings = args.timings;
        if (args.header !== undefined)
            bodyPayload.header = args.header;
        if (args.cookie !== undefined)
            bodyPayload.cookie = args.cookie;
        if (args.body !== undefined)
            bodyPayload.body = args.body;
        if (args.status !== undefined)
            bodyPayload.status = args.status;
        if (args.code !== undefined)
            bodyPayload.code = args.code;
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
