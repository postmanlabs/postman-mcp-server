import { z } from 'zod';
import { fetchPostmanAPI, ContentType } from '../clients/postman.js';
import { IsomorphicHeaders } from '@modelcontextprotocol/sdk/types.js';

export const method = 'create-spec-file';
export const description =
  'Creates an API specification file.\n\n**Note:**\n\n- If the file path contains a \\`/\\` (forward slash) character, then a folder is created. For example, if the path is the \\`components/schemas.json\\` value, then a \\`components\\` folder is created with the \\`schemas.json\\` file inside.\n- Creating a spec file assigns it the \\`DEFAULT\\` file type.\n- Multi-file specifications can only have one root file.\n- Files cannot exceed a maximum of 10 MB in size.\n';
export const parameters = z.object({
  specId: z.string().describe("The spec's ID."),
  path: z.string().describe("The file's path. Accepts JSON or YAML files."),
  content: z.string().describe("The file's stringified contents."),
});
export const annotations = {
  title:
    'Creates an API specification file.\n\n**Note:**\n\n- If the file path contains a \\`/\\` (forward slash) character, then a folder is created. For example, if the path is the \\`components/schemas.json\\` value, then a \\`components\\` folder is created with the \\`schemas.json\\` file inside.\n- Creating a spec file assigns it the \\`DEFAULT\\` file type.\n- Multi-file specifications can only have one root file.\n- Files cannot exceed a maximum of 10 MB in size.\n',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string; headers?: IsomorphicHeaders }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/specs/${params.specId}/files`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (params.path !== undefined) bodyPayload.path = params.path;
    if (params.content !== undefined) bodyPayload.content = params.content;
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
  } catch (e: any) {
    return {
      content: [{ type: 'text', text: `Failed: ${e.message}` }],
    };
  }
}
