import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'deleteMockServerResponse';
export const description =
  'Deletes a server response from a mock server.\n\n- If this server response is currently active (\\`config.serverResponseId\\` on the mock), deleting it will not automatically deactivate it. Call \\`updateMock\\` with \\`config.serverResponseId: null\\` first to deactivate.\n- This action is destructive and cannot be undone.\n';
export const parameters = z.object({
  mockId: z.string().describe("The mock's ID."),
  serverResponseId: z.string().describe("The server response's ID."),
});
export const annotations = {
  title: 'Deletes a server response from a mock server.',
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    const endpoint = `/mocks/${args.mockId}/server-responses/${args.serverResponseId}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const options: any = {
      headers: extra.headers,
    };
    const result = await extra.client.delete(url, options);
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
