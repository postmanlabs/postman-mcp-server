import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'updateDetectedSecretResolutions';
export const title = 'Update detected secret resolution status';
export const description =
  "Records how a detected secret was dealt with, in one workspace. Requires \\`workspaceId\\`\nand a \\`resolution\\` of \\`FALSE_POSITIVE\\` (not really a secret), \\`REVOKED\\` (was real, key\nhas been rotated), or \\`ACCEPTED_RISK\\` (real, exposure accepted).\nThis only records a judgement — it does not revoke a credential, remove the secret from\nthe collection, or make the exposure safe. Never mark something \\`REVOKED\\` unless the\nkey has actually been rotated, and never mark it \\`ACCEPTED_RISK\\` on a person's behalf:\nboth are decisions a human owner has to make. Requires a Postman Enterprise plan.\n";
export const parameters = z.object({
  secretId: z.string().describe("The secret's ID."),
  resolution: z
    .preprocess(
      (v) => (typeof v === 'string' ? v.toUpperCase() : v),
      z.enum(['FALSE_POSITIVE', 'ACCEPTED_RISK', 'REVOKED', 'ACTIVE'])
    )
    .describe(
      "The secret's resolution status:\n- `ACTIVE` — The secret is active.\n- `FALSE_POSITIVE` — The discovered secret is not an actual secret.\n- `REVOKED` — The secret is valid, but the user rotated their key to resolve the issue.\n- `ACCEPTED_RISK` — The Secret Scanner found the secret, but user accepts the risk of publishing it.\n"
    ),
  workspaceId: z.string().describe('The ID of the workspace that contains the secret.'),
});
export const annotations = {
  title: 'Update detected secret resolution status',
  readOnlyHint: false,
  openWorldHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    const endpoint = `/detected-secrets/${encodeURIComponent(String(args.secretId))}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.resolution !== undefined) bodyPayload.resolution = args.resolution;
    if (args.workspaceId !== undefined) bodyPayload.workspaceId = args.workspaceId;
    const options: any = {
      body: JSON.stringify(bodyPayload),
      contentType: ContentType.Json,
      headers: extra.headers,
    };
    const result = await extra.client.put(url, options);
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
