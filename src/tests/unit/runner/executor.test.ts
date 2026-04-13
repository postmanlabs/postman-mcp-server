import { describe, it, expect, beforeEach } from 'vitest';
import { OutputBuilder, TestTracker, buildNewmanOptions } from '../../../tools/runner/executor.js';

describe('OutputBuilder', () => {
  it('builds empty string when no lines added', () => {
    const builder = new OutputBuilder();
    expect(builder.build()).toBe('');
  });

  it('builds single line', () => {
    const builder = new OutputBuilder();
    builder.add('hello');
    expect(builder.build()).toBe('hello');
  });

  it('joins multiple lines with newline', () => {
    const builder = new OutputBuilder();
    builder.add('line one');
    builder.add('line two');
    builder.add('line three');
    expect(builder.build()).toBe('line one\nline two\nline three');
  });

  it('preserves empty strings as lines', () => {
    const builder = new OutputBuilder();
    builder.add('a');
    builder.add('');
    builder.add('b');
    expect(builder.build()).toBe('a\n\nb');
  });
});

describe('TestTracker', () => {
  let tracker: TestTracker;

  beforeEach(() => {
    tracker = new TestTracker();
  });

  it('starts with zero stats', () => {
    const stats = tracker.getTotalStats();
    expect(stats).toEqual({ total: 0, passed: 0, failed: 0 });
  });

  it('counts passed assertion', () => {
    tracker.addAssertion({ passed: true, assertion: 'status is 200', name: 'status is 200' });
    expect(tracker.getTotalStats()).toEqual({ total: 1, passed: 1, failed: 0 });
  });

  it('counts failed assertion', () => {
    tracker.addAssertion({
      passed: false,
      assertion: 'body contains id',
      name: 'body contains id',
      error: { message: 'expected body to contain id' },
    });
    expect(tracker.getTotalStats()).toEqual({ total: 1, passed: 0, failed: 1 });
  });

  it('accumulates mixed assertions correctly', () => {
    tracker.addAssertion({ passed: true, assertion: 'a', name: 'a' });
    tracker.addAssertion({ passed: true, assertion: 'b', name: 'b' });
    tracker.addAssertion({ passed: false, assertion: 'c', name: 'c', error: 'failed' });
    expect(tracker.getTotalStats()).toEqual({ total: 3, passed: 2, failed: 1 });
  });

  it('displayCurrentResults returns empty string when no assertions', () => {
    expect(tracker.displayCurrentResults()).toBe('');
  });

  it('displayCurrentResults includes assertion names', () => {
    tracker.addAssertion({ passed: true, assertion: 'status ok', name: 'status ok' });
    const output = tracker.displayCurrentResults();
    expect(output).toContain('status ok');
    expect(output).toContain('✓');
  });

  it('displayCurrentResults shows error message for failed assertions', () => {
    tracker.addAssertion({
      passed: false,
      assertion: 'body check',
      name: 'body check',
      error: { message: 'missing field' },
    });
    const output = tracker.displayCurrentResults();
    expect(output).toContain('✗');
    expect(output).toContain('missing field');
  });

  it('displayCurrentResults handles string error', () => {
    tracker.addAssertion({
      passed: false,
      assertion: 'check',
      name: 'check',
      error: 'plain string error',
    });
    const output = tracker.displayCurrentResults();
    expect(output).toContain('plain string error');
  });

  it('displayCurrentResults resets pending assertions after call', () => {
    tracker.addAssertion({ passed: true, assertion: 'x', name: 'x' });
    tracker.displayCurrentResults();
    // After display, pending assertions are cleared — second call returns empty
    expect(tracker.displayCurrentResults()).toBe('');
  });

  it('getTotalStats persists across displayCurrentResults calls', () => {
    tracker.addAssertion({ passed: true, assertion: 'x', name: 'x' });
    tracker.displayCurrentResults(); // clears pending but not totals
    expect(tracker.getTotalStats()).toEqual({ total: 1, passed: 1, failed: 0 });
  });

  it('reset clears all state', () => {
    tracker.addAssertion({ passed: true, assertion: 'x', name: 'x' });
    tracker.addAssertion({ passed: false, assertion: 'y', name: 'y', error: 'err' });
    tracker.reset();
    expect(tracker.getTotalStats()).toEqual({ total: 0, passed: 0, failed: 0 });
    expect(tracker.displayCurrentResults()).toBe('');
  });
});

describe('buildNewmanOptions', () => {
  const baseParams = { collectionId: 'col-123' };
  const collection = { info: { name: 'My Collection' }, item: [] };

  it('includes collection in options', () => {
    const opts = buildNewmanOptions(baseParams, collection);
    expect(opts.collection).toBe(collection);
  });

  it('environment is undefined when not provided', () => {
    const opts = buildNewmanOptions(baseParams, collection);
    expect(opts.environment).toBeUndefined();
  });

  it('passes environment through when provided', () => {
    const env = { id: 'env-1', name: 'Staging', values: [] };
    const opts = buildNewmanOptions(baseParams, collection, env);
    expect(opts.environment).toBe(env);
  });

  it('defaults iterationCount to 1', () => {
    const opts = buildNewmanOptions(baseParams, collection);
    expect(opts.iterationCount).toBe(1);
  });

  it('uses iterationCount from params', () => {
    const opts = buildNewmanOptions({ ...baseParams, iterationCount: 5 }, collection);
    expect(opts.iterationCount).toBe(5);
  });

  it('defaults timeout to 60000', () => {
    const opts = buildNewmanOptions(baseParams, collection);
    expect(opts.timeout).toBe(60000);
    expect(opts.timeoutRequest).toBe(60000);
  });

  it('uses requestTimeout from params', () => {
    const opts = buildNewmanOptions({ ...baseParams, requestTimeout: 30000 }, collection);
    expect(opts.timeout).toBe(30000);
    expect(opts.timeoutRequest).toBe(30000);
  });

  it('defaults scriptTimeout to 5000', () => {
    const opts = buildNewmanOptions(baseParams, collection);
    expect(opts.timeoutScript).toBe(5000);
  });

  it('uses scriptTimeout from params', () => {
    const opts = buildNewmanOptions({ ...baseParams, scriptTimeout: 2000 }, collection);
    expect(opts.timeoutScript).toBe(2000);
  });

  it('bail is false when stopOnFailure not set', () => {
    const opts = buildNewmanOptions(baseParams, collection);
    expect(opts.bail).toBe(false);
  });

  it('bail is ["failure"] when stopOnFailure is true', () => {
    const opts = buildNewmanOptions({ ...baseParams, stopOnFailure: true }, collection);
    expect(opts.bail).toEqual(['failure']);
  });

  it('suppressExitCode is always true', () => {
    const opts = buildNewmanOptions(baseParams, collection);
    expect(opts.suppressExitCode).toBe(true);
  });

  it('color is always off', () => {
    const opts = buildNewmanOptions(baseParams, collection);
    expect(opts.color).toBe('off');
  });
});
