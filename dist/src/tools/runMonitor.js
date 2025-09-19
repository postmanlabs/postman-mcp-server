import { z } from 'zod';
import { McpError, ErrorCode, } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'runMonitor';
export const description = "Runs a monitor and returns its run results.\n\n**Note:**\n\n- If you pass the \\`async=true\\` query parameter, the response does not return the \\`stats\\`, \\`executions\\`, and \\`failures\\` responses. To get this information for an asynchronous run, call the GET \\`/monitors/{id}\\` endpoint.\n- If the call exceeds 300 seconds, the endpoint returns an HTTP \\`202 Accepted\\` response. Use the GET \\`/monitors/{id}\\` endpoint to check the run's status in the response's \\`lastRun\\` property. To avoid this, it is recommended that you include the \\`async=true\\` query parameter when using this endpoint.\n";
export const parameters = z.object({
    monitorId: z.string().describe("The monitor's ID."),
    async: z
        .boolean()
        .describe('If true, runs the monitor asynchronously from the created monitor run task. By default, the server will not respond until the task finishes (`false`).')
        .default(false),
});
export const annotations = {
    title: "Runs a monitor and returns its run results.\n\n**Note:**\n\n- If you pass the \\`async=true\\` query parameter, the response does not return the \\`stats\\`, \\`executions\\`, and \\`failures\\` responses. To get this information for an asynchronous run, call the GET \\`/monitors/{id}\\` endpoint.\n- If the call exceeds 300 seconds, the endpoint returns an HTTP \\`202 Accepted\\` response. Use the GET \\`/monitors/{id}\\` endpoint to check the run's status in the response's \\`lastRun\\` property. To avoid this, it is recommended that you include the \\`async=true\\` query parameter when using this endpoint.\n",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/monitors/${args.monitorId}/run`;
        const query = new URLSearchParams();
        if (args.async !== undefined)
            query.set('async', String(args.async));
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const options = {
            headers: extra.headers,
        };
        const result = await extra.client.post(url, options);
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
