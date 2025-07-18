import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';

export const method = 'get-request-comments';
export const description = 'Gets all comments left by users in a request.';
export const parameters = z.object({
  collectionId: z.string().describe("The collection's unique ID."),
  requestId: z
    .string()
    .describe(
      "The request ID must contain the team ID as a prefix, in `teamId-requestId` format.\n\nFor example, if you're creating a comment on collection ID `24585957-7b2c98f7-30db-4b67-8685-0079f48a0947` (note on the prefix), and\nthe collection request's ID is `2c450b59-9bbf-729b-6ac0-f92535a7c336`, then the `{requestId}` must be `24585957-2c450b59-9bbf-729b-6ac0-f92535a7c336`.\n"
    ),
});
export const annotations = {
  title: 'Gets all comments left by users in a request.',
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/collections/${params.collectionId}/requests/${params.requestId}/comments`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const result = await fetchPostmanAPI(url, {
      method: 'GET',
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
