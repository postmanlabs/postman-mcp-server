import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';

export const method = 'get-collection';
export const description =
  "Gets information about a collection. For a complete list of this endpoint's possible values, refer to the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).";
export const parameters = z.object({
  collectionId: z.string().describe("The collection's ID."),
  access_key: z
    .string()
    .describe(
      "A collection's read-only access key. Using this query parameter does not require an API key to call the endpoint."
    )
    .optional(),
  model: z
    .literal('minimal')
    .describe(
      "Return a list of only the collection's root-level request (`rootLevelRequests`) and folder (`rootLevelFolders`) IDs instead of the full collection element data."
    )
    .optional(),
});
export const annotations = {
  title:
    "Gets information about a collection. For a complete list of this endpoint's possible values, refer to the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).",
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/collections/${params.collectionId}`;
    const query = new URLSearchParams();
    if (params.access_key !== undefined) query.set('access_key', String(params.access_key));
    if (params.model !== undefined) query.set('model', String(params.model));
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
