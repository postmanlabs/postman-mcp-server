import { z } from 'zod';
import { fetchPostmanAPI, ContentType } from '../clients/postman.js';

export const method = 'update-workspace';
export const description =
  'Updates a workspace.\n\n**Note:**\n\n- There are rate limits when publishing public workspaces.\n- Public team workspace names must be unique.\n\n### Important\n\nWe deprecated linking collections or environments between workspaces. We do not recommend that you do this.\n\nIf you have a linked collection or environment, note the following:\n- The endpoint does not create a clone of a collection or environment.\n- Any changes you make to a linked collection or environment changes them in all workspaces.\n- If you delete a collection or environment linked between workspaces, the system deletes it in all the workspaces.\n';
export const parameters = z.object({
  workspaceId: z.string().describe("The workspace's ID."),
  workspace: z
    .object({
      name: z.string().describe("The workspace's new name.").optional(),
      type: z
        .enum(['private', 'personal', 'team', 'public'])
        .describe(
          'The new workspace visibility [type](https://learning.postman.com/docs/collaborating-in-postman/using-workspaces/managing-workspaces/#changing-workspace-visibility). This property does not support the following workspace visibility changes:\n- `private` to `public`, `public` to `private`, and `private` to `personal` for Free and Basic [plans](https://www.postman.com/pricing/).\n- `public` to `personal` for team users.\n'
        )
        .optional(),
      description: z.string().describe('The new workspace description.').optional(),
    })
    .optional(),
});
export const annotations = {
  title:
    'Updates a workspace.\n\n**Note:**\n\n- There are rate limits when publishing public workspaces.\n- Public team workspace names must be unique.\n\n### Important\n\nWe deprecated linking collections or environments between workspaces. We do not recommend that you do this.\n\nIf you have a linked collection or environment, note the following:\n- The endpoint does not create a clone of a collection or environment.\n- Any changes you make to a linked collection or environment changes them in all workspaces.\n- If you delete a collection or environment linked between workspaces, the system deletes it in all the workspaces.\n',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/workspaces/${params.workspaceId}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (params.workspace !== undefined) bodyPayload.workspace = params.workspace;
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
