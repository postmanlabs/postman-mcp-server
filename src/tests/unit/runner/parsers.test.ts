import { describe, it, expect, vi } from 'vitest';

// env.ts calls process.exit(1) at module load if POSTMAN_API_KEY is missing.
// Mock it so unit tests run without a real API key.
vi.mock('../../../env.js', () => ({
  env: { POSTMAN_API_KEY: 'test-key' },
}));
import { formatUserOutput } from '../../../tools/runner/parsers.js';
import type { ExecutionResult } from '../../../tools/runner/models.js';

function makeResult(overrides: Partial<ExecutionResult> = {}): ExecutionResult {
  return {
    output: 'Run output here',
    testStats: { total: 0, passed: 0, failed: 0 },
    summary: {},
    startTime: 1000,
    endTime: 2500,
    durationMs: 1500,
    ...overrides,
  };
}

describe('formatUserOutput', () => {
  it('appends duration in seconds to output', () => {
    const result = makeResult({ output: 'done', durationMs: 1500 });
    expect(formatUserOutput(result)).toBe('done\n⏱️  Duration: 1.50s');
  });

  it('formats sub-second duration', () => {
    const result = makeResult({ output: 'fast', durationMs: 250 });
    expect(formatUserOutput(result)).toBe('fast\n⏱️  Duration: 0.25s');
  });

  it('formats whole second duration', () => {
    const result = makeResult({ output: 'ok', durationMs: 3000 });
    expect(formatUserOutput(result)).toBe('ok\n⏱️  Duration: 3.00s');
  });

  it('rounds duration to two decimal places', () => {
    const result = makeResult({ output: 'x', durationMs: 1234 });
    expect(formatUserOutput(result)).toBe('x\n⏱️  Duration: 1.23s');
  });

  it('preserves multiline output', () => {
    const result = makeResult({ output: 'line1\nline2', durationMs: 500 });
    const formatted = formatUserOutput(result);
    expect(formatted).toContain('line1\nline2');
    expect(formatted).toContain('Duration: 0.50s');
  });
});
