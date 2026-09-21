import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'getTeamUser';
export const title = 'Get a team user';
export const description =
  "Gets one member of the Postman team by user ID. Use this when you already hold a user\nID — from an audit log entry or a role assignment — and need that single person's\ndetails; use getTeamUsers when you need to search or list.\nThis returns another person on the team. To find out who the current API key belongs\nto, use getAuthenticatedUser instead.\n";
export const parameters = z.object({ userId: z.number().int().describe("The user's ID.") });
export const annotations = {
  title: 'Get a team user',
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
    const endpoint = `/users/${encodeURIComponent(String(args.userId))}`;
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
