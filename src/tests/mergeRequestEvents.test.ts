import { describe, expect, it } from 'vitest';
import { extractRequestEvents, mergeEventsByListen } from '../tools/utils/mergeRequestEvents.js';

describe('mergeEventsByListen', () => {
  it('replaces only the listen type present in incoming events', () => {
    const existing = [
      { listen: 'prerequest', script: { exec: ['// auth'] } },
      { listen: 'test', script: { exec: ['pm.test("old", () => {})'] } },
    ];
    const incoming = [{ listen: 'test', script: { exec: ['pm.test("new", () => {})'] } }];
    const merged = mergeEventsByListen(existing, incoming);
    expect(merged).toHaveLength(2);
    expect(merged[0].listen).toBe('prerequest');
    expect(merged[1].script).toEqual({ exec: ['pm.test("new", () => {})'] });
  });

  it('appends a new listen type from incoming', () => {
    const existing = [{ listen: 'test', script: { exec: ['a'] } }];
    const incoming = [{ listen: 'prerequest', script: { exec: ['b'] } }];
    const merged = mergeEventsByListen(existing, incoming);
    expect(merged.map((e) => e.listen)).toEqual(['test', 'prerequest']);
  });

  it('returns incoming when there are no existing events', () => {
    const incoming = [{ listen: 'test', script: { exec: ['x'] } }];
    expect(mergeEventsByListen(undefined, incoming)).toEqual(incoming);
  });
});

describe('extractRequestEvents', () => {
  it('reads events from top-level response', () => {
    const payload = { events: [{ listen: 'test' }] };
    expect(extractRequestEvents(payload)).toEqual([{ listen: 'test' }]);
  });

  it('reads events from data wrapper', () => {
    const payload = { data: { events: [{ listen: 'prerequest' }] } };
    expect(extractRequestEvents(payload)).toEqual([{ listen: 'prerequest' }]);
  });
});
