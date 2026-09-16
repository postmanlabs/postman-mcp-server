import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'detectedSecretsQueries';
export const title = 'Search detected secrets';
export const description =
  "Searches the secrets Postman's Secret Scanner has detected across the team. Despite\nbeing a POST this only reads — the body carries the query, and an empty body returns\neverything. Filter with \\`secretTypes\\` (IDs from getSecretTypes), \\`statuses\\`\n(\\`ACTIVE\\`, \\`FALSE_POSITIVE\\`, \\`REVOKED\\`, \\`ACCEPTED_RISK\\`), \\`resolved\\`, \\`workspaceVisibilities\\`,\nand either \\`workspaceIds\\` or \\`resources\\` — those last two are mutually exclusive, and\nsending both fails. Page with \\`limit\\` and \\`cursor\\`, and pass \\`include=meta.total\\` when\nyou need the total count.\nSecret values come back obfuscated and hashed, never in full. Use\ngetDetectedSecretsLocations to find where a specific secret appears. Requires a Postman\nEnterprise plan.\n";
export const parameters = z.object({
  limit: z
    .number()
    .int()
    .describe('The maximum number of rows to return in the response.')
    .default(10),
  cursor: z
    .string()
    .describe(
      'The pointer to the first record of the set of paginated results. To view the next response, use the `nextCursor` value for this parameter.'
    )
    .optional(),
  include: z
    .string()
    .describe(
      'The additional fields to be included as a part of the request:\n- `meta.total` — Include the total records found in the `meta` response object.\n'
    )
    .optional(),
  since: z
    .string()
    .datetime({ offset: true })
    .describe(
      'Return only results created since the given time, in [ISO 8601](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6) format. This value cannot be later than the `until` value. To use `time-numoffset` format, you must use `%2B` URL-encoding for the `+` character.'
    )
    .optional(),
  until: z
    .string()
    .datetime({ offset: true })
    .describe(
      'Return only results created until this given time, in [ISO 8601](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6) format. This value cannot be earlier than the `since` value. To use `time-numoffset` format, you must use `%2B` URL-encoding for the `+` character.'
    )
    .optional(),
  resolved: z.boolean().describe('If true, return secrets with a `resolved` status.').optional(),
  secretTypes: z
    .array(z.string().describe('The secret type ID.'))
    .describe(
      'A list of secrets types to query. For a list of valid IDs, use the GET `/secret-types` endpoint.'
    )
    .optional(),
  statuses: z
    .array(
      z
        .preprocess(
          (v) => (typeof v === 'string' ? v.toUpperCase() : v),
          z.enum(['FALSE_POSITIVE', 'ACCEPTED_RISK', 'REVOKED', 'ACTIVE'])
        )
        .describe(
          "The secret's resolution status:\n- `ACTIVE` — The secret is active.\n- `FALSE_POSITIVE` — The discovered secret is not an actual secret.\n- `REVOKED` — The secret is valid, but the user rotated their key to resolve the issue.\n- `ACCEPTED_RISK` — The Secret Scanner found the secret, but user accepts the risk of publishing it.\n"
        )
    )
    .describe('A list of the types of resolution statuses to query.')
    .optional(),
  resources: z
    .array(
      z.object({
        type: z
          .enum([
            'collection',
            'environment',
            'extensible-collection',
            'globals',
            'example',
            'request',
            'folder',
            'extensible-collection-meta',
            'extensible-request',
            'extensible-folder',
            'extensible-example',
            'extensible-message',
          ])
          .describe('The type of resource.')
          .optional(),
        ids: z
          .array(z.string().describe("The resource's ID."))
          .describe('A list of resource IDs.')
          .optional(),
      })
    )
    .describe(
      'A list of resources to query. If you use this query, you cannot also pass the `workspaceIds` query.'
    )
    .optional(),
  workspaceIds: z
    .array(z.string().describe('The workspace ID.'))
    .describe(
      'A list of workspaces IDs to query. If you use this query, you cannot also pass the `resources` query.'
    )
    .optional(),
  workspaceVisibilities: z
    .array(z.enum(['team', 'public']).describe('The type of visibility setting.'))
    .describe(
      'A list of workspace [visibility settings](https://learning.postman.com/docs/collaborating-in-postman/using-workspaces/managing-workspaces/#changing-workspace-visibility) to query. This currently supports the `team` and `public` settings.'
    )
    .optional(),
});
export const annotations = {
  title: 'Search detected secrets',
  readOnlyHint: false,
  openWorldHint: true,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    const endpoint = `/detected-secrets-queries`;
    const query = new URLSearchParams();
    if (args.limit !== undefined) query.set('limit', String(args.limit));
    if (args.cursor !== undefined) query.set('cursor', String(args.cursor));
    if (args.include !== undefined) query.set('include', String(args.include));
    if (args.since !== undefined) query.set('since', String(args.since));
    if (args.until !== undefined) query.set('until', String(args.until));
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.resolved !== undefined) bodyPayload.resolved = args.resolved;
    if (args.secretTypes !== undefined) bodyPayload.secretTypes = args.secretTypes;
    if (args.statuses !== undefined) bodyPayload.statuses = args.statuses;
    if (args.resources !== undefined) bodyPayload.resources = args.resources;
    if (args.workspaceIds !== undefined) bodyPayload.workspaceIds = args.workspaceIds;
    if (args.workspaceVisibilities !== undefined)
      bodyPayload.workspaceVisibilities = args.workspaceVisibilities;
    const options: any = {
      body: JSON.stringify(bodyPayload),
      contentType: ContentType.Json,
      headers: extra.headers,
    };
    const result = await extra.client.post(url, options);
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
