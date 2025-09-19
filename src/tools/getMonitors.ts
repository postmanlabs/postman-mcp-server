import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import {
  IsomorphicHeaders,
  McpError,
  ErrorCode,
  CallToolResult,
} from '@modelcontextprotocol/sdk/types.js';

function asMcpError(error: unknown): McpError {
  const cause = (error as any)?.cause ?? String(error);
  return new McpError(ErrorCode.InternalError, cause);
}

export const method = 'getMonitors';
export const description = 'Gets all monitors.';
export const parameters = z.object({
  workspace: z.string().describe('Return only results found in the given workspace ID.').optional(),
  active: z.boolean().describe('If true, return only active monitors.').default(false),
  owner: z
    .number()
    .int()
    .describe('Return only results that belong to the given user ID.')
    .optional(),
  collectionUid: z.string().describe("Filter the results by a collection's unique ID.").optional(),
  environmentUid: z
    .string()
    .describe("Filter the results by an environment's unique ID.")
    .optional(),
  cursor: z
    .string()
    .describe(
      'The pointer to the first record of the set of paginated results. To view the next response, use the `nextCursor` value for this parameter.'
    )
    .optional(),
  limit: z
    .number()
    .int()
    .describe(
      'The maximum number of rows to return in the response, up to a maximum value of 25. Any value greater than 25 returns a 400 Bad Request response.'
    )
    .default(25),
});
export const annotations = {
  title: 'Gets all monitors.',
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders }
): Promise<CallToolResult> {
  try {
    const endpoint = `/monitors`;
    const query = new URLSearchParams();
    if (args.workspace !== undefined) query.set('workspace', String(args.workspace));
    if (args.active !== undefined) query.set('active', String(args.active));
    if (args.owner !== undefined) query.set('owner', String(args.owner));
    if (args.collectionUid !== undefined) query.set('collectionUid', String(args.collectionUid));
    if (args.environmentUid !== undefined) query.set('environmentUid', String(args.environmentUid));
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
