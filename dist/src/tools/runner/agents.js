let provider = () => ({ http: undefined, https: undefined });
export function setRequestAgentsProvider(p) {
    provider = p;
}
export function getRequestAgents() {
    return provider();
}
