import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getMonitorRunResults';
export const description = 'Gets results for a monitor run, including trimmed execution logs (beforeItem and assertion events only) and result counts. Use this to inspect per-request assertions and failure details for a specific run.\n\nThis is Step 3 of the monitor-run workflow: listMonitorExecutions → listRunsForExecution → getMonitorRunResults. The runId must come from listRunsForExecution — do NOT use an executionId here, it will return 404.';
export const parameters = z.object({
    monitorId: z
        .string()
        .describe("The monitor's ID. Must be a plain UUID (e.g. `1f00bf12-7ee5-4500-a1a7-3c721a03d42c`), not a uid with numeric prefix."),
    runId: z
        .string()
        .describe("The run's ID, obtained from listRunsForExecution. Do NOT pass an executionId here."),
});
export const annotations = {
    title: 'Get Monitor Run Results',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/monitors/${encodeURIComponent(String(args.monitorId))}/runs/${encodeURIComponent(String(args.runId))}/results`;
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
