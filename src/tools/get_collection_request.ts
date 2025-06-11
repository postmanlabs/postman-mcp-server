import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';

export const method = 'get-collection-request';
export const description = 'Gets information about a request in a collection.';
export const parameters = z.object({
  requestId: z.string().describe("The request's ID."),
  collectionId: z.string().describe("The collection's ID."),
  ids: z
    .boolean()
    .describe('If true, returns only properties that contain ID values in the response.')
    .optional(),
  uid: z.boolean().describe('If true, returns all IDs in UID format (`userId`-`id`).').optional(),
  populate: z
    .boolean()
    .describe("If true, returns all of the collection item's contents.")
    .optional(),
});
export const annotations = {
  title: 'Gets information about a request in a collection.',
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/collections/${params.collectionId}/requests/${params.requestId}`;
    const query = new URLSearchParams();
    if (params.ids !== undefined) query.set('ids', String(params.ids));
    if (params.uid !== undefined) query.set('uid', String(params.uid));
    if (params.populate !== undefined) query.set('populate', String(params.populate));
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
