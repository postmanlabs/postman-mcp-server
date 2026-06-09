import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'getWorkspaceEnvironmentsContext';
export const description =
  'Returns a markdown-formatted summary of all environments in a workspace, including their variables. Use this to understand the environment configuration available in a workspace.';

export const parameters = z.object({
  workspaceId: z.string().describe("The workspace's ID."),
});

export const annotations = {
  title: 'Get Workspace Environments Context',
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    const result = await extra.client.get(`/context/workspaces/${args.workspaceId}/environments`, {
      headers: extra.headers,
    });
    return {
      content: [{ type: 'text', text: result as string }],
    };
  } catch (e: unknown) {
    if (e instanceof McpError) {
      throw e;
    }
    throw asMcpError(e);
  }
}
