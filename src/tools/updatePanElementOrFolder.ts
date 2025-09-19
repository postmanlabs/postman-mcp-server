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

export const method = 'updatePanElementOrFolder';
export const description =
  "Updates an element or folder in your team's [Private API Network](https://learning.postman.com/docs/collaborating-in-postman/adding-private-network/).\n\n**Note:**\n\nYou can only pass one element object type per call. For example, you cannot pass both \\`api\\` and \\`collection\\` in a single request.\n";
export const parameters = z.object({
  elementId: z
    .string()
    .describe(
      "The element's ID or UUID. For Postman Collections you must pass the collection's UID (`userId`-`collectionId`) value."
    ),
  elementType: z.enum(['api', 'folder', 'collection', 'workspace']).describe('The element type.'),
  body: z.union([
    z.object({
      api: z
        .object({
          parentFolderId: z.number().int().describe("The API's new parent folder ID.").optional(),
        })
        .optional(),
    }),
    z.object({
      collection: z
        .object({
          parentFolderId: z
            .number()
            .int()
            .describe("The collection's new parent folder ID.")
            .optional(),
          environments: z
            .object({
              $add: z
                .array(z.string().describe('The ID of environment to add to the collection.'))
                .optional(),
              $remove: z
                .array(z.string().describe('The ID of environment to remove from the collection.'))
                .optional(),
            })
            .describe("The collection's updated environments.")
            .optional(),
        })
        .optional(),
    }),
    z.object({
      workspace: z
        .object({
          parentFolderId: z
            .number()
            .int()
            .describe("The workspace's new parent folder ID.")
            .optional(),
        })
        .optional(),
    }),
    z.object({
      folder: z
        .object({
          name: z.string().describe("The folder's new name.").optional(),
          description: z.string().describe("The folder's updated description.").optional(),
          parentFolderId: z
            .number()
            .int()
            .describe("The folder's new parent folder ID.")
            .optional(),
        })
        .optional(),
    }),
  ]),
});
export const annotations = {
  title:
    "Updates an element or folder in your team's [Private API Network](https://learning.postman.com/docs/collaborating-in-postman/adding-private-network/).\n\n**Note:**\n\nYou can only pass one element object type per call. For example, you cannot pass both \\`api\\` and \\`collection\\` in a single request.\n",
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders }
): Promise<CallToolResult> {
  try {
    const endpoint = `/network/private/${args.elementType}/${args.elementId}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload = args.body;
    const options: any = {
      body: JSON.stringify(bodyPayload),
      contentType: ContentType.Json,
      headers: extra.headers,
    };
    const result = await extra.client.put(url, options);
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
