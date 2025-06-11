import { z } from 'zod';
import { fetchPostmanAPI, ContentType } from '../clients/postman.js';

export const method = 'update-collection-request';
export const description =
  'Updates a request in a collection. For a complete list of properties, refer to the **Request** entry in the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).\n\n**Note:**\n\n- You must pass a collection ID (\\`12ece9e1-2abf-4edc-8e34-de66e74114d2\\`), not a collection(\\`12345678-12ece9e1-2abf-4edc-8e34-de66e74114d2\\`), in this endpoint.\n- This endpoint does not support changing the folder of a request.\n';
export const parameters = z.object({
  requestId: z.string().describe("The request's ID."),
  collectionId: z.string().describe("The collection's ID."),
  name: z.string().describe("The request's name.").optional(),
  method: z
    .enum([
      'GET',
      'PUT',
      'POST',
      'PATCH',
      'DELETE',
      'COPY',
      'HEAD',
      'OPTIONS',
      'LINK',
      'UNLINK',
      'PURGE',
      'LOCK',
      'UNLOCK',
      'PROPFIND',
      'VIEW',
    ])
    .describe("The request's method.")
    .optional(),
});
export const annotations = {
  title:
    'Updates a request in a collection. For a complete list of properties, refer to the **Request** entry in the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).\n\n**Note:**\n\n- You must pass a collection ID (\\`12ece9e1-2abf-4edc-8e34-de66e74114d2\\`), not a collection(\\`12345678-12ece9e1-2abf-4edc-8e34-de66e74114d2\\`), in this endpoint.\n- This endpoint does not support changing the folder of a request.\n',
  readOnlyHint: false,
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
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (params.name !== undefined) bodyPayload.name = params.name;
    if (params.method !== undefined) bodyPayload.method = params.method;
    const result = await fetchPostmanAPI(url, {
      method: 'PUT',
      body: JSON.stringify(bodyPayload),
      contentType: ContentType.Json,
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
