import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'getAllComponents';
export const title = 'Get all components';
export const description =
  "Lists the components in the team's component library. Use this to discover component\nIDs before reading or editing a component. Narrow the results with \\`type\\`, \\`status\\`,\nand \\`hasVersions\\`, and request extra fields with \\`include\\` (\\`hasVersions\\`,\n\\`latestVersion\\`, \\`latestVersion.content\\`) or \\`expand\\` (\\`latestVersion\\`).\nDo not use this tool to read a component's draft content; use getComponentDraft instead.\nRequires a Postman Enterprise plan.\n";
export const parameters = z.object({
  type: z
    .preprocess(
      (v) => (typeof v === 'string' ? v.toUpperCase() : v),
      z.enum(['OAS2', 'OAS3', 'OAS3_1'])
    )
    .describe('Filter results by component type.')
    .optional(),
  status: z
    .enum(['active', 'archive'])
    .describe("Filter results by the component's status.")
    .optional(),
  hasVersions: z
    .union([z.literal(true), z.literal(false)])
    .describe('If true, return only components with published versions.')
    .optional(),
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
  title: 'Get all components',
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
    const endpoint = `/components`;
    const query = new URLSearchParams();
    if (args.type !== undefined) query.set('type', String(args.type));
    if (args.status !== undefined) query.set('status', String(args.status));
    if (args.hasVersions !== undefined) query.set('hasVersions', String(args.hasVersions));
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
