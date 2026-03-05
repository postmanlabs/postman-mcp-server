import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'getAnalyticsMetadata';
export const description =
  'Returns a catalog of analytics resources and their corresponding metrics for use with the GET /analytics endpoint. These metrics provide insights on API usage, success, workspace, and team trends in Postman.';
export const parameters = z.object({
  include: z
    .string()
    .describe(
      'A comma-separated list of the additional information to include in the response. Accepts the `parameters` and `response` values.\n\nWhen you pass this query parameter and its values, the response provides detailed information, including parameters and response schemas for the given metrics.\n'
    )
    .optional(),
  resources: z
    .string()
    .describe(
      'A comma-separated list of resource types to filter the metrics by. Accepts the `user`, `workspace`, and `team` values.'
    )
    .optional(),
  metrics: z
    .string()
    .describe(
      "A comma-separated list of metrics values to use to filter the response.\n\nIf you don't pass this query parameter, then the response returns all metadata for all available metrics.\n"
    )
    .optional(),
});
export const annotations = {
  title:
    'Returns a catalog of analytics resources and their corresponding metrics for use with the GET /analytics endpoint. These metrics provide insights on API usage, success, workspace, and team trends in Postman.',
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    const endpoint = `/analytics-metadata`;
    const query = new URLSearchParams();
    if (args.include !== undefined) query.set('include', String(args.include));
    if (args.resources !== undefined) query.set('resources', String(args.resources));
    if (args.metrics !== undefined) query.set('metrics', String(args.metrics));
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
