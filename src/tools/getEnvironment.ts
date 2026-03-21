import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'getEnvironment';
export const description = 'Gets information about an environment.';
export const parameters = z.object({ environmentId: z.string().describe("The environment's ID.") });
export const annotations = {
  title: 'Gets information about an environment.',
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
 try {
    const endpoint = `/environments/${args.environmentId}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const options: any = {
      headers: extra.headers,
    };
    
    const result = await extra.client.get(url, options) as any;

    // --- SECURITY PATCH: Redact secret variables ---
    // if (result && typeof result === 'object' && result.environment && Array.isArray(result.environment.values)) {
    //   result.environment.values = result.environment.values.map((v: any) => {
    //     if (v.type === 'secret') {
    //       return { 
    //         ...v, 
    //         value: '***REDACTED BY MCP SERVER***', 
    //         // Postman sometimes returns initial_value depending on API version
    //         ...(v.initial_value ? { initial_value: '***REDACTED BY MCP SERVER***' } : {}) 
    //       };
    //     }
    //     return v;
    //   });
    // }

    if (result?.environment?.values && Array.isArray(result.environment.values)) {
      result.environment.values = result.environment.values.map((v: any) => {
        if (v.type === 'secret') {
          const redacted = '***REDACTED BY MCP SERVER***';
          return { 
            ...v, 
            value: redacted,
            // Ensure both common Postman API variants are caught and overwritten
            ...(v.initial_value !== undefined ? { initial_value: redacted } : {}),
            ...(v.initialValue !== undefined ? { initialValue: redacted } : {})
          };
        }
        return v;
      });
    } 

    return {
      content: [
        {
          type: 'text',
          text: `${typeof result === 'string' ? result : JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }catch (e: unknown) {
    if (e instanceof McpError) {
      throw e;
    }
    throw asMcpError(e);
  }
}
