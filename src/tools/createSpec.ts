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

export const method = 'createSpec';
export const description =
  "Creates an API specification in Postman's [Spec Hub](https://learning.postman.com/docs/design-apis/specifications/overview/). Specifications can be single or multi-file.\n\n**Note:**\n- Postman supports OpenAPI 3.0 and AsyncAPI 2.0 specifications.\n- If the file path contains a \\`/\\` (forward slash) character, then a folder is created. For example, if the path is the \\`components/schemas.json\\` value, then a \\`components\\` folder is created with the \\`schemas.json\\` file inside.\n- Multi-file specifications can only have one root file.\n- Files cannot exceed a maximum of 10 MB in size.\n";
export const parameters = z.object({
  workspaceId: z.string().describe("The workspace's ID."),
  name: z.string().describe("The specification's name."),
  type: z.enum(['OPENAPI:3.0', 'ASYNCAPI:2.0']).describe("The specification's type."),
  files: z
    .array(
      z.union([
        z.object({
          path: z.string().describe("The file's path. Accepts JSON or YAML files."),
          content: z.string().describe("The file's stringified contents."),
          type: z
            .enum(['DEFAULT', 'ROOT'])
            .describe(
              'The type of file. This property is required when creating multi-file specifications:\n- `ROOT` — The file containing the full OpenAPI structure. This serves as the entry point for the API spec and references other (`DEFAULT`) spec files. Multi-file specs can only have one root file.\n- `DEFAULT` — A file referenced by the `ROOT` file.\n'
            ),
        }),
        z.object({
          path: z.string().describe("The file's path. Accepts JSON or YAML files."),
          content: z.string().describe("The file's stringified contents."),
        }),
      ])
    )
    .describe("A list of the specification's files and their contents."),
});
export const annotations = {
  title:
    "Creates an API specification in Postman's [Spec Hub](https://learning.postman.com/docs/design-apis/specifications/overview/). Specifications can be single or multi-file.\n\n**Note:**\n- Postman supports OpenAPI 3.0 and AsyncAPI 2.0 specifications.\n- If the file path contains a \\`/\\` (forward slash) character, then a folder is created. For example, if the path is the \\`components/schemas.json\\` value, then a \\`components\\` folder is created with the \\`schemas.json\\` file inside.\n- Multi-file specifications can only have one root file.\n- Files cannot exceed a maximum of 10 MB in size.\n",
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders }
): Promise<CallToolResult> {
  try {
    const endpoint = `/specs`;
    const query = new URLSearchParams();
    if (args.workspaceId !== undefined) query.set('workspaceId', String(args.workspaceId));
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.name !== undefined) bodyPayload.name = args.name;
    if (args.type !== undefined) bodyPayload.type = args.type;
    if (args.files !== undefined) bodyPayload.files = args.files;
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
