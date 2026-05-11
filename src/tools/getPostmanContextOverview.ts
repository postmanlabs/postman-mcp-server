import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'getPostmanContextOverview';
export const description = `Returns the Postman Context overview (markdown). Explains the core concepts (workspaces, collections, requests, installed code) and the end-to-end workflow for finding APIs, generating client code, and maintaining installed requests over time.

Call this FIRST — and only — when the user wants to explore APIs in Postman's network, answer questions about how an API works, plan an integration, or generate client code grounded in real Postman API definitions, AND you have not already loaded the overview in this session. Do NOT call this for routine Postman operations like listing or editing workspaces, collections, environments, mocks, monitors, or specs — go straight to the relevant resource tool. After reading the overview, route to the appropriate topic-specific instructions tool: getApiDiscoveryInstructions (find/search/compare APIs), getCodeGenerationInstructions (generate client code from a request), or getInstalledApiMaintenanceInstructions (list, update, or remove installed requests).`;

export const parameters = z.object({});

export const annotations = {
  title: 'Get Postman Context Overview',
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  _args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    const result = await extra.client.get('/context/instructions', {
      headers: extra.headers,
    });
    return {
      content: [{ type: 'text', text: result as string }],
    };
  } catch (e: unknown) {
    if (e instanceof McpError) {
      throw e;
    }
    throw asMcpError(e);
  }
}
