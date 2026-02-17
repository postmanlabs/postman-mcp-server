import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'createCollectionComment';
export const description =
  'Creates a comment on a collection. To create a reply on an existing comment, include the \\`threadId\\` property in the request body.\n\n**Note:**\n\nThis endpoint accepts a max of 10,000 characters.\n';
export const parameters = z.object({
  collectionId: z.string().describe("The collection's unique ID."),
  body: z.string().describe('The contents of the comment.'),
  threadId: z
    .number()
    .int()
    .describe(
      "The comment's thread ID. To create a reply on an existing comment, include this property."
    )
    .optional(),
  tags: z
    .object({
      '{{userName}}': z
        .object({
          type: z.literal('user').describe('The `user` value.'),
          id: z.string().describe("The user's ID."),
        })
        .describe(
          "An object that contains information about the tagged user. The object's name is the user's Postman username. For example, `@user-postman`."
        )
        .optional(),
    })
    .describe('Information about users tagged in the `body` comment.')
    .optional(),
});
export const annotations = {
  title:
    'Creates a comment on a collection. To create a reply on an existing comment, include the \\`threadId\\` property in the request body.',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    const endpoint = `/collections/${args.collectionId}/comments`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.body !== undefined) bodyPayload.body = args.body;
    if (args.threadId !== undefined) bodyPayload.threadId = args.threadId;
    if (args.tags !== undefined) bodyPayload.tags = args.tags;
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
