import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'patchCollection';
export const description = 'Updates specific collection information, such as its name, events, or its variables. For more information, see the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).\n';
export const parameters = z.object({
    collectionId: z
        .string()
        .describe('The collection ID must be in the form <OWNER_ID>-<UUID> (e.g. 12345-33823532ab9e41c9b6fd12d0fd459b8b).'),
    collection: z
        .object({
        info: z
            .object({
            name: z.string().describe("The collection's updated name.").optional(),
            description: z.string().describe("The collection's updated description.").optional(),
        })
            .describe("An object that contains the collection's updated name and description.")
            .optional(),
        variable: z
            .array(z
            .object({
            id: z
                .string()
                .describe("The variable's ID. Doesn't apply to collection-level variables.")
                .optional(),
            key: z.string().describe("The variable's key (name).").optional(),
            description: z.string().max(512).describe("The variable's description.").optional(),
            value: z
                .union([z.string(), z.boolean(), z.number().int()])
                .describe("The key's value.")
                .optional(),
            disabled: z
                .boolean()
                .describe("If true, the variable is not enabled. Doesn't apply to path parameter variables.")
                .default(false),
        })
            .describe('Information about the variable.'))
            .describe("A list of the collection's [variables](https://learning.postman.com/docs/sending-requests/variables/variables/). Make certain not to include sensitive information in variables.")
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
                    .union([z.string(), z.array(z.record(z.any()))])
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
                    .union([z.string(), z.array(z.record(z.any()))])
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
                    .union([z.string(), z.array(z.record(z.any()))])
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
                    .union([z.string(), z.array(z.record(z.any()))])
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
                    .union([z.string(), z.array(z.record(z.any()))])
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
                    .union([z.string(), z.array(z.record(z.any()))])
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
                    .union([z.string(), z.array(z.record(z.any()))])
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
                    .union([z.string(), z.array(z.record(z.any()))])
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
                    .union([z.string(), z.array(z.record(z.any()))])
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
                    .union([z.string(), z.array(z.record(z.any()))])
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
                    .union([z.string(), z.array(z.record(z.any()))])
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
                    .union([z.string(), z.array(z.record(z.any()))])
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
        events: z
            .array(z
            .object({
            id: z.string().describe("The event's ID.").optional(),
            listen: z
                .enum(['test', 'prerequest'])
                .describe('The `prerequest` (pre-request) or `test` (post-response) value.'),
            script: z
                .object({
                id: z.string().describe("The script's ID.").optional(),
                type: z
                    .string()
                    .describe('The type of script. For example, `text/javascript`.')
                    .optional(),
                exec: z
                    .array(z.string().nullable())
                    .describe('A list of script strings, where each line represents a line of code. Separate lines makes it easy to track script changes.')
                    .optional(),
            })
                .describe('Information about the Javascript code that can be used to to perform setup or teardown operations in a response.')
                .optional(),
        })
            .describe("Information about the collection's events."))
            .describe('A list of scripts configured to run when specific events occur. These scripts can be referenced in the collection by their ID.')
            .optional(),
    })
        .optional(),
});
export const annotations = {
    title: 'Updates specific collection information, such as its name, events, or its variables. For more information, see the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).\n',
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(params, extra) {
    try {
        const endpoint = `/collections/${params.collectionId}`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (params.collection !== undefined)
            bodyPayload.collection = params.collection;
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
