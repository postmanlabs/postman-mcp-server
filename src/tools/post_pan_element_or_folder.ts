import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';

export const method = 'post-pan-element-or-folder';
export const description =
  "Publishes a element or creates a folder in your team's [Private API Network](https://learning.postman.com/docs/collaborating-in-postman/adding-private-network/). An element is a Postman API, collection, or workspace.\n\n**Note:**\n\nYou can only pass one element object type per call. For example, you cannot pass both \\`api\\` and \\`collection\\` in a single request.\n";
export const parameters = z.object({});
export const annotations = {
  title:
    "Publishes a element or creates a folder in your team's [Private API Network](https://learning.postman.com/docs/collaborating-in-postman/adding-private-network/). An element is a Postman API, collection, or workspace.\n\n**Note:**\n\nYou can only pass one element object type per call. For example, you cannot pass both \\`api\\` and \\`collection\\` in a single request.\n",
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/network/private`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const result = await fetchPostmanAPI(url, {
      method: 'POST',
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
