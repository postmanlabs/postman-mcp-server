import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'mergeEnvironmentFork';
export const title = 'Merge an environment fork';
export const description =
  "Merges a forked environment's changes up into its parent. The path holds the parent\nenvironment and \\`source\\` holds the fork's unique ID — this direction sends the fork's\nvalues to the parent, so anyone using the parent sees them. Set \\`deleteSource\\` to true\nto delete the fork after a successful merge; it defaults to false.\nTo move changes the other way, from parent down into a fork, use pullEnvironment\ninstead.\n";
export const parameters = z.object({
  environmentId: z.string().describe("The environment's unique ID."),
  source: z.string().describe("The source environment's unique ID to merge data from."),
  deleteSource: z
    .boolean()
    .describe('If true, the forked environment will be deleted.')
    .default(false),
});
export const annotations = {
  title: 'Merge an environment fork',
  readOnlyHint: false,
  openWorldHint: true,
  destructiveHint: true,
  idempotentHint: false,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    const endpoint = `/environments/${encodeURIComponent(String(args.environmentId))}/merges`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.source !== undefined) bodyPayload.source = args.source;
    if (args.deleteSource !== undefined) bodyPayload.deleteSource = args.deleteSource;
    const options: any = {
      body: JSON.stringify(bodyPayload),
      contentType: ContentType.Json,
      headers: extra.headers,
    };
    const result = await extra.client.post(url, options);
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
