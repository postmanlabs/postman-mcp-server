import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getAuditLogEventActions';
export const title = 'Get all audit log event actions';
export const description = 'Lists every audit log event action Postman can record. This is the vocabulary the\n\\`action\\` filter on getAuditLogs expects, so call it first when you need to narrow an\naudit query to one kind of event.\nThis returns the set of possible actions, not any events that happened. Requires a\nPostman Enterprise plan.\n';
export const parameters = z.object({});
export const annotations = {
    title: 'Get all audit log event actions',
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/audit-actions`;
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
