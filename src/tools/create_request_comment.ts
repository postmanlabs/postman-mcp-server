import { z } from 'zod';
import { fetchPostmanAPI, ContentType } from '../clients/postman.js';

export const method = 'create-request-comment';
export const description =
  "The request ID must contain the team ID as a prefix, in \\`teamId-requestId\\` format.\n\nFor example, if you're creating a comment on collection ID \\`24585957-7b2c98f7-30db-4b67-8685-0079f48a0947\\` (note on the prefix), and\nthe collection request's ID is \\`2c450b59-9bbf-729b-6ac0-f92535a7c336\\`, then the \\`{requestId}\\` must be \\`24585957-2c450b59-9bbf-729b-6ac0-f92535a7c336\\`.\n";
export const parameters = z.object({
  collectionId: z.string().describe("The collection's unique ID."),
  requestId: z
    .string()
    .describe(
      "The request ID must contain the team ID as a prefix, in `teamId-requestId` format.\n\nFor example, if you're creating a comment on collection ID `24585957-7b2c98f7-30db-4b67-8685-0079f48a0947` (note on the prefix), and\nthe collection request's ID is `2c450b59-9bbf-729b-6ac0-f92535a7c336`, then the `{requestId}` must be `24585957-2c450b59-9bbf-729b-6ac0-f92535a7c336`.\n"
    ),
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
          id: z.number().int().describe("The user's ID."),
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
    "The request ID must contain the team ID as a prefix, in \\`teamId-requestId\\` format.\n\nFor example, if you're creating a comment on collection ID \\`24585957-7b2c98f7-30db-4b67-8685-0079f48a0947\\` (note on the prefix), and\nthe collection request's ID is \\`2c450b59-9bbf-729b-6ac0-f92535a7c336\\`, then the \\`{requestId}\\` must be \\`24585957-2c450b59-9bbf-729b-6ac0-f92535a7c336\\`.\n",
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/collections/${params.collectionId}/requests/${params.requestId}/comments`;
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
