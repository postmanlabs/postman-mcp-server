import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'getApiCatalogSystemEnvironment';
export const title = 'Get an API Catalog system environment';
export const description =
  "Gets one system environment by ID. Use getApiCatalogSystemEnvironments when you need\nto discover the ID.\nDo not use this tool to list the services in that environment; use\ngetApiCatalogServices with this environment's ID instead. Requires a Postman\nEnterprise plan.\n";
export const parameters = z.object({
  systemEnvironmentId: z.string().describe("The system environment's ID."),
});
export const annotations = {
  title: 'Get an API Catalog system environment',
  readOnlyHint: true,
  openWorldHint: false,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    const endpoint = `/api-catalog/system-environments/${encodeURIComponent(String(args.systemEnvironmentId))}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const options: any = {
      headers: extra.headers,
    };
    const result = await extra.client.get(url, options);
    return {
      content: [
        {
          type: 'text',
          text: `${typeof result === 'string' ? result : JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  } catch (e: unknown) {
    if (e instanceof McpError) {
      throw e;
    }
    throw asMcpError(e);
  }
}
