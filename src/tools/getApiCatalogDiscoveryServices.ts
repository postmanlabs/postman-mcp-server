import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'getApiCatalogDiscoveryServices';
export const title = 'Get discovered services';
export const description =
  'Lists services that Postman has detected but that are not necessarily in the API\nCatalog yet. Use this to find candidates to onboard, or to check whether a service has\nalready been integrated. Filter with \\`discoverySource\\` (\\`api_gateway_app\\`,\n\\`insights_project\\`, \\`infra_watcher\\`, \\`public_api\\`), \\`status\\` (\\`discovered\\`,\n\\`integrated\\`, \\`archived\\`), and \\`search\\` on the name; page with \\`limit\\` (max 100) and\n\\`cursor\\`.\nDo not use this tool for services already in the catalog — those have analytics and\ngovernance data and are read with getApiCatalogServices. Requires a Postman Enterprise\nplan.\n';
export const parameters = z.object({
  discoverySource: z
    .enum(['api_gateway_app', 'insights_project', 'infra_watcher', 'public_api'])
    .describe(
      'Filter results by the given discovery source type:\n- `api_gateway_app` — API Gateway integrations.\n- `insights_project` — Postman Insights.\n- `infra_watcher` — Cluster Watcher.\n- `public_api` — Services manually added using the POST `/api-catalog/discovery-services` endpoint.\n'
    )
    .optional(),
  status: z
    .string()
    .describe(
      'A comma-separated list of statuses to filter the results by. Accepts the `discovered`, `integrated`, and `archived` values.'
    )
    .optional(),
  search: z
    .string()
    .describe(
      "Filter results by the given value that match a service's name. Matching is not case-sensitive."
    )
    .optional(),
  limit: z
    .number()
    .int()
    .gte(1)
    .lte(100)
    .describe(
      'The maximum number of rows to return in the response, up to a maximum value of 100. Any value greater than 100 returns a 400 Bad Request response.'
    )
    .default(20),
  cursor: z
    .string()
    .describe(
      'The pointer to the first record of the set of paginated results. To view the next response, use the `nextCursor` value for this parameter.'
    )
    .optional(),
});
export const annotations = {
  title: 'Get discovered services',
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
    const endpoint = `/api-catalog/discovery-services`;
    const query = new URLSearchParams();
    if (args.discoverySource !== undefined)
      query.set('discoverySource', String(args.discoverySource));
    if (args.status !== undefined) query.set('status', String(args.status));
    if (args.search !== undefined) query.set('search', String(args.search));
    if (args.limit !== undefined) query.set('limit', String(args.limit));
    if (args.cursor !== undefined) query.set('cursor', String(args.cursor));
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
