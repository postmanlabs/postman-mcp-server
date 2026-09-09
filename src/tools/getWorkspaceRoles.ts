import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'getWorkspaceRoles';
export const title = "Get a workspace's roles";
export const description =
  "Gets who has access to a workspace and at what level, covering users, user groups, and\npartners. Use this to audit access, and to read the current state before changing it.\nPass \\`include=scim\\` to get SCIM IDs alongside Postman IDs. Partner roles do not support\nSCIM IDs.\nResolve the IDs in the response with getTeamUsers and getGroups. For a single\ncollection's access list use getCollectionRoles instead.\n";
export const parameters = z.object({
  workspaceId: z.string().describe("The workspace's ID."),
  include: z
    .literal('scim')
    .describe(
      "Include the following information in the endpoint's response:\n- `scim` — Return IDs as SCIM user and group IDs.\n"
    )
    .optional(),
});
export const annotations = {
  title: "Get a workspace's roles",
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
    const endpoint = `/workspaces/${encodeURIComponent(String(args.workspaceId))}/roles`;
    const query = new URLSearchParams();
    if (args.include !== undefined) query.set('include', String(args.include));
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
