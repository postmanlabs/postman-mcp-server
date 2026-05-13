import type { Agent as HttpAgent } from 'node:http';
import type { Agent as HttpsAgent } from 'node:https';

export type RequestAgents = { http?: HttpAgent; https?: HttpsAgent };

let provider: () => RequestAgents = () => ({ http: undefined, https: undefined });

export function setRequestAgentsProvider(p: () => RequestAgents): void {
  provider = p;
}

export function getRequestAgents(): RequestAgents {
  return provider();
}
