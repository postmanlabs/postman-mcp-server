import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getSecretTypes';
export const title = 'Get secret types';
export const description = "Lists the kinds of secret the Secret Scanner recognises, with the type IDs used to\nfilter detectedSecretsQueries. Call this first when you need to search for one specific\nkind of credential, since the \\`secretTypes\\` filter takes these IDs and not names.\nThis returns the scanner's vocabulary, not any detected secrets. Requires a Postman\nEnterprise plan.\n";
export const parameters = z.object({});
export const annotations = {
    title: 'Get secret types',
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/secret-types`;
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
