interface TestResult {
  passed: boolean;
  assertion?: string;
  name?: string;
  error?: { message?: string } | string;
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

  getTotalStats(): { total: number; passed: number; failed: number } {
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

export class OutputBuilder {
  private readonly lines: string[] = [];

  add(line: string): void {
    this.lines.push(line);
  }

  build(): string {
    return this.lines.join('\n');
  }
}

export function buildNewmanOptions(
  params: {
    requestTimeout?: number;
    scriptTimeout?: number;
    iterationCount?: number;
    stopOnError?: boolean;
    stopOnFailure?: boolean;
    abortOnError?: boolean;
    abortOnFailure?: boolean;
  },
  collection: any,
  environment?: any
) {
  return {
    collection: collection,
    environment: environment,
    iterationCount: params.iterationCount || 1,
    timeout: params.requestTimeout || 60000,
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
    requestAgents: {
      http: undefined,
      https: undefined,
    },
  };
}
