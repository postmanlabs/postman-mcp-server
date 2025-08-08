import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';
import { IsomorphicHeaders, McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

function asMcpError(error: unknown): McpError {
  const cause = (error as any)?.cause ?? String(error);
  return new McpError(ErrorCode.InternalError, cause);
}

export const method = 'run-monitor';
export const description =
  'Runs a monitor and returns its run results.\n\n**Note:**\n\n- This endpoint has a timeout restriction of 300 seconds. It is recommended that you include the \\`async=true\\` query parameter when using this endpoint.\n- If you pass the \\`async=true\\` query parameter, the response does not return the \\`stats\\`, \\`executions\\`, and \\`failures\\` responses. To get this information for an asynchronous run, call the GET \\`/monitors/{id}\\` endpoint.\n';
export const parameters = z.object({
  monitorId: z.string().describe("The monitor's ID."),
  async: z
    .boolean()
    .describe(
      'If true, runs the monitor asynchronously from the created monitor run task. By default, the server will not respond until the task finishes (`false`).'
    )
    .default(false),
});
export const annotations = {
  title:
    'Runs a monitor and returns its run results.\n\n**Note:**\n\n- This endpoint has a timeout restriction of 300 seconds. It is recommended that you include the \\`async=true\\` query parameter when using this endpoint.\n- If you pass the \\`async=true\\` query parameter, the response does not return the \\`stats\\`, \\`executions\\`, and \\`failures\\` responses. To get this information for an asynchronous run, call the GET \\`/monitors/{id}\\` endpoint.\n',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string; headers?: IsomorphicHeaders }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/monitors/${params.monitorId}/run`;
    const query = new URLSearchParams();
    if (params.async !== undefined) query.set('async', String(params.async));
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const result = await fetchPostmanAPI(url, {
      method: 'POST',
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
  } catch (e: unknown) {
    if (e instanceof McpError) {
      throw e;
    }
    throw asMcpError(e);
  }
}
