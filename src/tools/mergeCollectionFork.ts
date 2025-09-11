import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
import { IsomorphicHeaders, McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

function asMcpError(error: unknown): McpError {
  const cause = (error as any)?.cause ?? String(error);
  return new McpError(ErrorCode.InternalError, cause);
}

export const method = 'mergeCollectionFork';
export const description =
  '**This endpoint is deprecated.**\n\nMerges a forked collection back into its parent collection. You must have the [Editor role](https://learning.postman.com/docs/collaborating-in-postman/roles-and-permissions/#collection-roles) for the collection to merge a fork.\n';
export const parameters = z.object({
  destination: z.string().describe("The destination (parent) collection's unique ID."),
  source: z.string().describe("The source collection's unique ID."),
  strategy: z
    .enum(['deleteSource', 'updateSourceWithDestination'])
    .describe(
      "The fork's merge strategy:\n- `deleteSource` — Merge the changes into the parent collection. After the merge process is complete, Postman deletes the fork. You must have Editor access to both the parent and forked collections.\n- `updateSourceWithDestination` — Merge the changes into the parent collection. Any differences in the parent collection are also made to the fork.\n"
    )
    .default('updateSourceWithDestination'),
});
export const annotations = {
  title:
    '**This endpoint is deprecated.**\n\nMerges a forked collection back into its parent collection. You must have the [Editor role](https://learning.postman.com/docs/collaborating-in-postman/roles-and-permissions/#collection-roles) for the collection to merge a fork.\n',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/collections/merge`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (params.destination !== undefined) bodyPayload.destination = params.destination;
    if (params.source !== undefined) bodyPayload.source = params.source;
    if (params.strategy !== undefined) bodyPayload.strategy = params.strategy;
    const options: any = {
      body: JSON.stringify(bodyPayload),
      contentType: ContentType.Json,
      headers: extra.headers,
    };
    const result = await extra.client.post(url, options);
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
