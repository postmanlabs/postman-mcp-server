import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';

export const method = 'get-workspaces';
export const description =
  "Gets all [workspaces](https://learning.postman.com/docs/collaborating-in-postman/using-workspaces/creating-workspaces/). The response includes your workspaces and any workspaces that you have access to.\n\n**Note:**\n\nThis endpoint's response contains the visibility field. Visibility determines who can access the workspace:\n- \\`personal\\` — Only you can access the workspace.\n- \\`team\\` — All team members can access the workspace.\n- \\`private\\` — Only invited team members can access the workspace ([**Professional** and **Enterprise** plans only](https://www.postman.com/pricing)).\n- \\`public\\` — Everyone can access the workspace.\n- \\`partner\\` — Only invited team members and [partners](https://learning.postman.com/docs/collaborating-in-postman/using-workspaces/partner-workspaces/) can access the workspace ([**Professional** and **Enterprise** plans only](https://www.postman.com/pricing)).\n";
export const parameters = z.object({
  type: z
    .enum(['personal', 'team', 'private', 'public', 'partner'])
    .describe('The type of workspace to filter the response by.')
    .optional(),
  createdBy: z
    .number()
    .int()
    .describe(
      'Return only workspaces created by a specific user ID. For multiple users, pass this value as a comma-separated list of user IDs. The response only returns workspaces that you have access to.'
    )
    .optional(),
  include: z
    .enum(['mocks:deactivated', 'scim'])
    .describe(
      "Include the following information in the endpoint's response:\n- `mocks:deactivated` — Include all deactivated mock servers in the response.\n- `scim` — Return the SCIM user IDs of the workspace creator and who last modified it.\n"
    )
    .optional(),
});
export const annotations = {
  title:
    "Gets all [workspaces](https://learning.postman.com/docs/collaborating-in-postman/using-workspaces/creating-workspaces/). The response includes your workspaces and any workspaces that you have access to.\n\n**Note:**\n\nThis endpoint's response contains the visibility field. Visibility determines who can access the workspace:\n- \\`personal\\` — Only you can access the workspace.\n- \\`team\\` — All team members can access the workspace.\n- \\`private\\` — Only invited team members can access the workspace ([**Professional** and **Enterprise** plans only](https://www.postman.com/pricing)).\n- \\`public\\` — Everyone can access the workspace.\n- \\`partner\\` — Only invited team members and [partners](https://learning.postman.com/docs/collaborating-in-postman/using-workspaces/partner-workspaces/) can access the workspace ([**Professional** and **Enterprise** plans only](https://www.postman.com/pricing)).\n",
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/workspaces`;
    const query = new URLSearchParams();
    if (params.type !== undefined) query.set('type', String(params.type));
    if (params.createdBy !== undefined) query.set('createdBy', String(params.createdBy));
    if (params.include !== undefined) query.set('include', String(params.include));
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const result = await fetchPostmanAPI(url, {
      method: 'GET',
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
