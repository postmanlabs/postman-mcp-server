import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'getRequestContext';
export const description =
  'Returns a markdown-formatted summary of a request within a collection, including its method, URL, headers, query parameters, path variables, body, authentication, and response example references.';

export const parameters = z.object({
  collectionId: z.string().describe("The collection's ID."),
  requestId: z.string().describe("The request's ID."),
});

export const annotations = {
  title: 'Get Request Context',
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    const result = await extra.client.get(
      `/context/collections/${args.collectionId}/requests/${args.requestId}`,
      { headers: extra.headers }
    );

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
