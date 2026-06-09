import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'getApiDiscoveryInstructions';
export const description = `Returns instructions (markdown) for finding APIs in Postman — searching the public network, browsing private/internal/team collections, filtering by ownership and visibility, and comparing candidate APIs. Includes the rules for presenting results with Postman links and the patterns for evaluating tradeoffs between APIs.

Call this when the user wants to find, search for, or compare APIs (e.g., "find me an email API", "search for the Payvance API", "compare Payvance and Cashloom"). Prerequisite: call getPostmanContextOverview first if you have not already loaded the Postman Context overview in this session.`;

export const parameters = z.object({});

export const annotations = {
  title: 'Get API Discovery Instructions',
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  _args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    const result = await extra.client.get('/context/instructions/discovery', {
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
