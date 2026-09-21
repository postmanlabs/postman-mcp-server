import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'removeTeamMembers';
export const title = 'Remove team members';
export const description =
  "Removes users, groups, or organizations from a Postman team. Returns 204 with no body on\nsuccess.\nThis is destructive and not self-reversing: removed members lose access to the team's\ncollections, environments, and workspaces, and restoring them means re-inviting them and\nrebuilding their roles. Only call it on an explicit instruction naming exactly who to\nremove. Never call it to tidy up inactive members, to act on a list you assembled\nyourself, or as a step in some larger cleanup.\n";
export const parameters = z.object({
  teamId: z.number().int().describe("The team's ID."),
  identifierType: z
    .string()
    .describe('Use SCIM user and group IDs instead of Postman user IDs.')
    .optional(),
  entities: z
    .array(
      z.object({
        entityType: z.enum(['user', 'group', 'team', 'organization']).describe('The entity type.'),
        entityId: z.union([z.number().int(), z.string()]).describe("The entity's ID."),
      })
    )
    .describe('A list of entities to remove.')
    .optional(),
});
export const annotations = {
  title: 'Remove team members',
  readOnlyHint: false,
  openWorldHint: true,
  destructiveHint: true,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    const endpoint = `/teams/${encodeURIComponent(String(args.teamId))}/bulk-members`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.entities !== undefined) bodyPayload.entities = args.entities;
    const options: any = {
      body: JSON.stringify(bodyPayload),
      contentType: ContentType.Json,
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
