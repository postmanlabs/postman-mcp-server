import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';

export const method = 'delete-collection-response';
export const description = 'Deletes a response in a collection.';
export const parameters = z.object({
  responseId: z.string().describe("The response's ID."),
  collectionId: z.string().describe("The collection's ID."),
});
export const annotations = {
  title: 'Deletes a response in a collection.',
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/collections/${params.collectionId}/responses/${params.responseId}`;
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
