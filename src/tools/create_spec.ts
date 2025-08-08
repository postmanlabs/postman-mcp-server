import { z } from 'zod';
import { fetchPostmanAPI, ContentType } from '../clients/postman.js';
import { IsomorphicHeaders, McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

function asMcpError(error: unknown): McpError {
  const cause = (error as any)?.cause ?? String(error);
  return new McpError(ErrorCode.InternalError, cause);
}

export const method = 'create-spec';
export const description =
  "Creates an API specification in Postman's [Spec Hub](https://learning.postman.com/docs/design-apis/specifications/overview/). Specifications can be single or multi-file.\n\n**Note:**\n- Postman supports OpenAPI 3.0 and AsyncAPI 2.0 specifications.\n- If the file path contains a \\`/\\` (forward slash) character, then a folder is created. For example, if the path is the \\`components/schemas.json\\` value, then a \\`components\\` folder is created with the \\`schemas.json\\` file inside.\n- Multi-file specifications can only have one root file.\n- Files cannot exceed a maximum of 10 MB in size.\n";
export const parameters = z.object({
  workspaceId: z.string().describe("The workspace's ID."),
  name: z.string().describe("The specification's name."),
  type: z.enum(['OPENAPI:3.0', 'ASYNCAPI:2.0']).describe("The specification's type."),
  files: z
    .array(
      z.any().superRefine((x, ctx) => {
        const schemas = [
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
        ];
        const errors = schemas.reduce<z.ZodError[]>(
          (errors, schema) =>
            ((result) => (result.error ? [...errors, result.error] : errors))(schema.safeParse(x)),
          []
        );
        if (schemas.length - errors.length !== 1) {
          ctx.addIssue({
            path: ctx.path,
            code: 'invalid_union',
            unionErrors: errors,
            message: 'Invalid input: Should pass single schema',
          });
        }
      })
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
  params: z.infer<typeof parameters>,
  extra: { apiKey: string; headers?: IsomorphicHeaders }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/specs`;
    const query = new URLSearchParams();
    if (params.workspaceId !== undefined) query.set('workspaceId', String(params.workspaceId));
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (params.name !== undefined) bodyPayload.name = params.name;
    if (params.type !== undefined) bodyPayload.type = params.type;
    if (params.files !== undefined) bodyPayload.files = params.files;
    const result = await fetchPostmanAPI(url, {
      method: 'POST',
      body: JSON.stringify(bodyPayload),
      contentType: ContentType.Json,
      apiKey: extra.apiKey,
      headers: extra.headers,
    });
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
