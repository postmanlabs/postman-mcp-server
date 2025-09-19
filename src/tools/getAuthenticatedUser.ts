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

export const method = 'getAuthenticatedUser';
export const description =
  'Gets information about the authenticated user.\n- This endpoint provides “current user” context (\\`user.id\\`, \\`username\\`, \\`teamId\\`, roles).\n- When a user asks for “my …” (e.g., “my workspaces, my information, etc.”), call this first to resolve the user ID.\n';
export const parameters = z.object({});
export const annotations = {
  title:
    'Gets information about the authenticated user.\n- This endpoint provides “current user” context (\\`user.id\\`, \\`username\\`, \\`teamId\\`, roles).\n- When a user asks for “my …” (e.g., “my workspaces, my information, etc.”), call this first to resolve the user ID.\n',
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders }
): Promise<CallToolResult> {
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
