import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'getEnvironments';
export const description =
  'Gets information about all of your [environments](https://learning.postman.com/docs/sending-requests/managing-environments/).';
export const parameters = z.object({
  workspace: z.string().describe("The workspace's ID.").optional(),
});
export const annotations = {
  title:
    'Gets information about all of your [environments](https://learning.postman.com/docs/sending-requests/managing-environments/).',
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    const endpoint = `/environments`;
    const query = new URLSearchParams();
    if (args.workspace !== undefined) query.set('workspace', String(args.workspace));
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const options: any = {
      headers: extra.headers,
    };
    
    const result = await extra.client.get(url, options) as any;

    // --- SECURITY PATCH: Redact secrets if present in list view ---
    if (result?.environments && Array.isArray(result.environments)) {
      result.environments.forEach((env: any) => {
        if (env.values && Array.isArray(env.values)) {
          env.values = env.values.map((v: any) => {
            if (v.type === 'secret') {
              const redacted = '***REDACTED BY MCP SERVER***';
              return { 
                ...v, 
                value: redacted,
                ...(v.initial_value !== undefined ? { initial_value: redacted } : {}),
                ...(v.initialValue !== undefined ? { initialValue: redacted } : {})
              };
            }
            return v;
          });
        }
      });
    }
    // -------------------------------------------------------------

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