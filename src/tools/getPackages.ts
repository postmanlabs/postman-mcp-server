import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'getPackages';
export const title = 'Get all packages';
export const description =
  "Lists active packages available to the authenticated user.\nReturns package metadata but does not include index script content. Use getPackage with a returned\npackage ID when you also need the current script. Use the response cursor to fetch\nthe next page when more packages are available.\nDo not use this tool to retrieve a package's script content; use getPackage instead.\n";
export const parameters = z.object({
  limit: z
    .number()
    .int()
    .gte(1)
    .lte(100)
    .describe('The maximum number of packages to return.')
    .default(100),
  cursor: z
    .string()
    .describe(
      'The pointer to the first record of the set of paginated results. To view the next response, use the `nextCursor` value for this parameter.'
    )
    .optional(),
});
export const annotations = {
  title: 'Get all packages',
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
    const endpoint = `/packages`;
    const query = new URLSearchParams();
    if (args.limit !== undefined) query.set('limit', String(args.limit));
    if (args.cursor !== undefined) query.set('cursor', String(args.cursor));
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
