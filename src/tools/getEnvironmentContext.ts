import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'getEnvironmentContext';
export const description =
  'Returns a markdown-formatted summary of an environment, including its name and enabled variables with their keys, values, and types.';

export const parameters = z.object({
  environmentId: z.string().describe("The environment's ID."),
});

export const annotations = {
  title: 'Get Environment Context',
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    const result = await extra.client.get(`/context/environments/${args.environmentId}`, {
      headers: extra.headers,
    });

    return {
      content: [{ type: 'text', text: result as string }],
    };
  } catch (e: unknown) {
    if (e instanceof McpError) {
      throw e;
    }
    throw asMcpError(e);
  }
}
