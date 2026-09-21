import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'getAuditLogs';
export const title = 'Get team audit logs';
export const description =
  "Gets the team's audit events — who did what and when across the Postman team. Use this\nto answer questions about account changes, membership changes, and administrative\nactivity. Narrow with \\`userId\\`, \\`action\\`, and a \\`since\\`/\\`until\\` window in \\`YYYY-MM-DD\\`\nformat; page with \\`limit\\` and \\`cursor\\`, and order with \\`orderBy\\` (\\`asc\\` or \\`desc\\`).\nGet valid \\`action\\` values from getAuditLogEventActions rather than guessing them — an\ninvalid action silently returns nothing useful. Prefer \\`orderBy\\` over the deprecated\n\\`order_by\\` parameter. Requires a Postman Enterprise plan.\n";
export const parameters = z.object({
  userId: z.number().int().describe('Return only results that match the given user ID.').optional(),
  action: z.string().describe('Filter results by an audit log action.').optional(),
  since: z
    .string()
    .date()
    .describe('Return logs created after the given time, in `YYYY-MM-DD` format.')
    .optional(),
  until: z
    .string()
    .date()
    .describe('Return logs created before the given time, in `YYYY-MM-DD` format.')
    .optional(),
  limit: z
    .number()
    .int()
    .lte(300)
    .describe('The maximum number of audit events to return at once.')
    .optional(),
  cursor: z
    .string()
    .describe(
      'The pointer to the first record of the set of paginated results. To view the next response, use the `nextCursor` value for this parameter.'
    )
    .optional(),
  orderBy: z
    .enum(['asc', 'desc'])
    .describe('Return the records in ascending (`asc`) or descending (`desc`) order.')
    .default('desc'),
  order_by: z
    .enum(['asc', 'desc'])
    .describe('Return the records in ascending (`asc`) or descending (`desc`) order.')
    .default('desc'),
});
export const annotations = {
  title: 'Get team audit logs',
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
    const endpoint = `/audit/logs`;
    const query = new URLSearchParams();
    if (args.userId !== undefined) query.set('userId', String(args.userId));
    if (args.action !== undefined) query.set('action', String(args.action));
    if (args.since !== undefined) query.set('since', String(args.since));
    if (args.until !== undefined) query.set('until', String(args.until));
    if (args.limit !== undefined) query.set('limit', String(args.limit));
    if (args.cursor !== undefined) query.set('cursor', String(args.cursor));
    if (args.orderBy !== undefined) query.set('orderBy', String(args.orderBy));
    if (args.order_by !== undefined) query.set('order_by', String(args.order_by));
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
