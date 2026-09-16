import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'getComponent';
export const title = 'Get a component';
export const description =
  "Gets a single component's metadata by ID. Use \\`include\\` (\\`hasVersions\\`,\n\\`latestVersion\\`, \\`latestVersion.content\\`) or \\`expand\\` (\\`latestVersion\\`) when you also\nneed the most recently published version. Use getAllComponents first when you need to\ndiscover a component ID.\nDo not use this tool to read unpublished edits; use getComponentDraft instead.\nRequires a Postman Enterprise plan.\n";
export const parameters = z.object({
  componentId: z.string().describe("The component's ID."),
  include: z
    .string()
    .describe(
      'A comma-separated list of additional fields to include. Accepts the `hasVersions`, `latestVersion`, `latestVersion.content` values.'
    )
    .optional(),
  expand: z
    .string()
    .describe('A comma-separated list of fields to expand. Accepts the `latestVersion` value.')
    .optional(),
});
export const annotations = {
  title: 'Get a component',
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
    const endpoint = `/components/${encodeURIComponent(String(args.componentId))}`;
    const query = new URLSearchParams();
    if (args.include !== undefined) query.set('include', String(args.include));
    if (args.expand !== undefined) query.set('expand', String(args.expand));
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
