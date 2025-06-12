import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';

export const method = 'delete-spec';
export const description =
  'Deletes an API specification. On success, this returns an HTTP \\`204 No Content\\` response.';
export const parameters = z.object({ specId: z.string().describe("The spec's ID.") });
export const annotations = {
  title:
    'Deletes an API specification. On success, this returns an HTTP \\`204 No Content\\` response.',
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/specs/${params.specId}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const result = await fetchPostmanAPI(url, {
      method: 'DELETE',
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
