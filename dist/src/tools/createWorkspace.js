import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'createWorkspace';
export const description = 'Creates a new [workspace](https://learning.postman.com/docs/collaborating-in-postman/using-workspaces/creating-workspaces/).\n\n**Note:**\n\n- This endpoint returns a 403 \\`Forbidden\\` response if the user does not have permission to create workspaces. [Admins and Super Admins](https://learning.postman.com/docs/collaborating-in-postman/roles-and-permissions/#team-roles) can configure workspace permissions to restrict users and/or user groups from creating workspaces or require approvals for the creation of team workspaces.\n- There are rate limits when publishing public workspaces.\n- Public team workspace names must be unique.\n- The \\`teamId\\` property must be passed in the request body if [Postman Organizations](https://learning.postman.com/docs/administration/onboarding-checklist) is enabled.\n';
export const parameters = z.object({
    workspace: z
        .object({
        name: z.string().describe("The workspace's name."),
        type: z
            .enum(['personal', 'private', 'public', 'team', 'partner'])
            .describe('The type of workspace:\n- `personal`\n- `private` — Private workspaces are available on Postman [**Professional** and **Enterprise** plans](https://www.postman.com/pricing).\n- `public`\n- `team`\n- `partner` — [Partner Workspaces](https://learning.postman.com/docs/collaborating-in-postman/using-workspaces/partner-workspaces/) are available on Postman [**Professional** and **Enterprise** plans](https://www.postman.com/pricing)).\n'),
        description: z.string().describe("The workspace's description.").optional(),
        about: z.string().describe('A brief summary about the workspace.').optional(),
        teamId: z
            .string()
            .describe('The team ID to assign to the workspace. This property is required if Postman [Organizations](https://learning.postman.com/docs/administration/managing-your-team/overview) is enabled.')
            .optional(),
    })
        .describe('Information about the workspace.')
        .optional(),
});
export const annotations = {
    title: 'Creates a new [workspace](https://learning.postman.com/docs/collaborating-in-postman/using-workspaces/creating-workspaces/).',
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/workspaces`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.workspace !== undefined)
            bodyPayload.workspace = args.workspace;
        const options = {
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
    }
    catch (e) {
        if (e instanceof McpError) {
            throw e;
        }
        throw asMcpError(e);
    }
}
