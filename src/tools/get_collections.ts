import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';

export const method = 'get-collections';
export const description =
  'The workspace ID query is required for this endpoint. If not provided, the LLM should ask the user to provide it.';
export const parameters = z.object({
  workspace: z.string().describe("The workspace's ID."),
  name: z.string().describe('Filter results by collections that match the given name.').optional(),
  limit: z
    .number()
    .int()
    .describe('The maximum number of rows to return in the response.')
    .optional(),
  offset: z
    .number()
    .int()
    .describe('The zero-based offset of the first item to return.')
    .optional(),
});
export const annotations = {
  title:
    'The workspace ID query is required for this endpoint. If not provided, the LLM should ask the user to provide it.',
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/collections`;
    const query = new URLSearchParams();
    if (params.workspace !== undefined) query.set('workspace', String(params.workspace));
    if (params.name !== undefined) query.set('name', String(params.name));
    if (params.limit !== undefined) query.set('limit', String(params.limit));
    if (params.offset !== undefined) query.set('offset', String(params.offset));
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const result = await fetchPostmanAPI(url, {
      method: 'GET',
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
