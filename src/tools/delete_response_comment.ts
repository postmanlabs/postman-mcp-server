import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';

export const method = 'delete-response-comment';
export const description =
  'Deletes a comment from a response. On success, this returns an HTTP \\`204 No Content\\` response.\n\n**Note:**\n\nDeleting the first comment of a thread deletes all the comments in the thread.\n';
export const parameters = z.object({
  collectionId: z.string().describe("The collection's unique ID."),
  responseId: z.string().describe("The response's unique ID."),
  commentId: z.number().int().describe("The comment's ID."),
});
export const annotations = {
  title:
    'Deletes a comment from a response. On success, this returns an HTTP \\`204 No Content\\` response.\n\n**Note:**\n\nDeleting the first comment of a thread deletes all the comments in the thread.\n',
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/collections/${params.collectionId}/responses/${params.responseId}/comments/${params.commentId}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const result = await fetchPostmanAPI(url, {
      method: 'DELETE',
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
