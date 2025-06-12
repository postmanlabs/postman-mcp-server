import { z } from 'zod';
import { fetchPostmanAPI, ContentType } from '../clients/postman.js';

export const method = 'update-collection-folder';
export const description =
  'Updates a folder in a collection. For a complete list of properties, refer to the **Folder** entry in the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).\n\n**Note:**\n\nThis endpoint acts like a PATCH method. It only updates the values that you pass in the request body (for example, the \\`name\\` property). The endpoint does not update the entire resource.\n';
export const parameters = z.object({
  folderId: z.string().describe("The folder's ID."),
  collectionId: z.string().describe("The collection's ID."),
  name: z.string().describe("The folder's name.").optional(),
  description: z.string().describe("The folder's description.").optional(),
});
export const annotations = {
  title:
    'Updates a folder in a collection. For a complete list of properties, refer to the **Folder** entry in the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).\n\n**Note:**\n\nThis endpoint acts like a PATCH method. It only updates the values that you pass in the request body (for example, the \\`name\\` property). The endpoint does not update the entire resource.\n',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/collections/${params.collectionId}/folders/${params.folderId}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (params.name !== undefined) bodyPayload.name = params.name;
    if (params.description !== undefined) bodyPayload.description = params.description;
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
