import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'getMockServerResponse';
export const description =
  'Gets the full details of a specific server response, including its \\`body\\`, \\`headers\\`, and \\`language\\`.\n\n- Use \\`getMockServerResponses\\` first to list available server response IDs.\n- To check which response is active, call \\`getMock\\` and read \\`config.serverResponseId\\`.\n';
export const parameters = z.object({
  mockId: z.string().describe("The mock's ID."),
  serverResponseId: z.string().describe("The server response's ID."),
});
export const annotations = {
  title:
    'Gets the full details of a specific server response, including its \\`body\\`, \\`headers\\`, and \\`language\\`.',
  readOnlyHint: true,
  destructiveHint: false,
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
    const result = await extra.client.get(url, options);
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
