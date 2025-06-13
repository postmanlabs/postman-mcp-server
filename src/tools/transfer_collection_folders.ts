import { z } from 'zod';
import { fetchPostmanAPI, ContentType } from '../clients/postman.js';

export const method = 'transfer-collection-folders';
export const description = 'Copies or moves folders into a collection or folder.';
export const parameters = z.object({
  ids: z
    .array(z.string())
    .describe('A list of collection request, response, or folder UIDs to transfer.'),
  mode: z.enum(['copy', 'move']).describe('The transfer operation to perform.'),
  target: z
    .object({
      id: z.string().describe('The UID of the destination collection, folder, or request.'),
      model: z
        .enum(['collection', 'folder', 'request'])
        .describe(
          'The collection, folder, or request that the items will be transferred to. For response transfers, use the `request` value.'
        ),
    })
    .describe("Information about the item transfer's destination location."),
  location: z
    .object({
      id: z
        .string()
        .nullable()
        .describe("For `before` or `after` positions, the model's UID.")
        .optional(),
      model: z
        .string()
        .nullable()
        .describe(
          'For `before` or `after` positions, the type of item (model) that the transferred item will be positioned by. One of: `folder`, `request`, or `response.`\n'
        )
        .optional(),
      position: z
        .enum(['start', 'end', 'before', 'after'])
        .describe("The transferred item's position within the destination object.")
        .default('end'),
    })
    .describe(
      "The transferred items' placement in the target destination:\n- For `start` or `end` — Do not include the `model` and `id` values.\n- For `before` or `after` — Include the `model` and `id` properties.\n"
    ),
});
export const annotations = {
  title: 'Copies or moves folders into a collection or folder.',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/collection-folders-transfers`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (params.ids !== undefined) bodyPayload.ids = params.ids;
    if (params.mode !== undefined) bodyPayload.mode = params.mode;
    if (params.target !== undefined) bodyPayload.target = params.target;
    if (params.location !== undefined) bodyPayload.location = params.location;
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
