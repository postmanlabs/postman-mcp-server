import { z } from 'zod';
import { fetchPostmanAPI, ContentType } from '../clients/postman.js';

export const method = 'duplicate-collection';
export const description =
  "Creates a duplicate of the given collection in another workspace.\n\nUse the GET \\`/collection-duplicate-tasks/{taskId}\\` endpoint to get the duplication task's current status.\n";
export const parameters = z.object({
  collectionId: z.string().describe("The collection's unique ID."),
  workspace: z.string().describe('The workspace ID in which to duplicate the collection.'),
  suffix: z
    .string()
    .describe("An optional suffix to append to the duplicated collection's name.")
    .optional(),
});
export const annotations = {
  title:
    "Creates a duplicate of the given collection in another workspace.\n\nUse the GET \\`/collection-duplicate-tasks/{taskId}\\` endpoint to get the duplication task's current status.\n",
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/collections/${params.collectionId}/duplicates`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (params.workspace !== undefined) bodyPayload.workspace = params.workspace;
    if (params.suffix !== undefined) bodyPayload.suffix = params.suffix;
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
