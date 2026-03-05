import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
import { runCollection } from './runner/index.js';
export const method = 'runCollection';
export const description = 'Runs a Postman collection by ID with detailed test results and execution statistics. Supports optional environment for variable substitution. Note: Advanced parameters like custom delays and other runtime options are not yet available.';
export const parameters = z.object({
    collectionId: z
        .string()
        .describe('The collection ID in the format <OWNER_ID>-<UUID> (e.g. 12345-33823532ab9e41c9b6fd12d0fd459b8b).'),
    environmentId: z
        .string()
        .optional()
        .describe('Optional environment ID to use for variable substitution during the run.'),
    stopOnError: z.boolean().optional().describe('Gracefully halt on errors (default: false)'),
    stopOnFailure: z
        .boolean()
        .optional()
        .describe('Gracefully halt on test failures (default: false)'),
    abortOnError: z.boolean().optional().describe('Abruptly halt on errors (default: false)'),
    abortOnFailure: z
        .boolean()
        .optional()
        .describe('Abruptly halt on test failures (default: false)'),
    iterationCount: z.number().optional().describe('Number of iterations to run (default: 1)'),
    requestTimeout: z
        .number()
        .optional()
        .describe('Request timeout in milliseconds (default: 60000)'),
    scriptTimeout: z.number().optional().describe('Script timeout in milliseconds (default: 5000)'),
});
export const annotations = {
    title: 'Run Postman Collection',
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(params, extra) {
    try {
        const output = await runCollection(params, extra.client);
        return {
            content: [
                {
                    type: 'text',
                    text: output,
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
