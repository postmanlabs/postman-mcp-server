import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';

export const method = 'sync-collection-with-spec';
export const description =
  'Syncs a collection generated from an API specification. This is an asynchronous endpoint that returns an HTTP \\`202 Accepted\\` response.\n\n**Note:**\n\n- This endpoint only supports the OpenAPI 3.0 specification type.\n- You can only sync collections generated from the given spec ID.\n';
export const parameters = z.object({
  collectionUid: z.string().describe("The collection's unique ID."),
  specId: z.string().describe("The spec's ID."),
});
export const annotations = {
  title:
    'Syncs a collection generated from an API specification. This is an asynchronous endpoint that returns an HTTP \\`202 Accepted\\` response.\n\n**Note:**\n\n- This endpoint only supports the OpenAPI 3.0 specification type.\n- You can only sync collections generated from the given spec ID.\n',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/collections/${params.collectionUid}/synchronizations`;
    const query = new URLSearchParams();
    if (params.specId !== undefined) query.set('specId', String(params.specId));
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
