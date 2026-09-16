import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'createAccessRequest';
export const title = 'Create an access request';
export const description =
  "Creates an access request against a team — to join it, to raise a user's role, to add\nmembers, or to request team role access to another team.\nThis asks for a privilege change on someone's behalf, and if team discovery is enabled\nthe request is approved automatically, which means it can grant access with no human in\nthe loop. Only call it on an explicit request from the person the access is for.\n";
export const parameters = z.object({
  teamId: z.number().int().describe("The team's ID."),
  identifierType: z
    .string()
    .describe('Use SCIM user and group IDs instead of Postman user IDs.')
    .optional(),
  entityList: z
    .array(
      z.object({
        entityType: z.enum(['user', 'group', 'team', 'organization']).describe('The entity type.'),
        entityId: z.union([z.number().int(), z.string()]).describe("The entity's ID."),
      })
    )
    .describe('A list of the entities for which to create access requests.'),
  role: z
    .preprocess(
      (v) => (typeof v === 'string' ? v.toUpperCase() : v),
      z.enum([
        'TEAM_MANAGER',
        'TEAM_DEVELOPER',
        'TEAM_GUEST_DEVELOPER',
        'TEAM_GUEST_VIEWER',
        'TEAM_PARTNER_MANAGER',
        'TEAM_PARTNER_LEAD',
        'TEAM_GUEST',
        'TEAM_PARTNER',
        'TEAM_COMMUNITY_MANAGER',
      ])
    )
    .nullable()
    .describe('The team role to request.'),
  reason: z.string().describe('The reason for the access request.'),
  requestType: z
    .preprocess(
      (v) => (typeof v === 'string' ? v.toUpperCase() : v),
      z.enum(['REQUEST_TO_ADD_MEMBERS', 'REQUEST_TO_JOIN', 'UPGRADE_ROLE'])
    )
    .describe('The type of access request.'),
});
export const annotations = {
  title: 'Create an access request',
  readOnlyHint: false,
  openWorldHint: true,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    const endpoint = `/teams/${encodeURIComponent(String(args.teamId))}/access-requests`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.entityList !== undefined) bodyPayload.entityList = args.entityList;
    if (args.role !== undefined) bodyPayload.role = args.role;
    if (args.reason !== undefined) bodyPayload.reason = args.reason;
    if (args.requestType !== undefined) bodyPayload.requestType = args.requestType;
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
