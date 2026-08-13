import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'updatePullRequest';
export const title = 'Update a pull request';
export const description =
  'Updates the editable metadata of an open pull request, such as its title,\ndescription, or reviewers. Use reviewPullRequest (not this tool) to approve,\ndecline, or merge a pull request.\n';
export const parameters = z.object({
  pullRequestId: z.string().describe("The pull request's ID."),
  title: z.string().describe("The pull request's updated title."),
  description: z.string().describe('The updated pull request description.').optional(),
  reviewers: z
    .array(z.string().describe("The reviewer's user ID."))
    .describe(
      "An updated list of the pull request's assigned reviewers. This replaces all existing users assigned to the pull request with those you pass in the request body."
    ),
});
export const annotations = {
  title: 'Update a pull request',
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
    const endpoint = `/pull-requests/${encodeURIComponent(String(args.pullRequestId))}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.title !== undefined) bodyPayload.title = args.title;
    if (args.description !== undefined) bodyPayload.description = args.description;
    if (args.reviewers !== undefined) bodyPayload.reviewers = args.reviewers;
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
