import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'updateCollectionRoles';
export const title = "Update a collection's roles";
export const description = 'Changes who can view or edit a collection. Send a \\`roles\\` array where each entry has\n\\`op: update\\`, a \\`path\\` of \\`/user\\`, \\`/group\\`, or \\`/team\\`, and a \\`value\\` array of\n\\`{id, role}\\` pairs with \\`role\\` set to \\`VIEWER\\` or \\`EDITOR\\`. This overwrites the roles\nfor each ID you name, so read the current state with getCollectionRoles first and send\nthe full intended set — omitting someone you meant to keep will change their access.\nReturns 204 with no body on success. The caller must hold the Editor role on the\ncollection, and external Partner and Guest roles are not supported here.\n';
export const parameters = z.object({
    collectionId: z.string().describe("The collection's ID."),
    roles: z
        .array(z.object({
        op: z.literal('update').describe('The operation to perform on the path.'),
        path: z
            .enum(['/user', '/group', '/team'])
            .describe('The resource to perform the action on.'),
        value: z
            .array(z
            .object({
            id: z.number().describe("The user, group, or team's ID."),
            role: z
                .preprocess((v) => (typeof v === 'string' ? v.toUpperCase() : v), z.enum(['VIEWER', 'EDITOR']))
                .describe('The role type:\n- `VIEWER` — Can view, fork, and export collections.\n- `EDITOR` — Can edit collections directly.'),
        })
            .describe('Information about the updated role.'))
            .describe('A list of the roles to assign to the resource.'),
    }))
        .describe('A list of role update operations to apply to the collection.'),
});
export const annotations = {
    title: "Update a collection's roles",
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: true,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/collections/${encodeURIComponent(String(args.collectionId))}/roles`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.roles !== undefined)
            bodyPayload.roles = args.roles;
        const options = {
            body: JSON.stringify(bodyPayload),
            contentType: ContentType.Json,
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
