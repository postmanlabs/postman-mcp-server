import { describe, it, expect } from 'vitest';
import { parameters } from '../../tools/putCollection.js';

describe('putCollection auth schema', () => {
  const basePayload = {
    collectionId: '12345-33823532ab9e41c9b6fd12d0fd459b8b',
    collection: {
      info: {
        name: 'Test Collection',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      item: [],
    },
  };

  it('accepts collection-level noauth auth type', () => {
    const result = parameters.safeParse({
      ...basePayload,
      collection: {
        ...basePayload.collection,
        auth: { type: 'noauth', noauth: {} },
      },
    });

    expect(result.success).toBe(true);
  });

  it('rejects unknown auth types at collection level', () => {
    const result = parameters.safeParse({
      ...basePayload,
      collection: {
        ...basePayload.collection,
        auth: { type: 'invalid-auth' },
      },
    });

    expect(result.success).toBe(false);
  });
});
