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

export const method = 'createCollectionFolder';
export const description =
  'Creates a folder in a collection. For a complete list of properties, refer to the **Folder** entry in the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).\n\nYou can use this endpoint to to import requests and responses into a newly-created folder. To do this, include the \\`requests\\` field and the list of request objects in the request body. For more information, see the provided example.\n\n**Note:**\n\nIt is recommended that you pass the \\`name\\` property in the request body. If you do not, the system uses a null value. As a result, this creates a folder with a blank name.\n';
export const parameters = z.object({
  collectionId: z.string().describe("The collection's ID."),
  name: z
    .string()
    .describe(
      "The folder's name. It is recommended that you pass the `name` property in the request body. If you do not, the system uses a null value. As a result, this creates a folder with a blank name."
    )
    .optional(),
  folder: z.string().describe('The ID of a folder in which to create the folder.').optional(),
});
export const annotations = {
  title:
    'Creates a folder in a collection. For a complete list of properties, refer to the **Folder** entry in the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).\n\nYou can use this endpoint to to import requests and responses into a newly-created folder. To do this, include the \\`requests\\` field and the list of request objects in the request body. For more information, see the provided example.\n\n**Note:**\n\nIt is recommended that you pass the \\`name\\` property in the request body. If you do not, the system uses a null value. As a result, this creates a folder with a blank name.\n',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders }
): Promise<CallToolResult> {
  try {
    const endpoint = `/collections/${args.collectionId}/folders`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.name !== undefined) bodyPayload.name = args.name;
    if (args.folder !== undefined) bodyPayload.folder = args.folder;
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
