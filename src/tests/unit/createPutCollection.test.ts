import { describe, it, expect, vi } from 'vitest';
import { handler as createCollectionHandler } from '../../tools/createCollection.js';
import { handler as putCollectionHandler } from '../../tools/putCollection.js';
import type { PostmanAPIClient } from '../../clients/postman.js';

const schema = 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json';

function nestedCollectionPayload() {
  return {
    info: { name: 'Nested Test', schema },
    item: [
      {
        name: 'Users',
        request: {},
        item: [
          {
            name: 'List Users',
            request: { method: 'GET', url: 'https://api.example.com/users' },
            item: [],
          },
        ],
      },
    ],
  };
}

function mockClient(method: 'post' | 'put') {
  const fn = vi.fn().mockResolvedValue({ collection: { id: 'owner-abc', uid: 'owner-abc' } });
  return {
    [method]: fn,
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  } as unknown as PostmanAPIClient & {
    [K in typeof method]: ReturnType<typeof vi.fn>;
  };
}

describe('createCollection / putCollection nested folders', () => {
  it('createCollection sanitizes folder nodes before POST', async () => {
    const client = mockClient('post');
    await createCollectionHandler(
      { workspace: 'ws-1', collection: nestedCollectionPayload() },
      { client }
    );

    expect(client.post).toHaveBeenCalledOnce();
    const body = JSON.parse((client.post.mock.calls[0] as [string, { body: string }])[1].body);
    const folder = body.collection.item[0];
    expect(folder).not.toHaveProperty('request');
    expect(folder.item[0]).not.toHaveProperty('item');
    expect(folder.item[0].request.method).toBe('GET');
  });

  it('putCollection sanitizes folder nodes before PUT', async () => {
    const client = mockClient('put');
    await putCollectionHandler(
      {
        collectionId: '12345-33823532ab9e41c9b6fd12d0fd459b8b',
        collection: nestedCollectionPayload(),
      },
      { client }
    );

    expect(client.put).toHaveBeenCalledOnce();
    const body = JSON.parse((client.put.mock.calls[0] as [string, { body: string }])[1].body);
    const folder = body.collection.item[0];
    expect(folder).not.toHaveProperty('request');
    expect(folder.item[0].request.url).toBe('https://api.example.com/users');
  });
});
