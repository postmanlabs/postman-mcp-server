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

export const method = 'getCollectionForks';
export const description =
  "Gets a collection's forked collections. The response returns data for each fork, such as the fork's ID, the user who forked it, and the fork's creation date.";
export const parameters = z.object({
  collectionId: z.string().describe("The collection's ID."),
  cursor: z
    .string()
    .describe(
      'The pointer to the first record of the set of paginated results. To view the next response, use the `nextCursor` value for this parameter.'
    )
    .optional(),
  limit: z
    .number()
    .int()
    .describe('The maximum number of rows to return in the response.')
    .default(10),
  direction: z
    .enum(['asc', 'desc'])
    .describe(
      'Sort the results by creation date in ascending (`asc`) or descending (`desc`) order.'
    )
    .optional(),
});
export const annotations = {
  title:
    "Gets a collection's forked collections. The response returns data for each fork, such as the fork's ID, the user who forked it, and the fork's creation date.",
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders }
): Promise<CallToolResult> {
  try {
    const endpoint = `/collections/${args.collectionId}/forks`;
    const query = new URLSearchParams();
    if (args.cursor !== undefined) query.set('cursor', String(args.cursor));
    if (args.limit !== undefined) query.set('limit', String(args.limit));
    if (args.direction !== undefined) query.set('direction', String(args.direction));
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
