/**
 * Detects whether a tool was invoked with pagination parameters.
 *
 * Returns `true` when the caller supplied any of the common pagination keys:
 *   - `cursor` — non-empty string (cursor-based pagination, e.g. getWorkspaces, getMonitors)
 *   - `nextCursor` — non-empty string (search endpoints)
 *   - `offset` — number greater than 0 (offset-based pagination, e.g. getCollections, getAnalyticsData)
 *
 * The first call to a paginated tool (no cursor / `offset = 0`) reports `false`;
 * subsequent calls that consume the prior cursor report `true`. This lets us
 * measure how often LLMs actually paginate vs. only ever read the first page.
 */
export function detectPaginationUsed(args: Record<string, unknown>): boolean {
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
