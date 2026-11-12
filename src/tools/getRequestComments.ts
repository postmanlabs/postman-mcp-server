import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import {
  ServerContext,
  asMcpError,
  McpError,
  encodePathSegment,
} from './utils/toolHelpers.js';

export const method = 'getRequestComments';
export const title = "Get a request's comments";
export const description =
  'Gets all comments left by users in a request. Returns an empty list when the request has no comments.\n';
export const parameters = z.object({
  collectionId: z.string().describe("The collection's unique ID."),
  requestId: z
    .string()
    .describe(
      "The request ID in `<ownerId>-<requestUuid>` form: the request's UUID prefixed with the owner ID, which is the part of `collectionId` before its first hyphen. It is not the team ID.\n\nFor example, for collection `24585957-7b2c98f7-30db-4b67-8685-0079f48a0947` (owner ID `24585957`) and a request whose UUID is `2c450b59-9bbf-729b-6ac0-f92535a7c336`, the `requestId` is `24585957-2c450b59-9bbf-729b-6ac0-f92535a7c336`.\n"
    ),
});
export const annotations = {
  title: "Get a request's comments",
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
    const endpoint = `/collections/${encodePathSegment(args.collectionId, 'collectionId')}/requests/${encodePathSegment(args.requestId, 'requestId')}/comments`;
    const query = new URLSearchParams();
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
