import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'updatePackage';
export const title = 'Update a package';
export const description =
  "Updates an active package's description, index script content, or both.\nInclude at least one field and only the fields you want to change; omitted fields\nremain unchanged. Do not use this tool to create or delete a package.\n";
export const parameters = z.object({
  packageId: z.string().describe("The package's ID."),
  description: z
    .string()
    .regex(new RegExp('^[ -~]*$'))
    .max(500)
    .describe(
      "The package's description. This value may be empty and only supports printable ASCII characters."
    )
    .optional(),
  script: z
    .string()
    .max(512000)
    .describe("The package's index script content. This value may be empty.")
    .optional(),
});
export const annotations = {
  title: 'Update a package',
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
    if ([args['description'], args['script']].filter((value) => value !== undefined).length < 1) {
      throw new McpError(ErrorCode.InvalidParams, 'Request body must include at least 1 property.');
    }
    const endpoint = `/packages/${encodeURIComponent(String(args.packageId))}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.description !== undefined) bodyPayload.description = args.description;
    if (args.script !== undefined) bodyPayload.script = args.script;
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
