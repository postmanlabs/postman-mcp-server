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
  description: z.string().nullable().optional(),
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
    .optional(),
  url: z.string().nullable().optional(),
  headerData: z
    .array(
      z.object({
        key: z.string().optional(),
        value: z.string().optional(),
        description: z.string().nullable().optional(),
      })
    )
    .optional(),
  queryParams: z
    .array(
      z.object({
        key: z.string().optional(),
        value: z.string().optional(),
        description: z.string().nullable().optional(),
        enabled: z.boolean().optional(),
      })
    )
    .optional(),
  dataMode: z.enum(['raw', 'urlencoded', 'formdata', 'binary', 'graphql']).nullable().optional(),
  data: z
    .array(
      z.object({
        key: z.string().optional(),
        value: z.string().optional(),
        description: z.string().nullable().optional(),
        enabled: z.boolean().optional(),
        type: z.enum(['text', 'file']).optional(),
        uuid: z.string().optional(),
      })
    )
    .nullable()
    .optional(),
  rawModeData: z.string().nullable().optional(),
  graphqlModeData: z
    .object({ query: z.string().optional(), variables: z.string().optional() })
    .nullable()
    .optional(),
  dataOptions: z
    .object({
      raw: z.record(z.string(), z.unknown()).optional(),
      urlencoded: z.record(z.string(), z.unknown()).optional(),
      params: z.record(z.string(), z.unknown()).optional(),
      binary: z.record(z.string(), z.unknown()).optional(),
      graphql: z.record(z.string(), z.unknown()).optional(),
    })
    .nullable()
    .optional(),
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
        .optional(),
      apikey: z
        .array(
          z.object({
            key: z.string().optional(),
            value: z.unknown().optional(),
            type: z.enum(['string', 'boolean', 'number', 'array', 'object', 'any']).optional(),
          })
        )
        .optional(),
      bearer: z
        .array(
          z.object({
            key: z.string().optional(),
            value: z.unknown().optional(),
            type: z.enum(['string', 'boolean', 'number', 'array', 'object', 'any']).optional(),
          })
        )
        .optional(),
      basic: z
        .array(
          z.object({
            key: z.string().optional(),
            value: z.unknown().optional(),
            type: z.enum(['string', 'boolean', 'number', 'array', 'object', 'any']).optional(),
          })
        )
        .optional(),
      digest: z
        .array(
          z.object({
            key: z.string().optional(),
            value: z.unknown().optional(),
            type: z.enum(['string', 'boolean', 'number', 'array', 'object', 'any']).optional(),
          })
        )
        .optional(),
      oauth1: z
        .array(
          z.object({
            key: z.string().optional(),
            value: z.unknown().optional(),
            type: z.enum(['string', 'boolean', 'number', 'array', 'object', 'any']).optional(),
          })
        )
        .optional(),
      oauth2: z
        .array(
          z.object({
            key: z.string().optional(),
            value: z.unknown().optional(),
            type: z.enum(['string', 'boolean', 'number', 'array', 'object', 'any']).optional(),
          })
        )
        .optional(),
      hawk: z
        .array(
          z.object({
            key: z.string().optional(),
            value: z.unknown().optional(),
            type: z.enum(['string', 'boolean', 'number', 'array', 'object', 'any']).optional(),
          })
        )
        .optional(),
      awsv4: z
        .array(
          z.object({
            key: z.string().optional(),
            value: z.unknown().optional(),
            type: z.enum(['string', 'boolean', 'number', 'array', 'object', 'any']).optional(),
          })
        )
        .optional(),
      ntlm: z
        .array(
          z.object({
            key: z.string().optional(),
            value: z.unknown().optional(),
            type: z.enum(['string', 'boolean', 'number', 'array', 'object', 'any']).optional(),
          })
        )
        .optional(),
      edgegrid: z
        .array(
          z.object({
            key: z.string().optional(),
            value: z.unknown().optional(),
            type: z.enum(['string', 'boolean', 'number', 'array', 'object', 'any']).optional(),
          })
        )
        .optional(),
      jwt: z
        .array(
          z.object({
            key: z.string().optional(),
            value: z.unknown().optional(),
            type: z.enum(['string', 'boolean', 'number', 'array', 'object', 'any']).optional(),
          })
        )
        .optional(),
      asap: z
        .array(
          z.object({
            key: z.string().optional(),
            value: z.unknown().optional(),
            type: z.enum(['string', 'boolean', 'number', 'array', 'object', 'any']).optional(),
          })
        )
        .optional(),
    })
    .nullable()
    .optional(),
});
export const annotations = {
  title:
    'Creates a request in a collection. For a complete list of properties, refer to the **Request** entry in the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).\n\n**Note:**\n\nIt is recommended that you pass the \\`name\\` property in the request body. If you do not, the system uses a null value. As a result, this creates a request with a blank name.\n',
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
