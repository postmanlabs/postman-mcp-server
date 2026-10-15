import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getGovernanceGroupAssignments';
export const title = "Get a governance group's ruleset assignments";
export const description = "Lists the rulesets assigned to a governance group. Each assignment's \\`rulesetId\\` can be\npassed to getRuleset. To go the other way, from a ruleset to its groups, use\ngetRulesetAssignments.\n";
export const parameters = z.object({ groupId: z.string().describe("The governance group's ID.") });
export const annotations = {
    title: "Get a governance group's ruleset assignments",
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/governance-groups/${encodeURIComponent(String(args.groupId))}/assignments`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const options = {
            headers: extra.headers,
        };
        const result = await extra.client.get(url, options);
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
