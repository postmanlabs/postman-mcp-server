import { z } from 'zod';
import { fetchPostmanAPI, ContentType } from '../clients/postman.js';

export const method = 'create-environment';
export const description =
  'Creates an environment.\n\n**Note:**\n\n- The request body size cannot exceed the maximum allowed size of 30MB.\n- If you receive an HTTP \\`411 Length Required\\` error response, manually pass the \\`Content-Length\\` header and its value in the request header.\n- If you do not include the \\`workspace\\` query parameter, the system creates the collection in your "My Workspace" workspace.\n';
export const parameters = z.object({
  workspace: z.string().describe("The workspace's ID.").optional(),
  environment: z
    .object({
      name: z.string().describe("The environment's name."),
      values: z
        .array(
          z.object({
            enabled: z.boolean().describe('If true, the variable is enabled.').optional(),
            key: z.string().describe("The variable's name.").optional(),
            value: z.string().describe("The variable's value.").optional(),
            type: z.enum(['secret', 'default', 'any']).describe('The variable type.').optional(),
          })
        )
        .describe("Information about the environment's variables.")
        .optional(),
    })
    .optional(),
});
export const annotations = {
  title:
    'Creates an environment.\n\n**Note:**\n\n- The request body size cannot exceed the maximum allowed size of 30MB.\n- If you receive an HTTP \\`411 Length Required\\` error response, manually pass the \\`Content-Length\\` header and its value in the request header.\n- If you do not include the \\`workspace\\` query parameter, the system creates the collection in your "My Workspace" workspace.\n',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/environments`;
    const query = new URLSearchParams();
    if (params.workspace !== undefined) query.set('workspace', String(params.workspace));
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (params.environment !== undefined) bodyPayload.environment = params.environment;
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
