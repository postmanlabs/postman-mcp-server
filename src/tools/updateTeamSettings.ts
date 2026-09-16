import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'updateTeamSettings';
export const title = 'Update team settings';
export const description =
  "Updates a team's settings. This is a PUT and applies team-wide, affecting every member\nat once — read the current values with getTeamSettings first and send the full intended\nstate, since a partial body can reset settings you did not mean to touch.\nOnly call this on an explicit instruction naming the setting to change. Do not use it to\ninfer configuration an operator did not ask for.\n";
export const parameters = z.object({
  teamId: z.number().int().describe("The team's ID."),
  settings: z
    .object({
      rfa_for_add_member: z
        .enum(['enabled', 'disabled'])
        .describe('If enabled, admins must approve any new team members before they can join.')
        .optional(),
      rfa_for_add_collaborator: z
        .enum(['enabled', 'disabled'])
        .describe(
          "If enabled, collaborators require approval before they can access the team's workspaces."
        )
        .optional(),
    })
    .describe('Information about the team settings.')
    .optional(),
});
export const annotations = {
  title: 'Update team settings',
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
    const endpoint = `/teams/${encodeURIComponent(String(args.teamId))}/settings`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.settings !== undefined) bodyPayload.settings = args.settings;
    const options: any = {
      body: JSON.stringify(bodyPayload),
      contentType: ContentType.Json,
      headers: extra.headers,
    };
    const result = await extra.client.put(url, options);
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
