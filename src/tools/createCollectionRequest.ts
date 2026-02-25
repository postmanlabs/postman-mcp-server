import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'createCollectionRequest';
export const description =
  'Creates a request in a collection. For a complete list of properties, refer to the **Request** entry in the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).\n\n**Note:**\n\nIt is recommended that you pass the \\`name\\` property in the request body. If you do not, the system uses a null value. As a result, this creates a request with a blank name.\n';
export const parameters = z.object({
  collectionId: z.string().describe("The collection's ID."),
  folderId: z
    .string()
    .describe(
      'The folder ID in which to create the request. By default, the system will create the request at the collection level.'
    )
    .optional(),
  name: z.string().describe('Name of the request').optional(),
  description: z.string().nullable().describe("The request's description.").optional(),
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
    .nullable()
    .describe("The request's HTTP method.")
    .optional(),
  url: z.string().nullable().describe("The request's URL.").optional(),
  headerData: z
    .array(
      z.object({
        key: z.string().describe("The header's key.").optional(),
        value: z.string().describe("The header's value.").optional(),
        description: z.string().nullable().describe("The header's description.").optional(),
      })
    )
    .describe("The request's headers.")
    .optional(),
  queryParams: z
    .array(
      z.object({
        key: z.string().describe("The query parameter's key.").optional(),
        value: z.string().describe("The query parameter's value.").optional(),
        description: z
          .string()
          .nullable()
          .describe("The query parameter's description.")
          .optional(),
        enabled: z.boolean().describe('If true, the query parameter is enabled.').optional(),
      })
    )
    .describe("The request's query parameters.")
    .optional(),
  dataMode: z
    .enum(['raw', 'urlencoded', 'formdata', 'binary', 'graphql'])
    .nullable()
    .describe("The request body's data mode.")
    .optional(),
  data: z
    .array(
      z.object({
        key: z.string().describe("The form data's key.").optional(),
        value: z.string().describe("The form data's value.").optional(),
        description: z.string().nullable().describe("The form data's description.").optional(),
        enabled: z.boolean().describe('If true, the form data entry is enabled.').optional(),
        type: z.enum(['text', 'file']).describe("The form data's type.").optional(),
        uuid: z.string().describe("The form data entry's unique identifier.").optional(),
      })
    )
    .nullable()
    .describe("The request body's form data.")
    .optional(),
  rawModeData: z.string().nullable().describe("The request body's raw mode data.").optional(),
  graphqlModeData: z
    .object({
      query: z.string().describe('The GraphQL query.').optional(),
      variables: z.string().describe('The GraphQL query variables, in JSON format.').optional(),
    })
    .nullable()
    .describe("The request body's GraphQL mode data.")
    .optional(),
  dataOptions: z
    .object({
      raw: z
        .object({ language: z.string().describe("The raw mode data's language type.").optional() })
        .catchall(z.unknown())
        .describe('Options for the `raw` data mode.')
        .optional(),
      urlencoded: z
        .record(z.string(), z.unknown())
        .describe('Options for the `urlencoded` data mode.')
        .optional(),
      params: z
        .record(z.string(), z.unknown())
        .describe('Options for the `params` data mode.')
        .optional(),
      binary: z
        .record(z.string(), z.unknown())
        .describe('Options for the `binary` data mode.')
        .optional(),
      graphql: z
        .record(z.string(), z.unknown())
        .describe('Options for the `graphql` data mode.')
        .optional(),
    })
    .nullable()
    .describe(
      "Additional configurations and options set for the request body's various data modes."
    )
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
          'noauth',
        ])
        .describe('The authorization type.'),
      apikey: z
        .array(
          z
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
            .describe(
              'Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'
            )
        )
        .describe("The API key's authentication information.")
        .optional(),
      awsv4: z
        .array(
          z
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
            .describe(
              'Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'
            )
        )
        .describe('The attributes for AWS Signature authentication.')
        .optional(),
      basic: z
        .array(
          z
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
            .describe(
              'Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'
            )
        )
        .describe('The attributes for Basic Auth.')
        .optional(),
      bearer: z
        .array(
          z
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
            .describe(
              'Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'
            )
        )
        .describe('The attributes for Bearer Token authentication.')
        .optional(),
      digest: z
        .array(
          z
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
            .describe(
              'Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'
            )
        )
        .describe('The attributes for Digest access authentication.')
        .optional(),
      edgegrid: z
        .array(
          z
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
            .describe(
              'Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'
            )
        )
        .describe('The attributes for Akamai Edgegrid authentication.')
        .optional(),
      hawk: z
        .array(
          z
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
            .describe(
              'Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'
            )
        )
        .describe('The attributes for Hawk authentication.')
        .optional(),
      ntlm: z
        .array(
          z
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
            .describe(
              'Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'
            )
        )
        .describe('The attributes for NTLM authentication.')
        .optional(),
      oauth1: z
        .array(
          z
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
            .describe(
              'Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'
            )
        )
        .describe('The attributes for OAuth1 authentication.')
        .optional(),
      oauth2: z
        .array(
          z
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
            .describe(
              'Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'
            )
        )
        .describe('The attributes for OAuth2 authentication.')
        .optional(),
      jwt: z
        .array(
          z
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
            .describe(
              'Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'
            )
        )
        .describe('The attributes for JWT authentication.')
        .optional(),
      asap: z
        .array(
          z
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
            .describe(
              'Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'
            )
        )
        .describe('The attributes for ASAP authentication.')
        .optional(),
    })
    .nullable()
    .describe("The request's authentication information.")
    .optional(),
  events: z
    .array(
      z.object({
        listen: z.enum(['test', 'prerequest']).describe('The event type.'),
        script: z
          .object({
            id: z.string().describe("The script's ID.").optional(),
            type: z
              .string()
              .describe('The type of script. For example, `text/javascript`.')
              .optional(),
            exec: z
              .array(z.string().nullable())
              .describe(
                'A list of script strings, where each line represents a line of code. Separate lines makes it easy to track script changes.'
              )
              .optional(),
          })
          .describe(
            'Information about the Javascript code that can be used to to perform setup or teardown operations in a response.'
          )
          .optional(),
      })
    )
    .describe('A list of scripts configured to run when specific events occur.')
    .optional(),
});
export const annotations = {
  title:
    'Creates a request in a collection. For a complete list of properties, refer to the **Request** entry in the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    const endpoint = `/collections/${args.collectionId}/requests`;
    const query = new URLSearchParams();
    if (args.folderId !== undefined) query.set('folderId', String(args.folderId));
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.name !== undefined) bodyPayload.name = args.name;
    if (args.description !== undefined) bodyPayload.description = args.description;
    if (args.method !== undefined) bodyPayload.method = args.method;
    if (args.url !== undefined) bodyPayload.url = args.url;
    if (args.headerData !== undefined) bodyPayload.headerData = args.headerData;
    if (args.queryParams !== undefined) bodyPayload.queryParams = args.queryParams;
    if (args.dataMode !== undefined) bodyPayload.dataMode = args.dataMode;
    if (args.data !== undefined) bodyPayload.data = args.data;
    if (args.rawModeData !== undefined) bodyPayload.rawModeData = args.rawModeData;
    if (args.graphqlModeData !== undefined) bodyPayload.graphqlModeData = args.graphqlModeData;
    if (args.dataOptions !== undefined) bodyPayload.dataOptions = args.dataOptions;
    if (args.auth !== undefined) bodyPayload.auth = args.auth;
    if (args.events !== undefined) bodyPayload.events = args.events;
    const options: any = {
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
  } catch (e: unknown) {
    if (e instanceof McpError) {
      throw e;
    }
    throw asMcpError(e);
  }
}
