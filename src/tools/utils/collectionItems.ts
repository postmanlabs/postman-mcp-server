/** Postman collection v2.1 item: request leaf or folder (nested item array). */
export type CollectionItemInput = {
  name?: string;
  description?: string | null;
  id?: string;
  request?: unknown;
  item?: CollectionItemInput[];
  [key: string]: unknown;
};

/**
 * Normalize collection items for the Postman API oneOf (request XOR folder).
 * Strips `request` from folder nodes and `item` from request leaves recursively.
 */
export function sanitizeCollectionItems(
  items: CollectionItemInput[] | undefined,
): CollectionItemInput[] | undefined {
  if (!items) return items;
  return items.map(sanitizeCollectionItem);
}

function sanitizeCollectionItem(item: CollectionItemInput): CollectionItemInput {
  if (Array.isArray(item.item) && item.item.length > 0) {
    const { request: _removed, ...folder } = item;
    return { ...folder, item: item.item.map(sanitizeCollectionItem) };
  }
  if (item.request !== undefined) {
    const { item: _nested, ...requestItem } = item;
    return requestItem;
  }
  return item;
}

export function sanitizeCollectionPayload<T extends { item?: CollectionItemInput[] }>(
  collection: T,
): T {
  if (!collection?.item) return collection;
  return { ...collection, item: sanitizeCollectionItems(collection.item) };
}
