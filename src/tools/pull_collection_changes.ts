import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';

export const method = 'pull-collection-changes';
export const description =
  "Pulls the changes from a parent (source) collection into the forked collection. In the endpoint's response:\n\n- The \\`destinationId\\` is the ID of the forked collection.\n- The \\`sourceId\\` is the ID of the source collection.\n";
export const parameters = z.object({ collectionId: z.string().describe("The collection's ID.") });
export const annotations = {
  title:
    "Pulls the changes from a parent (source) collection into the forked collection. In the endpoint's response:\n\n- The \\`destinationId\\` is the ID of the forked collection.\n- The \\`sourceId\\` is the ID of the source collection.\n",
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/collections/${params.collectionId}/pulls`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const result = await fetchPostmanAPI(url, {
      method: 'PUT',
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
