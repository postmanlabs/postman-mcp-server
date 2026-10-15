import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'getApiCatalogService';
export const title = 'Get an API Catalog service';
export const description =
  "Gets one catalogued service's health, traffic, compliance, ownership, and dependencies\nin a given system environment. Both the service ID and the required\n\\`systemEnvironmentId\\` are needed; get them from getApiCatalogServices and\ngetApiCatalogSystemEnvironments. The same service reports different data per\nenvironment, so the environment is part of the question, not an optional filter.\nDo not use this tool for per-endpoint metrics; use getApiCatalogServiceEndpoints\ninstead. Requires a Postman Enterprise plan.\n";
export const parameters = z.object({
  serviceId: z.string().describe("The service's ID."),
  systemEnvironmentId: z.string().describe("The system environment's ID."),
});
export const annotations = {
  title: 'Get an API Catalog service',
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
    const endpoint = `/api-catalog/services/${encodeURIComponent(String(args.serviceId))}`;
    const query = new URLSearchParams();
    if (args.systemEnvironmentId !== undefined)
      query.set('systemEnvironmentId', String(args.systemEnvironmentId));
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
