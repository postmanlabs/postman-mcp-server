import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';

export const method = 'get-status-of-an-async-task';
export const description = 'Gets the status of an asynchronous task.';
export const parameters = z.object({
  apiId: z.string().describe("The API's ID."),
  taskId: z.string().describe("The task's ID."),
  Accept: z
    .literal('application/vnd.api.v10+json')
    .describe('The `application/vnd.api.v10+json` request header required to use the endpoint.'),
});
export const annotations = {
  title: 'Gets the status of an asynchronous task.',
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/apis/${params.apiId}/tasks/${params.taskId}`;
    const query = new URLSearchParams();
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
