import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';
import { IsomorphicHeaders } from '@modelcontextprotocol/sdk/types.js';

export const method = 'get-response-comments';
export const description = 'Gets all comments left by users in a response.';
export const parameters = z.object({
  collectionId: z.string().describe("The collection's unique ID."),
  responseId: z.string().describe("The response's unique ID."),
});
export const annotations = {
  title: 'Gets all comments left by users in a response.',
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string; headers?: IsomorphicHeaders }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/collections/${params.collectionId}/responses/${params.responseId}/comments`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const result = await fetchPostmanAPI(url, {
      method: 'GET',
      apiKey: extra.apiKey,
      headers: extra.headers,
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
