import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'getAllRulesets';
export const title = 'Get all rulesets';
export const description =
  "Lists the team's governance rulesets, both team-owned (\\`type: custom\\`) and\nPostman-managed (\\`type: system\\`). Returns metadata only, without rule content; call\ngetRuleset with \\`include=content\\` to read a ruleset's rules. Page with \\`limit\\` (max\n100) and \\`cursor\\` from \\`meta.nextCursor\\`.\n";
export const parameters = z.object({
  cursor: z
    .string()
    .describe(
      'The pointer to the first record of the set of paginated results. To view the next response, use the `nextCursor` value for this parameter.'
    )
    .optional(),
  limit: z
    .number()
    .int()
    .gte(1)
    .lte(100)
    .describe('The maximum number of results to return per page.')
    .default(10),
});
export const annotations = {
  title: 'Get all rulesets',
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
    const endpoint = `/rulesets`;
    const query = new URLSearchParams();
    if (args.cursor !== undefined) query.set('cursor', String(args.cursor));
    if (args.limit !== undefined) query.set('limit', String(args.limit));
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
