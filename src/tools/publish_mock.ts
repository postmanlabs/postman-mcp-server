import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';

export const method = 'publish-mock';
export const description =
  'Publishes a mock server. Publishing a mock server sets its **Access Control** configuration setting to public.';
export const parameters = z.object({ mockId: z.string().describe("The mock's ID.") });
export const annotations = {
  title:
    'Publishes a mock server. Publishing a mock server sets its **Access Control** configuration setting to public.',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/mocks/${params.mockId}/publish`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const result = await fetchPostmanAPI(url, {
      method: 'POST',
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
