import { z } from 'zod';
import { fetchPostmanAPI, ContentType } from '../clients/postman.js';

export const method = 'create-update-spec-file';
export const description = "Creates or updates an API specification's file.\n";
export const parameters = z.object({
  specId: z.string().describe("The spec's ID."),
  filePath: z.string().describe('The path to the file.'),
  content: z.string().describe("The specification's stringified contents."),
});
export const annotations = {
  title: "Creates or updates an API specification's file.\n",
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/specs/${params.specId}/files/${params.filePath}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (params.content !== undefined) bodyPayload.content = params.content;
    const result = await fetchPostmanAPI(url, {
      method: 'PATCH',
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
