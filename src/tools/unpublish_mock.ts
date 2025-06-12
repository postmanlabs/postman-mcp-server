import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';

export const method = 'unpublish-mock';
export const description =
  'Unpublishes a mock server. Unpublishing a mock server sets its **Access Control** configuration setting to private.';
export const parameters = z.object({ mockId: z.string().describe("The mock's ID.") });
export const annotations = {
  title:
    'Unpublishes a mock server. Unpublishing a mock server sets its **Access Control** configuration setting to private.',
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/mocks/${params.mockId}/unpublish`;
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
