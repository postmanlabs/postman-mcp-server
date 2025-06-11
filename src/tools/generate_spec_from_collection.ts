import { z } from 'zod';
import { fetchPostmanAPI, ContentType } from '../clients/postman.js';

export const method = 'generate-spec-from-collection';
export const description =
  'Generates an API specification for the given collection. The response contains a polling link to the task status.';
export const parameters = z.object({
  collectionUid: z.string().describe("The collection's unique ID."),
  elementType: z.literal('spec').describe('The `spec` value.'),
  name: z.string().describe("The API specification's name.").optional(),
  type: z.literal('OPENAPI:3.0').describe("The specification's type.").optional(),
  format: z.enum(['JSON', 'YAML']).describe('The format of the API specification.').optional(),
});
export const annotations = {
  title:
    'Generates an API specification for the given collection. The response contains a polling link to the task status.',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/collections/${params.collectionUid}/generations/${params.elementType}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (params.name !== undefined) bodyPayload.name = params.name;
    if (params.type !== undefined) bodyPayload.type = params.type;
    if (params.format !== undefined) bodyPayload.format = params.format;
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
