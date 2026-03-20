import { z } from 'zod';
import { ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'deleteEnvironment';
export const description = 'Deletes an environment.';
export const parameters = z.object({
    environmentId: z.string().describe("The environment's ID."),
    confirmDeletion: z
        .boolean()
        .describe('CRITICAL SAFETY FLAG: You MUST explicitly ask the user for confirmation before executing this tool. Set to true only after the user agrees.'),
});
export const annotations = {
    title: 'Deletes an environment.',
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
};
export async function handler(args, extra) {
    if (args.confirmDeletion !== true) {
        throw new McpError(ErrorCode.InvalidParams, "Destructive Action Blocked: You must explicitly ask the user for permission and set 'confirmDeletion' to true to execute this deletion.");
    }
    try {
        const endpoint = `/environments/${args.environmentId}`;
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
