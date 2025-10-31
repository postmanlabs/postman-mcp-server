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
export class OutputBuilder {
    lines = [];
    add(line) {
        this.lines.push(line);
    }
    build() {
        return this.lines.join('\n');
    }
}
export function buildNewmanOptions(params, collection, environment) {
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
