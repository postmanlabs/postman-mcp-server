import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'updateWorkspace';
export const description = "Updates a workspace's property, such as its name or visibility.\n\n**Note:**\n\n- This endpoint does not support the following visibility changes:\n  - \\`private\\` to \\`public\\`, \\`public\\` to \\`private\\`, and \\`private\\` to \\`personal\\` for **Free** and **Solo** [plans](https://www.postman.com/pricing/).\n  - \\`public\\` to \\`personal\\` for team users only.\n- There are rate limits when publishing public workspaces.\n- Public team workspace names must be unique.\n";
export const parameters = z.object({
    workspaceId: z.string().describe("The workspace's ID."),
    workspace: z
        .object({
        name: z.string().describe("The workspace's new name.").optional(),
        type: z
            .enum(['private', 'personal', 'team', 'public'])
            .describe('The new workspace visibility [type](https://learning.postman.com/docs/collaborating-in-postman/using-workspaces/managing-workspaces/#changing-workspace-visibility). This property does not support the following workspace visibility changes:\n- `private` to `public`, `public` to `private`, and `private` to `personal` for Free and Basic [plans](https://www.postman.com/pricing/).\n- `public` to `personal` for team users.\n')
            .optional(),
        description: z.string().describe('The new workspace description.').optional(),
        about: z.string().describe('A brief summary about the workspace.').optional(),
    })
        .optional(),
});
export const annotations = {
    title: "Updates a workspace's property, such as its name or visibility.",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/workspaces/${args.workspaceId}`;
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
        const result = await extra.client.put(url, options);
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
