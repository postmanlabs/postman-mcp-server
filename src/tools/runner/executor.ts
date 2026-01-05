import {
  ExecutionContext,
  ExecutionResult,
  TestStatistics,
  TestResult,
  CollectionRunParams,
} from './models.js';
import newman from 'newman';

export class OutputBuilder {
  private readonly lines: string[] = [];

  add(line: string): void {
    this.lines.push(line);
  }

  build(): string {
    return this.lines.join('\n');
  }
}

export class TestTracker {
  private readonly assertions: TestResult[] = [];
  private totalTests = 0;
  private totalPassed = 0;
  private totalFailed = 0;

  addAssertion(assertion: TestResult): void {
    this.assertions.push(assertion);
    this.totalTests++;
    if (assertion.passed) {
      this.totalPassed++;
    } else {
      this.totalFailed++;
    }
  }

  displayCurrentResults(): string {
    if (this.assertions.length === 0) {
      return '';
    }

    const lines: string[] = ['  📊 Test Results:'];

    this.assertions.forEach((assertion) => {
      const status = assertion.passed ? '✓' : '✗';
      const name = assertion.assertion || assertion.name || 'Unnamed test';
      lines.push(`    ${status} ${name}`);

      if (!assertion.passed && assertion.error) {
        const errorMessage =
          typeof assertion.error === 'string'
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

  getTotalStats(): TestStatistics {
    return {
      total: this.totalTests,
      passed: this.totalPassed,
      failed: this.totalFailed,
    };
  }

  reset(): void {
    this.assertions.length = 0;
    this.totalTests = 0;
    this.totalPassed = 0;
    this.totalFailed = 0;
  }
}

export function resolveFolderName(
  folderId: string | undefined,
  collection: any
): string | undefined {
  if (!folderId) return undefined;

  const items = collection?.item;
  if (!Array.isArray(items)) return undefined;

  function findFolder(items: any[], targetId: string): string | undefined {
    for (const item of items) {
      const itemId = item.id || (item._postman_id ? item._postman_id : null);
      const itemUid = item.uid;

      const idMatches =
        itemId === targetId ||
        itemUid === targetId ||
        (itemId && targetId.endsWith(itemId)) ||
        (itemUid && targetId.endsWith(itemUid));

      if (idMatches && Array.isArray(item.item)) {
        return item.name;
      }

      if (Array.isArray(item.item)) {
        const found = findFolder(item.item, targetId);
        if (found) return found;
      }
    }
    return undefined;
  }

  const foundName = findFolder(items, folderId);
  if (foundName) return foundName;

  return folderId;
}

export function buildNewmanOptions(
  params: CollectionRunParams,
  collection: any,
  environment?: object
) {
  const folderName = resolveFolderName(params.folderId, collection);

  return {
    collection: collection,
    environment: environment,
    folder: folderName,
    iterationCount: params.iterationCount || 1,
    timeout: params.requestTimeout || 60000,
    timeoutRequest: params.requestTimeout || 60000,
    timeoutScript: params.scriptTimeout || 5000,
    ignoreRedirects: false,
    insecure: false,
    bail: params.stopOnFailure ? ['failure'] : false,
    suppressExitCode: true,
    reporters: [],
    reporter: {},
    color: 'off',
    verbose: false,
    requestAgents: {
      http: undefined,
      https: undefined,
    },
  };
}

export async function executeCollection(context: ExecutionContext): Promise<ExecutionResult> {
  const tracker = new TestTracker();
  const output = new OutputBuilder();

  output.add(`🚀 Starting collection: ${context.collection.name}`);
  if (context.params.folderId) {
    const resolvedName = resolveFolderName(context.params.folderId, context.collection.json);
    output.add(`📁 Filtering to folder: ${resolvedName || context.params.folderId}`);
    if (resolvedName && resolvedName !== context.params.folderId) {
      output.add(`   (resolved from ID: ${context.params.folderId})`);
    }
  }
  if (context.environment) {
    output.add(`🌍 Using environment: ${context.environment.name}`);
  }
  output.add('');

  const newmanOptions = buildNewmanOptions(
    context.params,
    context.collection.json,
    context.environment?.json
  );

  const startTime = Date.now();

  const summary = await runNewman(newmanOptions, tracker, output);

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

function runNewman(options: any, tracker: TestTracker, output: OutputBuilder): Promise<any> {
  return new Promise((resolve, reject) => {
    newman
      .run(options)
      .on('start', () => {
        output.add('🎯 Starting collection run...\n');
      })
      .on('assertion', (_err: any, args: any) => {
        if (args.assertion) {
          tracker.addAssertion({
            passed: !args.error,
            assertion: args.assertion,
            name: args.assertion,
            error: args.error,
          });
        }
      })
      .on('item', (_err: any, args: any) => {
        if (args.item) {
          const testResults = tracker.displayCurrentResults();
          if (testResults) {
            output.add(`\n📝 Request: ${args.item.name}`);
            output.add(testResults);
          }
        }
      })
      .on('done', (err: any, summary: any) => {
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

function appendSummaryToOutput(output: OutputBuilder, tracker: TestTracker, summary: any): void {
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
