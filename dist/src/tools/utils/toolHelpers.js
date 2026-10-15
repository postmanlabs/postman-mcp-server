import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
export { McpError };
export function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export async function mergeCollectionRequestEvents(client, endpoint, incoming, headers) {
    if (!Array.isArray(incoming) || incoming.length === 0)
        return incoming;
    const suppliedListenTypes = new Set(incoming.map((event) => event?.listen));
    let current;
    try {
        current = await client.get(endpoint, { headers });
    }
    catch (error) {
        const cause = error?.cause ?? String(error);
        throw new McpError(ErrorCode.InternalError, `Could not read the request's existing scripts, so the update was not sent — sending it would have deleted any event types absent from "events". Retry, or include every event you want to keep. Cause: ${cause}`);
    }
    const storedEvents = current?.data?.events;
    if (!Array.isArray(storedEvents))
        return incoming;
    const preserved = storedEvents.filter((event) => !suppliedListenTypes.has(event?.listen));
    return preserved.length > 0 ? [...incoming, ...preserved] : incoming;
}
export function defineToolAnnotations(annotations) {
    return annotations;
}
