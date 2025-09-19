import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
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

export const method = 'transferCollectionRequests';
export const description = 'Copies or moves requests into a collection or folder.';
export const parameters = z.object({
  ids: z
    .array(z.string())
    .describe('A list of collection request, response, or folder UIDs to transfer.'),
  mode: z.enum(['copy', 'move']).describe('The transfer operation to perform.'),
  target: z
    .object({
      id: z.string().describe('The UID of the destination collection, folder, or request.'),
      model: z
        .enum(['collection', 'folder', 'request'])
        .describe(
          'The collection, folder, or request that the items will be transferred to. For response transfers, use the `request` value.'
        ),
    })
    .describe("Information about the item transfer's destination location."),
  location: z
    .object({
      id: z
        .string()
        .nullable()
        .describe("For `before` or `after` positions, the model's UID.")
        .optional(),
      model: z
        .string()
        .nullable()
        .describe(
          'For `before` or `after` positions, the type of item (model) that the transferred item will be positioned by. One of: `folder`, `request`, or `response.`\n'
        )
        .optional(),
      position: z
        .enum(['start', 'end', 'before', 'after'])
        .describe("The transferred item's position within the destination object.")
        .default('end'),
    })
    .describe(
      "The transferred items' placement in the target destination:\n- For `start` or `end` — Do not include the `model` and `id` values.\n- For `before` or `after` — Include the `model` and `id` properties.\n"
    ),
});
export const annotations = {
  title: 'Copies or moves requests into a collection or folder.',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders }
): Promise<CallToolResult> {
  try {
    const endpoint = `/collection-requests-transfers`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.ids !== undefined) bodyPayload.ids = args.ids;
    if (args.mode !== undefined) bodyPayload.mode = args.mode;
    if (args.target !== undefined) bodyPayload.target = args.target;
    if (args.location !== undefined) bodyPayload.location = args.location;
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
