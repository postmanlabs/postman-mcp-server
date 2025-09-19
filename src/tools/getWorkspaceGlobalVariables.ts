import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
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

export const method = 'getWorkspaceGlobalVariables';
export const description =
  "Gets a workspace's global [variables](https://learning.postman.com/docs/sending-requests/variables/#variable-scopes). Global variables enable you to access data between collections, requests, scripts, and environments and are available throughout a workspace.";
export const parameters = z.object({ workspaceId: z.string().describe("The workspace's ID.") });
export const annotations = {
  title:
    "Gets a workspace's global [variables](https://learning.postman.com/docs/sending-requests/variables/#variable-scopes). Global variables enable you to access data between collections, requests, scripts, and environments and are available throughout a workspace.",
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders }
): Promise<CallToolResult> {
  try {
    const endpoint = `/workspaces/${args.workspaceId}/global-variables`;
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
