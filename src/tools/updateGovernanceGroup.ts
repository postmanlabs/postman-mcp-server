import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'updateGovernanceGroup';
export const title = 'Update a governance group';
export const description =
  "Updates a custom governance group's name or description. To change which workspaces\nare in the group, use updateGovernanceGroupWorkspaces. Postman-managed groups\n(\\`type: system\\`) can't be updated and return 403.\n";
export const parameters = z.object({
  groupId: z.string().describe("The governance group's ID."),
  name: z.string().min(1).max(255).describe("The governance group's name.").optional(),
  description: z.string().max(255).describe("The governance group's description.").optional(),
});
export const annotations = {
  title: 'Update a governance group',
  readOnlyHint: false,
  openWorldHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    if ([args['name'], args['description']].filter((value) => value !== undefined).length < 1) {
      throw new McpError(ErrorCode.InvalidParams, 'Request body must include at least 1 property.');
    }
    const endpoint = `/governance-groups/${encodeURIComponent(String(args.groupId))}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.name !== undefined) bodyPayload.name = args.name;
    if (args.description !== undefined) bodyPayload.description = args.description;
    const options: any = {
      body: JSON.stringify(bodyPayload),
      contentType: ContentType.JsonMergePatch,
      headers: extra.headers,
    };
    const result = await extra.client.patch(url, options);
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
