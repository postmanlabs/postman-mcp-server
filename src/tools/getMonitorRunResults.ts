import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'getMonitorRunResults';
export const description =
  'Gets results for a monitor run, including trimmed execution logs (beforeItem and assertion events only) and result counts. Use this to inspect per-request assertions and failure details for a specific run.';

export const parameters = z.object({
  monitorId: z.string().describe("The monitor's ID."),
  runId: z.string().describe("The run's ID."),
});

export const annotations = {
  title: 'Get Monitor Run Results',
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    const endpoint = `/monitors/${encodeURIComponent(args.monitorId)}/runs/${encodeURIComponent(args.runId)}/results`;
    const result = await extra.client.get(endpoint, { headers: extra.headers });
    return {
      content: [
        {
          type: 'text',
          text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
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
