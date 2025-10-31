import { z } from 'zod';
import { McpError, ErrorCode, } from '@modelcontextprotocol/sdk/types.js';
import newman from 'newman';
import { TestTracker, OutputBuilder, buildNewmanOptions } from './utils/runner.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
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
        const tracker = new TestTracker();
        const output = new OutputBuilder();
        output.add(`🚀 Fetching collection with ID: ${params.collectionId}`);
        const response = await extra.client.get(`/collections/${params.collectionId}`);
        const collectionJSON = response.collection || response;
        output.add(`✅ Successfully fetched collection: ${collectionJSON.info?.name || 'Unknown'}\n`);
        let environmentJSON;
        if (params.environmentId) {
            output.add(`🌍 Fetching environment with ID: ${params.environmentId}`);
            const envResponse = await extra.client.get(`/environments/${params.environmentId}`);
            environmentJSON = envResponse.environment || envResponse;
            output.add(`✅ Successfully fetched environment: ${environmentJSON.name || 'Unknown'}\n`);
        }
        const newmanOptions = buildNewmanOptions(params, collectionJSON, environmentJSON);
        const startTime = Date.now();
        await new Promise((resolve, reject) => {
            newman
                .run(newmanOptions)
                .on('start', () => {
                output.add('🎯 Starting collection run...\n');
            })
                .on('assertion', (_err, args) => {
                if (args.assertion) {
                    tracker.addAssertion({
                        passed: !args.error,
                        assertion: args.assertion,
                        name: args.assertion,
                        error: args.error,
                    });
                }
            })
                .on('item', (_err, args) => {
                if (args.item) {
                    const testResults = tracker.displayCurrentResults();
                    if (testResults) {
                        output.add(`\n📝 Request: ${args.item.name}`);
                        output.add(testResults);
                    }
                }
            })
                .on('done', (err, summary) => {
                const endTime = Date.now();
                const durationMs = endTime - startTime;
                const durationSec = (durationMs / 1000).toFixed(2);
                if (err) {
                    output.add('\n❌ Run error: ' + err.message);
                    output.add(`⏱️  Duration: ${durationSec}s`);
                    reject(err);
                    return;
                }
                output.add('\n=== ✅ Run completed! ===');
                output.add(`⏱️  Duration: ${durationSec}s`);
                const testStats = tracker.getTotalStats();
                if (testStats.total > 0) {
                    output.add('\n📊 Overall Test Statistics:');
                    output.add(`  Total tests: ${testStats.total}`);
                    output.add(`  Passed: ${testStats.passed} ✅`);
                    output.add(`  Failed: ${testStats.failed} ❌`);
                    output.add(`  Success rate: ${((testStats.passed / testStats.total) * 100).toFixed(1)}%`);
                }
                if (summary?.run?.stats) {
                    output.add('\n📈 Request Summary:');
                    output.add(`  Total requests: ${summary.run.stats.requests?.total || 0}`);
                    output.add(`  Failed requests: ${summary.run.stats.requests?.failed || 0}`);
                    output.add(`  Total assertions: ${summary.run.stats.assertions?.total || 0}`);
                    output.add(`  Failed assertions: ${summary.run.stats.assertions?.failed || 0}`);
                    if (summary.run.stats.iterations) {
                        output.add(`  Total iterations: ${summary.run.stats.iterations.total || 0}`);
                        output.add(`  Failed iterations: ${summary.run.stats.iterations.failed || 0}`);
                    }
                }
                resolve();
            });
        });
        return {
            content: [
                {
                    type: 'text',
                    text: output.build(),
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
