import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'approveDenyAccessRequest';
export const title = 'Approve or deny an access request';
export const description =
  'Approves or denies a pending team access request. Get the request ID from\ngetTeamAccessRequests.\nApproving grants someone access to the team and its contents, and that is an\nauthorization decision, not a piece of bookkeeping. Only call this when an operator has\nexplicitly told you which request to approve or deny — never to clear a backlog of\npending requests, and never by inferring intent from the request itself.\n';
export const parameters = z.object({
  identifierType: z
    .string()
    .describe('Use SCIM user and group IDs instead of Postman user IDs.')
    .optional(),
  teamId: z.number().int().describe("The team's ID."),
  requestId: z.number().int().describe("The access request's ID."),
  action: z.enum(['approve', 'deny']).describe('Whether to approve or deny the access request.'),
});
export const annotations = {
  title: 'Approve or deny an access request',
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
    const endpoint = `/teams/${encodeURIComponent(String(args.teamId))}/access-requests/${encodeURIComponent(String(args.requestId))}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.action !== undefined) bodyPayload.action = args.action;
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
