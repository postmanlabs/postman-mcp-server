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

export const method = 'updateMock';
export const description =
  'Updates a mock server.\n- Resource: Mock server entity associated with a collection UID.\n- Use this to change name, environment, privacy, or default server response.\n';
export const parameters = z.object({
  mockId: z.string().describe("The mock's ID."),
  mock: z
    .object({
      collection: z.string().describe("The associated collection's unique ID. This is a mandatory parameter."),
      name: z.string().describe("The mock server's name.").optional(),
      environment: z.string().describe("The associated environment's unique ID.").optional(),
      description: z.string().describe("The mock server's description.").optional(),
      private: z
        .boolean()
        .describe(
          'If true, the mock server is set private. By default, mock servers are public and can receive requests from anyone and anywhere.'
        )
        .default(false),
      versionTag: z.string().describe("The API's version tag ID.").optional(),
      config: z
        .object({
          serverResponseId: z
            .string()
            .nullable()
            .describe(
              'The server response ID. This sets the given server response as the default response for each request. To deactivate a server response, pass a null value.'
            )
            .optional(),
        })
        .describe("The mock server's configuration settings.")
        .optional(),
    })
    .optional(),
});
export const annotations = {
  title:
    'Updates a mock server.\n- Resource: Mock server entity associated with a collection UID.\n- Use this to change name, environment, privacy, or default server response.\n',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders }
): Promise<CallToolResult> {
  try {
    const endpoint = `/mocks/${args.mockId}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.mock !== undefined) bodyPayload.mock = args.mock;
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
