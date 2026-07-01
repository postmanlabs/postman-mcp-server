export function sanitizeCollectionItems(items) {
    if (!items)
        return items;
    return items.map(sanitizeCollectionItem);
}
function sanitizeCollectionItem(item) {
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
export function sanitizeCollectionPayload(collection) {
    if (!collection?.item)
        return collection;
    return { ...collection, item: sanitizeCollectionItems(collection.item) };
}
