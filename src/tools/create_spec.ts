import { z } from 'zod';
import { fetchPostmanAPI, ContentType } from '../clients/postman.js';

export const method = 'create-spec';
export const description =
  "Creates an API specification in Postman's [Spec Hub](https://learning.postman.com/docs/design-apis/specifications/overview/).\n\n**Note:**\n- Postman supports OpenAPI 3.0 and AsyncAPI 2.0 specifications.\n- This endpoint does not yet support multiple files.\n";
export const parameters = z.object({
  workspaceId: z.string().describe("The workspace's ID."),
  name: z.string().describe("The specification's name."),
  type: z.enum(['OPENAPI:3.0', 'ASYNCAPI:2.0']).describe("The specification's type."),
  files: z
    .array(
      z.object({
        path: z
          .string()
          .describe("The file's path. Accepts the `index.json` or `index.yaml` value."),
        content: z.string().describe("The file's stringified contents."),
      })
    )
    .describe("A list of the specification's files and their contents."),
});
export const annotations = {
  title:
    "Creates an API specification in Postman's [Spec Hub](https://learning.postman.com/docs/design-apis/specifications/overview/).\n\n**Note:**\n- Postman supports OpenAPI 3.0 and AsyncAPI 2.0 specifications.\n- This endpoint does not yet support multiple files.\n",
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
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
    });
    return {
      content: [
        {
          type: 'text',
          text: `${typeof result === 'string' ? result : JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  } catch (e: any) {
    return {
      content: [{ type: 'text', text: `Failed: ${e.message}` }],
    };
  }
}
