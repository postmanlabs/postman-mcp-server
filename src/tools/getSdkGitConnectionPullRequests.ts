import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'getSdkGitConnectionPullRequests';
export const title = "Get an SDK Git connection's pull requests";
export const description =
  'Lists the SDK-update pull requests opened through one Git connection. Use this to report\non what has been delivered to a repository and what is still waiting to be merged. The\nrecord survives disconnection, so a disconnected connection still returns its history.\nThese are pull requests in the connected Git repository, not Postman collection pull\nrequests — use getCollectionPullRequests for those. Requires a Postman Team or\nEnterprise plan.\n';
export const parameters = z.object({
  sdkGitConnectionId: z.string().describe("The Git connection's ID."),
  status: z
    .enum(['open', 'merged', 'closed'])
    .describe('Filter results by pull request status.')
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
    .lte(25)
    .describe(
      'The maximum number of rows to return in the response, up to a maximum value of 25. Any value greater than 25 returns a 400 Bad Request response.'
    )
    .default(25),
});
export const annotations = {
  title: "Get an SDK Git connection's pull requests",
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
    const endpoint = `/sdk-git-connections/${encodeURIComponent(String(args.sdkGitConnectionId))}/pull-requests`;
    const query = new URLSearchParams();
    if (args.status !== undefined) query.set('status', String(args.status));
    if (args.cursor !== undefined) query.set('cursor', String(args.cursor));
    if (args.limit !== undefined) query.set('limit', String(args.limit));
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
