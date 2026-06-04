export type RequestEvent = {
  listen?: string;
  script?: unknown;
  [key: string]: unknown;
};

/**
 * Merge incoming request events by `listen` (prerequest / test), preserving
 * event types not included in the update. Matches Postman Collection v2.1
 * event semantics and fixes wholesale replacement when agents update one script.
 */
export function mergeEventsByListen(
  existing: RequestEvent[] | undefined | null,
  incoming: RequestEvent[]
): RequestEvent[] {
  const prior = existing ?? [];
  const byListen = new Map<string, RequestEvent>();

  for (const event of prior) {
    if (event?.listen) byListen.set(event.listen, event);
  }
  for (const event of incoming) {
    if (event?.listen) byListen.set(event.listen, event);
  }

  const order: string[] = [];
  for (const event of prior) {
    if (event?.listen && !order.includes(event.listen)) order.push(event.listen);
  }
  for (const event of incoming) {
    if (event?.listen && !order.includes(event.listen)) order.push(event.listen);
  }

  return order.map((listen) => byListen.get(listen)!);
}

/** Pull events from a Postman GET /collections/{id}/requests/{id} response. */
export function extractRequestEvents(payload: unknown): RequestEvent[] {
  if (!payload || typeof payload !== 'object') return [];
  const root = payload as Record<string, unknown>;
  if (Array.isArray(root.events)) return root.events as RequestEvent[];
  const data = root.data;
  if (data && typeof data === 'object') {
    const events = (data as Record<string, unknown>).events;
    if (Array.isArray(events)) return events as RequestEvent[];
  }
  return [];
}
