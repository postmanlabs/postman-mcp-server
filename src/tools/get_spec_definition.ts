import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';
import { IsomorphicHeaders } from '@modelcontextprotocol/sdk/types.js';

export const method = 'get-spec-definition';
export const description = "Gets the complete contents of an API specification's definition.";
export const parameters = z.object({ specId: z.string().describe("The spec's ID.") });
export const annotations = {
  title: "Gets the complete contents of an API specification's definition.",
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string; headers?: IsomorphicHeaders }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/specs/${params.specId}/definitions`;
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
