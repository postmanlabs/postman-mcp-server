import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

function asMcpError(error: unknown): McpError {
  const cause = (error as any)?.cause ?? String(error);
  return new McpError(ErrorCode.InternalError, cause);
}

export const method = 'getAuthenticatedUser';
export const description =
  'Gets information about the authenticated user.\n\n**Note:**\n\n- This API returns a different response for users with the [Guest and Partner roles](https://learning.postman.com/docs/collaborating-in-postman/roles-and-permissions/#team-roles).\n- The \\`flow_count\\` response only returns for users on [Free plans](https://www.postman.com/pricing/).\n';
export const parameters = z.object({});
export const annotations = {
  title:
    'Gets information about the authenticated user.\n\n**Note:**\n\n- This API returns a different response for users with the [Guest and Partner roles](https://learning.postman.com/docs/collaborating-in-postman/roles-and-permissions/#team-roles).\n- The \\`flow_count\\` response only returns for users on [Free plans](https://www.postman.com/pricing/).\n',
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/me`;
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
