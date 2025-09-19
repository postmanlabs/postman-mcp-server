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

export const method = 'getCollectionResponse';
export const description = 'Gets information about a response in a collection.';
export const parameters = z.object({
  responseId: z.string().describe("The response's ID."),
  collectionId: z.string().describe("The collection's ID."),
  ids: z
    .boolean()
    .describe('If true, returns only properties that contain ID values in the response.')
    .optional(),
  uid: z.boolean().describe('If true, returns all IDs in UID format (`userId`-`id`).').optional(),
  populate: z
    .boolean()
    .describe("If true, returns all of the collection item's contents.")
    .optional(),
});
export const annotations = {
  title: 'Gets information about a response in a collection.',
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders }
): Promise<CallToolResult> {
  try {
    const endpoint = `/collections/${args.collectionId}/responses/${args.responseId}`;
    const query = new URLSearchParams();
    if (args.ids !== undefined) query.set('ids', String(args.ids));
    if (args.uid !== undefined) query.set('uid', String(args.uid));
    if (args.populate !== undefined) query.set('populate', String(args.populate));
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
