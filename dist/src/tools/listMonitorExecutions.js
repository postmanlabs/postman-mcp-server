import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'listMonitorExecutions';
export const description = 'Lists executions for a monitor. Cursor-based pagination, 25 results per page. Returns execution metadata including state, trigger, results summary, and timestamps.';
export const parameters = z.object({
    monitorId: z.string().describe("The monitor's ID."),
    cursor: z
        .string()
        .optional()
        .describe('Cursor for pagination. Pass the `nextCursor` value from a previous response to fetch the next page.'),
});
export const annotations = {
    title: 'List Monitor Executions',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/monitors/${encodeURIComponent(String(args.monitorId))}/executions`;
        const query = new URLSearchParams();
        if (args.cursor)
            query.set('cursor', args.cursor);
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const result = await extra.client.get(url, { headers: extra.headers });
        return {
            content: [
                {
                    type: 'text',
                    text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
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
