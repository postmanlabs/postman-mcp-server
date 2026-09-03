import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'updateSdkGitConnection';
export const title = 'Update an SDK Git connection';
export const description =
  "Changes an SDK Git connection's lifecycle status. Setting \\`active\\` connects or\nreconnects the repository and resumes auto-update pull requests; \\`disconnected\\` stops\nany further pull requests being opened while preserving the historical record, which\nstays queryable through getSdkGitConnectionPullRequests. The call is idempotent, so\nsetting current values is a harmless no-op.\nThe \\`inaccessible\\` status is set by Postman and cannot be assigned here — seeing it\nmeans the repository or its credentials need attention on the Git side.\n\\`autoUpdatePullRequestsEnabled\\` is Enterprise-only and is forced to false on Team\nplans. Requires a Postman Team or Enterprise plan.\n";
export const parameters = z.object({
  sdkGitConnectionId: z.string().describe("The Git connection's ID."),
  status: z
    .enum(['active', 'disconnected'])
    .describe('The updated SDK Git connection lifecycle state.'),
  autoUpdatePullRequestsEnabled: z
    .boolean()
    .describe(
      "If true, pull requests are opened automatically whenever the source changes or a new version of the SDK generator is released. If false, pull requests are opened automatically, but only for manually-triggered SDK regeneration. If `autoUpdatePullRequestsEnabled` isn't set, the default behavior depends on the user's Postman plan:\n\n- **Enterprise** plan users — Defaults to the `true` value.\n- **Team** plan users and read only — Defaults to the `false` value.\n"
    )
    .optional(),
});
export const annotations = {
  title: 'Update an SDK Git connection',
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
    const endpoint = `/sdk-git-connections/${encodeURIComponent(String(args.sdkGitConnectionId))}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.status !== undefined) bodyPayload.status = args.status;
    if (args.autoUpdatePullRequestsEnabled !== undefined)
      bodyPayload.autoUpdatePullRequestsEnabled = args.autoUpdatePullRequestsEnabled;
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
