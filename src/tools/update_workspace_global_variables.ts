import { z } from 'zod';
import { fetchPostmanAPI, ContentType } from '../clients/postman.js';

export const method = 'update-workspace-global-variables';
export const description =
  "Updates and replaces a workspace's global [variables](https://learning.postman.com/docs/sending-requests/variables/#variable-scopes). This endpoint replaces all existing global variables with the variables you pass in the request body.";
export const parameters = z.object({
  workspaceId: z.string().describe("The workspace's ID."),
  values: z
    .array(
      z
        .object({
          key: z.string().describe("The variable's name.").optional(),
          type: z
            .enum(['default', 'secret'])
            .describe(
              'The [type](https://learning.postman.com/docs/sending-requests/variables/#variable-types) of variable.'
            )
            .optional(),
          value: z.string().describe("The variable's value.").optional(),
          enabled: z.boolean().describe('If true, the variable is enabled.').optional(),
        })
        .describe('Information about the global variable.')
    )
    .describe("A list of the workspace's global variables.")
    .optional(),
});
export const annotations = {
  title:
    "Updates and replaces a workspace's global [variables](https://learning.postman.com/docs/sending-requests/variables/#variable-scopes). This endpoint replaces all existing global variables with the variables you pass in the request body.",
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/workspaces/${params.workspaceId}/global-variables`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (params.values !== undefined) bodyPayload.values = params.values;
    const result = await fetchPostmanAPI(url, {
      method: 'PUT',
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
