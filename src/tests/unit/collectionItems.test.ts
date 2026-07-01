import { describe, it, expect } from 'vitest';
import { sanitizeCollectionItems } from '../../tools/utils/collectionItems.js';

describe('sanitizeCollectionItems', () => {
  it('removes request from folder nodes', () => {
    const items = [
      {
        name: 'Folder',
        request: {},
        item: [{ name: 'GET', request: { method: 'GET', url: 'https://example.com' } }],
      },
    ];
    const out = sanitizeCollectionItems(items)!;
    expect(out[0]).not.toHaveProperty('request');
    expect(out[0].item).toHaveLength(1);
    expect(out[0].item![0]).not.toHaveProperty('item');
    expect(out[0].item![0].request).toEqual({ method: 'GET', url: 'https://example.com' });
  });

  it('removes item from request leaves', () => {
    const items = [
      {
        name: 'Req',
        request: { method: 'POST', url: 'https://api.example.com' },
        item: [],
      },
    ];
    const out = sanitizeCollectionItems(items)!;
    expect(out[0]).not.toHaveProperty('item');
  });

  it('sanitizes deeply nested folder structures', () => {
    const items = [
      {
        name: 'Root',
        request: {},
        item: [
          {
            name: 'Child Folder',
            request: {},
            item: [
              {
                name: 'Leaf',
                request: { method: 'GET', url: 'https://example.com' },
                item: [],
              },
            ],
          },
        ],
      },
    ];
    const out = sanitizeCollectionItems(items)!;
    expect(out[0]).not.toHaveProperty('request');
    expect(out[0].item![0]).not.toHaveProperty('request');
    expect(out[0].item![0].item![0]).not.toHaveProperty('item');
  });
});
