import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';
import { IsomorphicHeaders } from '@modelcontextprotocol/sdk/types.js';

export const method = 'delete-collection';
export const description = 'Deletes a collection.';
export const parameters = z.object({
  collectionId: z
    .string()
    .describe(
      'The collection ID must be in the form <OWNER_ID>-<UUID> (e.g. 12345-33823532ab9e41c9b6fd12d0fd459b8b).'
    ),
});
export const annotations = {
  title: 'Deletes a collection.',
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string; headers?: IsomorphicHeaders }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/collections/${params.collectionId}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const result = await fetchPostmanAPI(url, {
      method: 'DELETE',
      apiKey: extra.apiKey,
      headers: extra.headers,
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
