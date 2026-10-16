import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'updateGovernanceGroupWorkspaces';
export const title = "Update a governance group's workspaces";
export const description =
  "Adds and removes workspaces in a custom governance group in one atomic request. Put\nworkspace IDs to add in \\`create\\` and IDs to remove in \\`delete\\`; omit either list if\nunused. Removed workspaces stop being governed by the group's rulesets. If any\nworkspace in the batch can't be applied, nothing changes and the request fails with\n409. Postman-managed groups (\\`type: system\\`) return 403.\n";
export const parameters = z.object({
  groupId: z.string().describe("The governance group's ID."),
  create: z
    .array(z.string())
    .describe('The IDs of the workspaces to assign to the group.')
    .optional(),
  delete: z
    .array(z.string())
    .describe('The IDs of the workspaces to unassign from the group.')
    .optional(),
});
export const annotations = {
  title: "Update a governance group's workspaces",
  readOnlyHint: false,
  openWorldHint: true,
  destructiveHint: true,
  idempotentHint: false,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    if ([args['create'], args['delete']].filter((value) => value !== undefined).length < 1) {
      throw new McpError(ErrorCode.InvalidParams, 'Request body must include at least 1 property.');
    }
    const endpoint = `/governance-groups/${encodeURIComponent(String(args.groupId))}/bulk-workspaces`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.create !== undefined) bodyPayload.create = args.create;
    if (args.delete !== undefined) bodyPayload.delete = args.delete;
    const options: any = {
      body: JSON.stringify(bodyPayload),
      contentType: ContentType.Json,
      headers: extra.headers,
    };
    const result = await extra.client.post(url, options);
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
