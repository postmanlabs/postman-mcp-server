import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';

export const method = 'get-collection-forks';
export const description =
  "Gets a collection's forked collections. The response returns data for each fork, such as the fork's ID, the user who forked it, and the fork's creation date.";
export const parameters = z.object({
  collectionId: z.string().describe("The collection's ID."),
  cursor: z
    .string()
    .describe(
      'The pointer to the first record of the set of paginated results. To view the next response, use the `nextCursor` value for this parameter.'
    )
    .optional(),
  limit: z
    .number()
    .int()
    .describe('The maximum number of rows to return in the response.')
    .default(10),
  direction: z
    .enum(['asc', 'desc'])
    .describe(
      'Sort the results by creation date in ascending (`asc`) or descending (`desc`) order.'
    )
    .optional(),
});
export const annotations = {
  title:
    "Gets a collection's forked collections. The response returns data for each fork, such as the fork's ID, the user who forked it, and the fork's creation date.",
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/collections/${params.collectionId}/forks`;
    const query = new URLSearchParams();
    if (params.cursor !== undefined) query.set('cursor', String(params.cursor));
    if (params.limit !== undefined) query.set('limit', String(params.limit));
    if (params.direction !== undefined) query.set('direction', String(params.direction));
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
