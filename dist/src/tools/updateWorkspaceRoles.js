import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'updateWorkspaceRoles';
export const title = 'Update workspace roles';
export const description = 'Changes who can access a workspace, for users, user groups, or partners. Read the\ncurrent state with getWorkspaceRoles first and get assignable role names from\ngetAllWorkspaceRoles.\nSeveral constraints will reject an otherwise reasonable call: at most 50 operations per\nrequest, exactly one action per user, group, or partner in a body, and partner roles and\nuser roles cannot be changed in the same call. Personal workspaces do not support role\nassignment, the external Guest role is not supported, and user groups require an\nEnterprise plan. Pass the \\`identifierType=scim\\` header to use SCIM IDs.\nThis grants or removes access to everything in the workspace, so only call it on an\nexplicit instruction naming the people and roles involved.\n';
export const parameters = z.object({
    workspaceId: z.string().describe("The workspace's ID."),
    identifierType: z.string().describe('Use SCIM user IDs instead of Postman user IDs.').optional(),
    roles: z
        .array(z.object({
        op: z.string().describe('The operation to perform on the path.'),
        path: z
            .enum(['/user', '/usergroup', '/partner'])
            .describe('The resource to perform the action on.'),
        value: z
            .array(z
            .object({
            id: z
                .string()
                .describe("The user, user group, or partner's ID. To use SCIM IDs for users or user groups, include the `identifierType=scim` header in the request."),
            role: z
                .string()
                .describe("The user or user group's role ID:\n- `1` — Viewer.  Can view and collaborate on all resources.\n- `2` — Editor. Can create and edit all resources.\n- `3` — Admin. Can manage people and all resources.\n\nFor partner roles:\n- `4` — Viewer. Can send requests and view workspace resources.\n- `5` — Editor. Can create, edit and fork workspace resources.\n- `6` — Viewer and Partner Lead. Can view, fork and export workspace resources, and invite partners.\n- `7` — Editor and Partner Lead. Can create and edit workspace resources, and invite partners with Editor or Viewer access to the workspace.\n"),
        })
            .describe('Information about the user, user group, or partner role.'))
            .describe('Information about the updated workspace role.'),
    }))
        .describe('A list of role update operations to apply to the workspace.')
        .optional(),
});
export const annotations = {
    title: 'Update workspace roles',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/workspaces/${encodeURIComponent(String(args.workspaceId))}/roles`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.roles !== undefined)
            bodyPayload.roles = args.roles;
        const options = {
            body: JSON.stringify(bodyPayload),
            contentType: ContentType.JsonPatch,
            headers: extra.headers,
        };
        const result = await extra.client.patch(url, options);
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
