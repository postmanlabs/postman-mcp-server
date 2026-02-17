import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'updateCollectionRequest';
export const description =
  'Updates a request in a collection. For a complete list of properties, refer to the **Request** entry in the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).\n\n**Note:**\n\n- You must pass a collection ID (\\`12ece9e1-2abf-4edc-8e34-de66e74114d2\\`), not a collection(\\`12345678-12ece9e1-2abf-4edc-8e34-de66e74114d2\\`), in this endpoint.\n- This endpoint does not support changing the folder of a request.\n- This endpoint acts like a PATCH method. It only updates the values that you pass in the request body.';
export const parameters = z.object({
  requestId: z.string().describe("The request's ID."),
  collectionId: z.string().describe("The collection's ID."),
  name: z.string().describe('Name of the request. Only provided fields are updated.').optional(),
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
    .describe("The request's method.")
    .optional(),
  description: z.string().nullable().optional(),
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
    'Updates a request in a collection. For a complete list of properties, refer to the **Request** entry in the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    const endpoint = `/collections/${args.collectionId}/requests/${args.requestId}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.name !== undefined) bodyPayload.name = args.name;
    if (args.method !== undefined) bodyPayload.method = args.method;
    if (args.description !== undefined) bodyPayload.description = args.description;
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
    const result = await extra.client.put(url, options);
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
