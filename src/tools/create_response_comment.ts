import { z } from 'zod';
import { fetchPostmanAPI, ContentType } from '../clients/postman.js';

export const method = 'create-response-comment';
export const description =
  'Creates a comment on a response. To create a reply on an existing comment, include the \\`threadId\\` property in the request body.\n\n**Note:**\n\nThis endpoint accepts a max of 10,000 characters.\n';
export const parameters = z.object({
  collectionId: z.string().describe("The collection's unique ID."),
  responseId: z.string().describe("The response's unique ID."),
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
      userName: z
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
    'Creates a comment on a response. To create a reply on an existing comment, include the \\`threadId\\` property in the request body.\n\n**Note:**\n\nThis endpoint accepts a max of 10,000 characters.\n',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/collections/${params.collectionId}/responses/${params.responseId}/comments`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (params.body !== undefined) bodyPayload.body = params.body;
    if (params.threadId !== undefined) bodyPayload.threadId = params.threadId;
    if (params.tags !== undefined) bodyPayload.tags = params.tags;
    const result = await fetchPostmanAPI(url, {
      method: 'POST',
      body: JSON.stringify(bodyPayload),
      contentType: ContentType.Json,
      apiKey: extra.apiKey,
    });
    return {
      content: [
        {
          type: 'text',
          text: `${typeof result === 'string' ? result : JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  } catch (e: any) {
    return {
      content: [{ type: 'text', text: `Failed: ${e.message}` }],
    };
  }
}
