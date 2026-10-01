import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'deleteCustomFunction';
export const title = 'Delete a custom function';
export const description = "Permanently deletes a custom function. A ruleset that still calls it may fail to\nrun that rule, so check the team's rulesets with getAllRulesets and getRuleset first.\n";
export const parameters = z.object({
    customFunctionId: z.string().describe("The custom function's ID."),
});
export const annotations = {
    title: 'Delete a custom function',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: true,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/custom-functions/${encodeURIComponent(String(args.customFunctionId))}`;
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
