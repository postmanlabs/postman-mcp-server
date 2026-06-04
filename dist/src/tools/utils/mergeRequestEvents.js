export function mergeEventsByListen(existing, incoming) {
    const prior = existing ?? [];
    const byListen = new Map();
    for (const event of prior) {
        if (event?.listen)
            byListen.set(event.listen, event);
    }
    for (const event of incoming) {
        if (event?.listen)
            byListen.set(event.listen, event);
    }
    const order = [];
    for (const event of prior) {
        if (event?.listen && !order.includes(event.listen))
            order.push(event.listen);
    }
    for (const event of incoming) {
        if (event?.listen && !order.includes(event.listen))
            order.push(event.listen);
    }
    return order.map((listen) => byListen.get(listen));
}
export function extractRequestEvents(payload) {
    if (!payload || typeof payload !== 'object')
        return [];
    const root = payload;
    if (Array.isArray(root.events))
        return root.events;
    const data = root.data;
    if (data && typeof data === 'object') {
        const events = data.events;
        if (Array.isArray(events))
            return events;
    }
    return [];
}
