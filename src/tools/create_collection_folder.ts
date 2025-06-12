import { z } from 'zod';
import { fetchPostmanAPI, ContentType } from '../clients/postman.js';

export const method = 'create-collection-folder';
export const description =
  'Creates a folder in a collection. For a complete list of properties, refer to the **Folder** entry in the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).\n\nYou can use this endpoint to to import requests and responses into a newly-created folder. To do this, include the \\`requests\\` field and the list of request objects in the request body. For more information, see the provided example.\n\n**Note:**\n\nIt is recommended that you pass the \\`name\\` property in the request body. If you do not, the system uses a null value. As a result, this creates a folder with a blank name.\n';
export const parameters = z.object({
  collectionId: z.string().describe("The collection's ID."),
  name: z
    .string()
    .describe(
      "The folder's name. It is recommended that you pass the `name` property in the request body. If you do not, the system uses a null value. As a result, this creates a folder with a blank name."
    )
    .optional(),
  folder: z.string().describe('The ID of a folder in which to create the folder.').optional(),
});
export const annotations = {
  title:
    'Creates a folder in a collection. For a complete list of properties, refer to the **Folder** entry in the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).\n\nYou can use this endpoint to to import requests and responses into a newly-created folder. To do this, include the \\`requests\\` field and the list of request objects in the request body. For more information, see the provided example.\n\n**Note:**\n\nIt is recommended that you pass the \\`name\\` property in the request body. If you do not, the system uses a null value. As a result, this creates a folder with a blank name.\n',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/collections/${params.collectionId}/folders`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (params.name !== undefined) bodyPayload.name = params.name;
    if (params.folder !== undefined) bodyPayload.folder = params.folder;
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
