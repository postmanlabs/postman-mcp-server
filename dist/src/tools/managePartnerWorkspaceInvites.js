import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'managePartnerWorkspaceInvites';
export const title = 'Manage Partner Workspace invites';
export const description = 'Manages Partner Workspace access: invites partners by email address, removes them from\none workspace, or removes them from the partnership and every workspace in it. Existing\npartners are added directly; new email addresses are sent an invitation.\nTwo of these three actions are broad and irreversible in effect — removing someone from\na partnership revokes their access to every shared workspace at once, not just the one\nyou were looking at. Confirm the scope before calling, and only act on an explicit\ninstruction naming the addresses and the action. Inviting sends real email to external\npeople, so never invite speculatively or to an address you inferred. Requires a Team or\nEnterprise plan, and the Partner Manager, Workspace Editor, or Admin role depending on\nthe action.\n';
export const parameters = z.object({
    action: z
        .enum(['invite_partner', 'remove_partner'])
        .describe('The action to perform. `invite_partner` invites partners to a Partner Workspace and\nneeds `targetEntity` `workspace`, `roleId`, and `target.emails`. `remove_partner`\nremoves partners and needs `target.userIds`.\n'),
    targetEntity: z
        .enum(['workspace', 'team'])
        .describe('What `targetEntityId` identifies. `workspace` is a Partner Workspace, for both\nactions. `team` is a team ID and is valid only with `remove_partner`, where it removes\nthe partners from the whole partnership and every workspace in it.\n'),
    targetEntityId: z
        .string()
        .min(1)
        .max(60)
        .describe('The Partner Workspace ID when `targetEntity` is `workspace`, or the team ID when it is `team`.'),
    roleId: z
        .enum(['4', '5', '6', '7'])
        .describe('Required for `invite_partner`, and not used by `remove_partner`. The role ID to assign\nto invited partners:\n- `4` — Viewer\n- `5` — Editor\n- `6` — Viewer and Partner Lead\n- `7` — Editor and Partner Lead\n')
        .optional(),
    target: z
        .object({
        emails: z
            .array(z.string().email().min(1).max(254).describe("A partner's email address."))
            .min(1)
            .describe("The partners' unique email addresses. Required for `invite_partner`.")
            .optional(),
        userIds: z
            .array(z.string().min(1).max(25).describe("The partner's ID."))
            .min(1)
            .describe("Required for `remove_partner`. The unique partner user IDs to remove from the workspace\nwhen `targetEntity` is `workspace`, or the partner publishers' team IDs when it is\n`team`.\n")
            .optional(),
    })
        .describe('The people to act on. Send `emails` for `invite_partner` and `userIds` for `remove_partner`, not both.'),
});
export const annotations = {
    title: 'Manage Partner Workspace invites',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: true,
    idempotentHint: false,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/invitations`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.action !== undefined)
            bodyPayload.action = args.action;
        if (args.targetEntity !== undefined)
            bodyPayload.targetEntity = args.targetEntity;
        if (args.targetEntityId !== undefined)
            bodyPayload.targetEntityId = args.targetEntityId;
        if (args.roleId !== undefined)
            bodyPayload.roleId = args.roleId;
        if (args.target !== undefined)
            bodyPayload.target = args.target;
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
