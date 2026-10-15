import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'deleteGovernanceGroup';
export const title = 'Delete a governance group';
export const description = "Deletes a custom governance group. This also removes all of its workspace assignments\nand every ruleset assignment targeting it, so those workspaces stop being governed by\nthe group's rulesets. The workspaces and rulesets themselves are not deleted.\nPostman-managed groups (\\`type: system\\`) can't be deleted and return 403.\n";
export const parameters = z.object({ groupId: z.string().describe("The governance group's ID.") });
export const annotations = {
    title: 'Delete a governance group',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: true,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/governance-groups/${encodeURIComponent(String(args.groupId))}`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const options = {
            headers: extra.headers,
        };
        const result = await extra.client.delete(url, options);
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
