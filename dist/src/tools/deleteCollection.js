import { z } from 'zod';
import { ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'deleteCollection';
export const description = 'Deletes a collection.';
export const parameters = z.object({
    collectionId: z
        .string()
        .describe('The collection ID must be in the form <OWNER_ID>-<UUID> (e.g. 12345-33823532ab9e41c9b6fd12d0fd459b8b).'),
    confirmDeletion: z
        .boolean()
        .describe('CRITICAL SAFETY FLAG: You MUST explicitly ask the user for confirmation before executing this tool. Set to true only after the user agrees.'),
});
export const annotations = {
    title: 'Deletes a collection.',
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
};
export async function handler(args, extra) {
    if (args.confirmDeletion !== true) {
        throw new McpError(ErrorCode.InvalidParams, "Destructive Action Blocked: You must explicitly ask the user for permission and set 'confirmDeletion' to true to execute this deletion.");
    }
    try {
        const endpoint = `/collections/${args.collectionId}`;
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
