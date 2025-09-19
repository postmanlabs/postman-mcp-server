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

export const method = 'deleteApiCollectionComment';
export const description =
  "Deletes a comment from an API's collection. On success, this returns an HTTP \\`204 No Content\\` response.\n\n**Note:**\n\nDeleting the first comment of a thread deletes all the comments in the thread.\n";
export const parameters = z.object({
  apiId: z.string().describe("The API's ID."),
  collectionId: z.string().describe("The collection's unique ID."),
  commentId: z.number().int().describe("The comment's ID."),
});
export const annotations = {
  title:
    "Deletes a comment from an API's collection. On success, this returns an HTTP \\`204 No Content\\` response.\n\n**Note:**\n\nDeleting the first comment of a thread deletes all the comments in the thread.\n",
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders }
): Promise<CallToolResult> {
  try {
    const endpoint = `/apis/${args.apiId}/collections/${args.collectionId}/comments/${args.commentId}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const options: any = {
      headers: extra.headers,
    };
    const result = await extra.client.delete(url, options);
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
