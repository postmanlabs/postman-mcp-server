import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'getSdkGitConnection';
export const title = 'Get an SDK Git connection';
export const description =
  'Gets one SDK Git connection, including which SDK was last delivered to its target\nbranch and the most recent SDK-update pull request. Use this to check whether a\nconnection is healthy and current.\nRequires a Postman Team or Enterprise plan.\n';
export const parameters = z.object({
  sdkGitConnectionId: z.string().describe("The Git connection's ID."),
});
export const annotations = {
  title: 'Get an SDK Git connection',
  readOnlyHint: true,
  openWorldHint: false,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    const endpoint = `/sdk-git-connections/${encodeURIComponent(String(args.sdkGitConnectionId))}`;
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
