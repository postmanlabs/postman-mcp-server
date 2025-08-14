import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';
import { IsomorphicHeaders, McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

function asMcpError(error: unknown): McpError {
  const cause = (error as any)?.cause ?? String(error);
  return new McpError(ErrorCode.InternalError, cause);
}

export const method = 'getMocks';
export const description =
  'Gets all active mock servers. By default, this endpoint returns only mock servers you created across all workspaces.\n\n**Note:**\n\nIf you pass both the \\`teamId\\` and \\`workspace\\` query parameters, this endpoint only accepts the \\`workspace\\` query.\n';
export const parameters = z.object({
  teamId: z.string().describe('Return only results that belong to the given team ID.').optional(),
  workspace: z.string().describe('Return only results found in the given workspace ID.').optional(),
});
export const annotations = {
  title:
    'Gets all active mock servers. By default, this endpoint returns only mock servers you created across all workspaces.\n\n**Note:**\n\nIf you pass both the \\`teamId\\` and \\`workspace\\` query parameters, this endpoint only accepts the \\`workspace\\` query.\n',
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string; headers?: IsomorphicHeaders }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/mocks`;
    const query = new URLSearchParams();
    if (params.teamId !== undefined) query.set('teamId', String(params.teamId));
    if (params.workspace !== undefined) query.set('workspace', String(params.workspace));
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const result = await fetchPostmanAPI(url, {
      method: 'GET',
      apiKey: extra.apiKey,
      headers: extra.headers,
    });
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
