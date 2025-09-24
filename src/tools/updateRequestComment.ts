import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
import {
  IsomorphicHeaders,
  McpError,
  ErrorCode,
  CallToolResult,
} from '@modelcontextprotocol/sdk/types.js';

function asMcpError(error: unknown): McpError {
  const cause = (error as any)?.cause ?? String(error);
  return new McpError(ErrorCode.InternalError, cause);
}

export const method = 'updateRequestComment';
export const description =
  'Updates a comment on a request.\n\n**Note:**\n\nThis endpoint accepts a max of 10,000 characters.\n';
export const parameters = z.object({
  collectionId: z.string().describe("The collection's unique ID."),
  requestId: z.string().describe("The request's unique ID."),
  commentId: z.number().int().describe("The comment's ID."),
  body: z.string().describe('The contents of the comment.'),
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
    'Updates a comment on a request.\n\n**Note:**\n\nThis endpoint accepts a max of 10,000 characters.\n',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders }
): Promise<CallToolResult> {
  try {
    const endpoint = `/collections/${args.collectionId}/requests/${args.requestId}/comments/${args.commentId}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.body !== undefined) bodyPayload.body = args.body;
    if (args.tags !== undefined) bodyPayload.tags = args.tags;
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
