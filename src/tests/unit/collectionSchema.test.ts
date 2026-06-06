import { describe, it, expect } from 'vitest';
import { parameters as createCollectionParameters } from '../../tools/createCollection.js';
import { parameters as putCollectionParameters } from '../../tools/putCollection.js';

const folderCollection = {
  info: {
    name: 'Test Collection',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  item: [
    {
      name: 'My Folder',
      item: [
        {
          name: 'My Request',
          request: {
            method: 'GET',
            url: 'https://example.com',
          },
        },
      ],
    },
  ],
};

describe('collection tool schemas', () => {
  it('createCollection accepts folder items without a request property', () => {
    const result = createCollectionParameters.safeParse({
      workspace: 'workspace-id',
      collection: folderCollection,
    });
    expect(result.success).toBe(true);
  });

  it('putCollection accepts folder items without a request property', () => {
    const result = putCollectionParameters.safeParse({
      collectionId: 'collection-id',
      collection: folderCollection,
    });
    expect(result.success).toBe(true);
  });
});
