import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'getCustomFunction';
export const title = 'Get a custom function';
export const description =
  "Gets a custom function's metadata by ID. Pass \\`include=content\\` to also return its\nJavaScript source, which is required before editing it with updateCustomFunction.\n";
export const parameters = z.object({
  customFunctionId: z.string().describe("The custom function's ID."),
  include: z
    .literal('content')
    .describe(
      "The related fields to include in the response. Currently only `content` is supported. Omit this parameter to receive only the resource's metadata."
    )
    .optional(),
});
export const annotations = {
  title: 'Get a custom function',
  readOnlyHint: true,
  openWorldHint: false,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    const endpoint = `/custom-functions/${encodeURIComponent(String(args.customFunctionId))}`;
    const query = new URLSearchParams();
    if (args.include !== undefined) query.set('include', String(args.include));
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const options: any = {
      headers: extra.headers,
    };
    const result = await extra.client.get(url, options);
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
