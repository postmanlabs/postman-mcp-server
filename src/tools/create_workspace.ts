import { z } from 'zod';
import { fetchPostmanAPI, ContentType } from '../clients/postman.js';

export const method = 'create-workspace';
export const description =
  'Creates a new [workspace](https://learning.postman.com/docs/collaborating-in-postman/using-workspaces/creating-workspaces/).\n\n**Note:**\n\n- This endpoint returns a 403 \\`Forbidden\\` response if the user does not have permission to create workspaces. [Admins and Super Admins](https://learning.postman.com/docs/collaborating-in-postman/roles-and-permissions/#team-roles) can configure workspace permissions to restrict users and/or user groups from creating workspaces or require approvals for the creation of team workspaces.\n- There are rate limits when publishing public workspaces.\n- Public team workspace names must be unique.\n\n### Important\n\nWe deprecated linking collections or environments between workspaces. We do not recommend that you do this.\n\nIf you have a linked collection or environment, note the following:\n- The endpoint does not create a clone of a collection or environment.\n- Any changes you make to a linked collection or environment changes them in all workspaces.\n- If you delete a collection or environment linked between workspaces, the system deletes it in all the workspaces.\n';
export const parameters = z.object({
  workspace: z
    .object({
      name: z.string().describe("The workspace's name."),
      type: z
        .enum(['personal', 'private', 'public', 'team', 'partner'])
        .describe(
          'The type of workspace:\n- `personal`\n- `private` — Private workspaces are available on Postman [**Professional** and **Enterprise** plans](https://www.postman.com/pricing).\n- `public`\n- `team`\n- `partner` — [Partner Workspaces](https://learning.postman.com/docs/collaborating-in-postman/using-workspaces/partner-workspaces/) are available on Postman [**Professional** and **Enterprise** plans](https://www.postman.com/pricing)).\n'
        ),
      description: z.string().describe("The workspace's description.").optional(),
    })
    .describe('Information about the workspace.')
    .optional(),
});
export const annotations = {
  title:
    'Creates a new [workspace](https://learning.postman.com/docs/collaborating-in-postman/using-workspaces/creating-workspaces/).\n\n**Note:**\n\n- This endpoint returns a 403 \\`Forbidden\\` response if the user does not have permission to create workspaces. [Admins and Super Admins](https://learning.postman.com/docs/collaborating-in-postman/roles-and-permissions/#team-roles) can configure workspace permissions to restrict users and/or user groups from creating workspaces or require approvals for the creation of team workspaces.\n- There are rate limits when publishing public workspaces.\n- Public team workspace names must be unique.\n\n### Important\n\nWe deprecated linking collections or environments between workspaces. We do not recommend that you do this.\n\nIf you have a linked collection or environment, note the following:\n- The endpoint does not create a clone of a collection or environment.\n- Any changes you make to a linked collection or environment changes them in all workspaces.\n- If you delete a collection or environment linked between workspaces, the system deletes it in all the workspaces.\n',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/workspaces`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (params.workspace !== undefined) bodyPayload.workspace = params.workspace;
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
