import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'deletePanWorkspace';
export const description =
  "Removes a workspace from your team's [Private API Network](https://learning.postman.com/docs/collaborating-in-postman/adding-private-network/).\n\n**Note:**\n\nRemoving a workspace does not delete it. It only removes it from the Private API Network folder.\n";
export const parameters = z.object({ workspaceId: z.string().describe("The workspace's ID.") });
export const annotations = {
  title:
    "Removes a workspace from your team's [Private API Network](https://learning.postman.com/docs/collaborating-in-postman/adding-private-network/).",
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    const endpoint = `/network/private/workspace/${args.workspaceId}`;
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
