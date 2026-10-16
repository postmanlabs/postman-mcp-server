import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'asyncMergePullCollectionTaskStatus';
export const title = 'Get status of a collection merge or pull task';
export const description = 'Gets the status of an asynchronous collection merge or pull started by\nasyncMergePullCollectionFork, using the task \\`id\\` that call returned. Poll this until\nthe task reports a terminal state — do not assume the merge landed just because the\noriginal request returned 200. Task status is kept for only 24 hours after the task\nfinishes; after that this returns 404, which means the record expired and not that the\nmerge failed.\n';
export const parameters = z.object({ taskId: z.string().describe("The task's ID.") });
export const annotations = {
    title: 'Get status of a collection merge or pull task',
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/collection-merges-tasks/${encodeURIComponent(String(args.taskId))}`;
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
