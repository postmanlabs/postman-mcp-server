import { z } from 'zod';
import { McpError, ErrorCode, } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'getEnvironments';
export const description = 'Gets information about all of your [environments](https://learning.postman.com/docs/sending-requests/managing-environments/).';
export const parameters = z.object({
    workspace: z.string().describe("The workspace's ID.").optional(),
});
export const annotations = {
    title: 'Gets information about all of your [environments](https://learning.postman.com/docs/sending-requests/managing-environments/).',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/environments`;
        const query = new URLSearchParams();
        if (args.workspace !== undefined)
            query.set('workspace', String(args.workspace));
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
