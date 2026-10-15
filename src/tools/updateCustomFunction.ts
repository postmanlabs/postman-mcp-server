import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'updateCustomFunction';
export const title = 'Update a custom function';
export const description =
  "Updates a custom function's path, description, or content. Only the fields you send\nchange, but \\`content\\` replaces the entire source, so read it first with\ngetCustomFunction (\\`include=content\\`). Renaming the \\`path\\` may break any ruleset that\ncalls the function by its old name.\n";
export const parameters = z.object({
  customFunctionId: z.string().describe("The custom function's ID."),
  path: z
    .string()
    .regex(new RegExp('^functions/[a-zA-Z_$][a-zA-Z0-9_$]+\\.js$'))
    .max(512)
    .describe(
      "The custom function's path, in the form `functions/<name>.js`. Root-level paths and nested paths aren't supported."
    )
    .optional(),
  description: z.string().max(255).describe("The custom function's description.").optional(),
  content: z
    .string()
    .describe("The custom function's content, up to a maximum of 500 KB (UTF-8).")
    .optional(),
});
export const annotations = {
  title: 'Update a custom function',
  readOnlyHint: false,
  openWorldHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    if (
      [args['path'], args['description'], args['content']].filter((value) => value !== undefined)
        .length < 1
    ) {
      throw new McpError(ErrorCode.InvalidParams, 'Request body must include at least 1 property.');
    }
    const endpoint = `/custom-functions/${encodeURIComponent(String(args.customFunctionId))}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.path !== undefined) bodyPayload.path = args.path;
    if (args.description !== undefined) bodyPayload.description = args.description;
    if (args.content !== undefined) bodyPayload.content = args.content;
    const options: any = {
      body: JSON.stringify(bodyPayload),
      contentType: ContentType.JsonMergePatch,
      headers: extra.headers,
    };
    const result = await extra.client.patch(url, options);
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
