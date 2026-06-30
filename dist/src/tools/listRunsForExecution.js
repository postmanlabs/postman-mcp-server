import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'listRunsForExecution';
export const description = 'Lists runs for a monitor execution. Each execution may produce multiple runs across regions. Returns run metadata including region, state, result counts, and timestamps. Not paginated.';
export const parameters = z.object({
    monitorId: z.string().describe("The monitor's ID."),
    executionId: z.string().describe("The execution's ID."),
});
export const annotations = {
    title: 'List Runs For Monitor Execution',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/monitors/${encodeURIComponent(String(args.monitorId))}/executions/${encodeURIComponent(String(args.executionId))}/runs`;
        const result = await extra.client.get(endpoint, { headers: extra.headers });
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
