import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import {
  ServerContext,
  asMcpError,
  McpError,
  encodePathSegment,
} from './utils/toolHelpers.js';

export const method = 'getAsyncSpecTaskStatus';
export const title = 'Get status of an async spec task';
export const description =
  'Gets the status of an asynchronous spec or collection task: generating a collection\nfrom a spec, generating a spec from a collection, or syncing a collection with its spec.\nPoll with the \\`url\\` the starting call returned, which has the form\n\\`/{elementType}/{elementId}/tasks/{taskId}\\`, and copy those three segments into the\nmatching arguments. generateCollection returns \\`/specs/{specId}/tasks/{taskId}\\`, so use\n\\`specs\\` and the spec ID; syncCollectionWithSpec returns\n\\`/collections/{collectionUid}/tasks/{taskId}\\`, so use \\`collections\\` and the collection\nUID. A made-up task ID, or an \\`elementType\\` and \\`elementId\\` that do not match the task,\nreturns a 403 "not permitted" error that does not mean a real permissions problem.\n';
export const parameters = z.object({
  elementType: z
    .enum(['collections', 'specs'])
    .describe(
      "The kind of element the task belongs to, `specs` or `collections`, as given in the task's polling `url`."
    ),
  elementId: z
    .union([z.string(), z.string()])
    .describe(
      "The ID of that element, as given in the task's polling `url`. A spec ID for `specs`, a collection UID for `collections`."
    ),
  taskId: z.string().describe("The task's ID."),
});
export const annotations = {
  title: 'Get status of an async spec task',
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
    const endpoint = `/${encodePathSegment(args.elementType, 'elementType')}/${encodePathSegment(args.elementId, 'elementId')}/tasks/${encodePathSegment(args.taskId, 'taskId')}`;
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
