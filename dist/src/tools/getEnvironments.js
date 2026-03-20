import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
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
        const result = (await extra.client.get(url, options));
        if (result && typeof result === 'object' && Array.isArray(result.environments)) {
            result.environments.forEach((env) => {
                if (env.values && Array.isArray(env.values)) {
                    env.values = env.values.map((v) => {
                        if (v.type === 'secret') {
                            return {
                                ...v,
                                value: '***REDACTED BY MCP SERVER***',
                                ...(v.initial_value ? { initial_value: '***REDACTED BY MCP SERVER***' } : {}),
                            };
                        }
                        return v;
                    });
                }
            });
        }
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
