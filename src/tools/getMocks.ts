import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import {
  IsomorphicHeaders,
  McpError,
  ErrorCode,
  CallToolResult,
} from '@modelcontextprotocol/sdk/types.js';

function asMcpError(error: unknown): McpError {
  const cause = (error as any)?.cause ?? String(error);
  return new McpError(ErrorCode.InternalError, cause);
}

export const method = 'getMocks';
export const description =
  'Gets all active mock servers. By default, returns only mock servers you created across all workspaces.\n\n- Always pass either the \\`workspace\\` or \\`teamId\\` query to scope results. Prefer \\`workspace\\` when known.\n- If you need team-scoped results, set \\`teamId\\` from the current user: call GET \\`/me\\` and use \\`me.teamId\\`.\n- If both \\`teamId\\` and \\`workspace\\` are passed, only \\`workspace\\` is used.\n';
export const parameters = z.object({
  teamId: z
    .string()
    .describe(
      'Return only results that belong to the given team ID.\n- For team-scoped requests, set this from GET `/me` (`me.teamId`).\n'
    )
    .optional(),
  workspace: z
    .string()
    .describe(
      'Return only results found in the given workspace ID.\n- Prefer this parameter when the user mentions a specific workspace.\n'
    )
    .optional(),
});
export const annotations = {
  title:
    'Gets all active mock servers. By default, returns only mock servers you created across all workspaces.\n\n- Always pass either the \\`workspace\\` or \\`teamId\\` query to scope results. Prefer \\`workspace\\` when known.\n- If you need team-scoped results, set \\`teamId\\` from the current user: call GET \\`/me\\` and use \\`me.teamId\\`.\n- If both \\`teamId\\` and \\`workspace\\` are passed, only \\`workspace\\` is used.\n',
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders }
): Promise<CallToolResult> {
  try {
    const endpoint = `/mocks`;
    const query = new URLSearchParams();
    if (args.teamId !== undefined) query.set('teamId', String(args.teamId));
    if (args.workspace !== undefined) query.set('workspace', String(args.workspace));
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
