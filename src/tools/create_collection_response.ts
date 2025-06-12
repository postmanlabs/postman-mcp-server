import { z } from 'zod';
import { fetchPostmanAPI, ContentType } from '../clients/postman.js';

export const method = 'create-collection-response';
export const description =
  'Creates a request response in a collection. For a complete list of request body properties, refer to the **Response** entry in the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).\n\n**Note:**\n\nIt is recommended that you pass the \\`name\\` property in the request body. If you do not, the system uses a null value. As a result, this creates a response with a blank name.\n';
export const parameters = z.object({
  collectionId: z.string().describe("The collection's ID."),
  requestId: z.string().describe("The parent request's ID."),
  name: z
    .string()
    .describe(
      "The response's name. It is recommended that you pass the `name` property in the request body. If you do not, the system uses a null value. As a result, this creates a response with a blank name."
    )
    .optional(),
});
export const annotations = {
  title:
    'Creates a request response in a collection. For a complete list of request body properties, refer to the **Response** entry in the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).\n\n**Note:**\n\nIt is recommended that you pass the \\`name\\` property in the request body. If you do not, the system uses a null value. As a result, this creates a response with a blank name.\n',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/collections/${params.collectionId}/responses`;
    const query = new URLSearchParams();
    if (params.requestId !== undefined) query.set('requestId', String(params.requestId));
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (params.name !== undefined) bodyPayload.name = params.name;
    const result = await fetchPostmanAPI(url, {
      method: 'POST',
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
