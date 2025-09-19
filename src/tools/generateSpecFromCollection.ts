import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
import {
  IsomorphicHeaders,
  McpError,
  ErrorCode,
  CallToolResult,
} from '@modelcontextprotocol/sdk/types.js';

function asMcpError(error: unknown): McpError {
  const cause = (error as any)?.cause ?? String(error);
  return new McpError(ErrorCode.InternalError, cause);
}

export const method = 'generateSpecFromCollection';
export const description =
  'Generates an API specification for the given collection. The response contains a polling link to the task status.';
export const parameters = z.object({
  collectionUid: z.string().describe("The collection's unique ID."),
  elementType: z.literal('spec').describe('The `spec` value.'),
  name: z.string().describe("The API specification's name."),
  type: z.literal('OPENAPI:3.0').describe("The specification's type."),
  format: z.enum(['JSON', 'YAML']).describe('The format of the API specification.'),
});
export const annotations = {
  title:
    'Generates an API specification for the given collection. The response contains a polling link to the task status.',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders }
): Promise<CallToolResult> {
  try {
    const endpoint = `/collections/${args.collectionUid}/generations/${args.elementType}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.name !== undefined) bodyPayload.name = args.name;
    if (args.type !== undefined) bodyPayload.type = args.type;
    if (args.format !== undefined) bodyPayload.format = args.format;
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
