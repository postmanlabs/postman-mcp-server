import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';

export const method = 'unpublish-documentation';
export const description =
  "Unpublishes a collection's documentation. On success, this returns an HTTP \\`204 No Content\\` response.";
export const parameters = z.object({
  collectionId: z.string().describe("The collection's unique ID."),
});
export const annotations = {
  title:
    "Unpublishes a collection's documentation. On success, this returns an HTTP \\`204 No Content\\` response.",
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/collections/${params.collectionId}/public-documentations`;
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
