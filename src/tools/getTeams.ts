import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'getTeams';
export const title = 'Get all teams';
export const description =
  "Lists the Postman teams in the organization. Use this to discover team IDs before\nreading a team's settings, members, or access requests. Page with \\`limit\\` and \\`cursor\\`,\nand pass \\`teamSettings\\` or \\`userRoles\\` to include those in the response.\nThis lists teams in the organization, not the members of a team — use getTeamUsers for\npeople and getGroups for user groups.\n";
export const parameters = z.object({
  identifierType: z
    .string()
    .describe('Use SCIM user and group IDs instead of Postman user IDs.')
    .optional(),
  cursor: z
    .string()
    .describe(
      'The pointer to the first record of the set of paginated results. To view the next response, use the `nextCursor` value for this parameter.'
    )
    .optional(),
  limit: z
    .number()
    .int()
    .describe('The maximum number of rows to return in the response.')
    .default(50),
  settings: z.boolean().describe('If true, returns team settings in the response.').default(false),
  userRoles: z
    .boolean()
    .describe("If true, returns the team's assigned user roles in the response.")
    .default(false),
});
export const annotations = {
  title: 'Get all teams',
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
    const endpoint = `/teams`;
    const query = new URLSearchParams();
    if (args.cursor !== undefined) query.set('cursor', String(args.cursor));
    if (args.limit !== undefined) query.set('limit', String(args.limit));
    if (args.settings !== undefined) query.set('settings', String(args.settings));
    if (args.userRoles !== undefined) query.set('userRoles', String(args.userRoles));
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
