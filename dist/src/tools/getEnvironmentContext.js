import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getEnvironmentContext';
export const description = 'Returns a markdown-formatted summary of an environment, including its name and enabled variables with their keys, values, and types.';
export const parameters = z.object({
    environmentId: z.string().describe("The environment's ID."),
});
export const annotations = {
    title: 'Get Environment Context',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/context/environments/${encodeURIComponent(String(args.environmentId))}`;
        const result = await extra.client.get(endpoint, {
            headers: extra.headers,
        });
        return {
            content: [{ type: 'text', text: result }],
        };
    }
    catch (e) {
        if (e instanceof McpError) {
            throw e;
        }
        throw asMcpError(e);
    }
}
