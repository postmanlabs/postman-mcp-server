import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'managePartnerWorkspaceInvites';
export const title = 'Manage Partner Workspace invites';
export const description = 'Manages Partner Workspace access: invites partners by email address, removes them from\none workspace, or removes them from the partnership and every workspace in it. Existing\npartners are added directly; new email addresses are sent an invitation.\nTwo of these three actions are broad and irreversible in effect — removing someone from\na partnership revokes their access to every shared workspace at once, not just the one\nyou were looking at. Confirm the scope before calling, and only act on an explicit\ninstruction naming the addresses and the action. Inviting sends real email to external\npeople, so never invite speculatively or to an address you inferred. Requires a Team or\nEnterprise plan, and the Partner Manager, Workspace Editor, or Admin role depending on\nthe action.\n';
export const parameters = z.object({});
export const annotations = {
    title: 'Manage Partner Workspace invites',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: false,
    idempotentHint: false,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/invitations`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const options = {
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
