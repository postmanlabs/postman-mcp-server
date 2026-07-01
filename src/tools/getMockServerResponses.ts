import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'getMockServerResponses';
export const description =
  "Gets all server responses configured for a mock server.\n\n- Server responses simulate 5xx server-level failures (e.g. 500, 503) independently of any specific route or example.\n- This endpoint returns summary metadata only (id, name, statusCode, timestamps). To get the full body and headers of a specific response, call \\`getMockServerResponse\\` with the response's \\`id\\`.\n- To see which server response is currently active, call \\`getMock\\` and check \\`config.serverResponseId\\`.\n";
export const parameters = z.object({ mockId: z.string().describe("The mock's ID.") });
export const annotations = {
  title: 'Gets all server responses configured for a mock server.',
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    const endpoint = `/mocks/${encodeURIComponent(String(args.mockId))}/server-responses`;
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
