import { z } from 'zod';
import { fetchPostmanAPI, ContentType } from '../clients/postman.js';
import { IsomorphicHeaders, McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

function asMcpError(error: unknown): McpError {
  const cause = (error as any)?.cause ?? String(error);
  return new McpError(ErrorCode.InternalError, cause);
}

export const method = 'create-mock';
export const description =
  'Creates a mock server in a collection.\n\n**Note:**\n\n- You cannot create mocks for collections added to an API definition.\n- If you do not include the \\`workspaceId\\` query parameter, the system creates the mock server in the oldest personal Internal workspace you own.\n';
export const parameters = z.object({
  workspace: z.string().describe("The workspace's ID."),
  mock: z
    .object({
      collection: z.string().describe("The unique ID of the mock's associated collection."),
      environment: z
        .string()
        .describe("The unique ID of the mock's associated environment.")
        .optional(),
      name: z.string().describe("The mock server's name.").optional(),
      private: z
        .boolean()
        .describe(
          'If true, the mock server is set private. By default, mock servers are public and can receive requests from anyone and anywhere.'
        )
        .default(false),
    })
    .optional(),
});
export const annotations = {
  title:
    'Creates a mock server in a collection.\n\n**Note:**\n\n- You cannot create mocks for collections added to an API definition.\n- If you do not include the \\`workspaceId\\` query parameter, the system creates the mock server in the oldest personal Internal workspace you own.\n',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string; headers?: IsomorphicHeaders }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/mocks`;
    const query = new URLSearchParams();
    if (params.workspace !== undefined) query.set('workspace', String(params.workspace));
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (params.mock !== undefined) bodyPayload.mock = params.mock;
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
  } catch (e: unknown) {
    if (e instanceof McpError) {
      throw e;
    }
    throw asMcpError(e);
  }
}
