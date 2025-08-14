import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';
import { IsomorphicHeaders, McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

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
  params: z.infer<typeof parameters>,
  extra: { apiKey: string; headers?: IsomorphicHeaders }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/workspaces/${params.workspaceId}/global-variables`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const result = await fetchPostmanAPI(url, {
      method: 'GET',
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
