import newman from 'newman';
import { getRequestAgents } from './agents.js';
export class OutputBuilder {
    lines = [];
    add(line) {
        this.lines.push(line);
    }
    build() {
        return this.lines.join('\n');
    }
}
export class TestTracker {
    assertions = [];
    totalTests = 0;
    totalPassed = 0;
    totalFailed = 0;
    addAssertion(assertion) {
        this.assertions.push(assertion);
        this.totalTests++;
        if (assertion.passed) {
            this.totalPassed++;
        }
        else {
            this.totalFailed++;
        }
    }
    displayCurrentResults() {
        if (this.assertions.length === 0) {
            return '';
        }
        const lines = ['  📊 Test Results:'];
        this.assertions.forEach((assertion) => {
            const status = assertion.passed ? '✓' : '✗';
            const name = assertion.assertion || assertion.name || 'Unnamed test';
            lines.push(`    ${status} ${name}`);
            if (!assertion.passed && assertion.error) {
                const errorMessage = typeof assertion.error === 'string'
                    ? assertion.error
                    : assertion.error.message || 'Unknown error';
                lines.push(`       └─ Error: ${errorMessage}`);
            }
        });
        const passed = this.assertions.filter((a) => a.passed).length;
        const failed = this.assertions.filter((a) => !a.passed).length;
        lines.push(`    ────────────────────────────────────────`);
        lines.push(`    ${this.assertions.length} tests | ✓ ${passed} passed | ✗ ${failed} failed\n`);
        this.assertions.length = 0;
        return lines.join('\n');
    }
    getTotalStats() {
        return {
            total: this.totalTests,
            passed: this.totalPassed,
            failed: this.totalFailed,
        };
    }
    reset() {
        this.assertions.length = 0;
        this.totalTests = 0;
        this.totalPassed = 0;
        this.totalFailed = 0;
    }
}
export function buildNewmanOptions(params, collection, environment) {
    const requestAgents = getRequestAgents();
    return {
        collection: collection,
        environment: environment,
        iterationCount: params.iterationCount || 1,
        timeout: 0,
        timeoutRequest: params.requestTimeout || 60000,
        timeoutScript: params.scriptTimeout || 5000,
        delayRequest: 1000,
        ignoreRedirects: false,
        insecure: false,
        bail: params.stopOnFailure ? ['failure'] : false,
        suppressExitCode: true,
        reporters: [],
        reporter: {},
        color: 'off',
        verbose: false,
        requestAgents,
    };
}
export async function executeCollection(context, progress) {
    const tracker = new TestTracker();
    const output = new OutputBuilder();
    output.add(`🚀 Starting collection: ${context.collection.name}`);
    if (context.environment) {
        output.add(`🌍 Using environment: ${context.environment.name}\n`);
    }
    const newmanOptions = buildNewmanOptions(context.params, context.collection.json, context.environment?.json);
    const startTime = Date.now();
    const summary = await runNewman(newmanOptions, tracker, output, progress);
    const endTime = Date.now();
    const durationMs = endTime - startTime;
    return {
        output: output.build(),
        testStats: tracker.getTotalStats(),
        summary,
        startTime,
        endTime,
        durationMs,
    };
}
function runNewman(options, tracker, output, progress) {
    return new Promise((resolve, reject) => {
        newman
            .run(options)
            .on('start', () => {
            output.add('🎯 Starting collection run...\n');
            void progress?.heartbeat('starting collection run');
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
                void progress?.heartbeat(`ran request: ${String(args.item.name ?? 'unnamed')}`);
            }
        })
            .on('error', (err) => {
            output.add('\n❌ Run error: ' + (err?.message ?? String(err)));
            reject(err);
        })
            .on('done', (err, summary) => {
            if (err) {
                output.add('\n❌ Run error: ' + err.message);
                reject(err);
                return;
            }
            output.add('\n=== ✅ Run completed! ===');
            appendSummaryToOutput(output, tracker, summary);
            resolve(summary);
        });
    });
}
function appendSummaryToOutput(output, tracker, summary) {
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
}
