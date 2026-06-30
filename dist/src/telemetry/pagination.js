export function detectPaginationUsed(args) {
    if (typeof args.cursor === 'string' && args.cursor.length > 0) {
        return true;
    }
    if (typeof args.nextCursor === 'string' && args.nextCursor.length > 0) {
        return true;
    }
    if (typeof args.offset === 'number' && args.offset > 0) {
        return true;
    }
    return false;
}
