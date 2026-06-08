import { describe, it, expect } from 'vitest';
import { buildNewmanOptions } from '../../tools/runner/executor.js';

describe('buildNewmanOptions', () => {
  const baseParams = { collectionId: '12345-33823532ab9e41c9b6fd12d0fd459b8b' };
  const collection = { item: [] };

  it('maps stopOnFailure to bail failure array', () => {
    const opts = buildNewmanOptions({ ...baseParams, stopOnFailure: true }, collection);
    expect(opts.bail).toEqual(['failure']);
  });

  it('maps stopOnError to bail true', () => {
    const opts = buildNewmanOptions({ ...baseParams, stopOnError: true }, collection);
    expect(opts.bail).toBe(true);
  });

  it('maps abortOnError to bail true', () => {
    const opts = buildNewmanOptions({ ...baseParams, abortOnError: true }, collection);
    expect(opts.bail).toBe(true);
  });

  it('maps abortOnFailure to bail failure array when no higher-priority flags are set', () => {
    const opts = buildNewmanOptions({ ...baseParams, abortOnFailure: true }, collection);
    expect(opts.bail).toEqual(['failure']);
  });

  it('defaults bail to false', () => {
    const opts = buildNewmanOptions(baseParams, collection);
    expect(opts.bail).toBe(false);
  });

  it('prefers stopOnFailure over stopOnError', () => {
    const opts = buildNewmanOptions(
      { ...baseParams, stopOnFailure: true, stopOnError: true },
      collection
    );
    expect(opts.bail).toEqual(['failure']);
  });
});
