import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'listRunsForExecution';
export const description =
  'Lists runs for a monitor execution. Each execution may produce multiple runs across regions. Returns run metadata including region, state, result counts, and timestamps. Not paginated.';

export const parameters = z.object({
  monitorId: z.string().describe("The monitor's ID."),
  executionId: z.string().describe("The execution's ID."),
});

export const annotations = {
  title: 'List Runs For Monitor Execution',
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    const endpoint = `/monitors/${encodeURIComponent(args.monitorId)}/executions/${encodeURIComponent(args.executionId)}/runs`;
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
