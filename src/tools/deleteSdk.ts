import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'deleteSdk';
export const title = 'Delete an SDK';
export const description =
  'Deletes an SDK record and the stored archive behind it. Returns 204 with no body on\nsuccess. Anyone still holding a download URL loses access to the artifact.\nThis cannot cancel a generation job that is still running — a job in progress has to\nfinish first. Only call this on an explicit instruction naming the SDK. Requires a\nPostman Team or Enterprise plan.\n';
export const parameters = z.object({ sdkId: z.string().describe("The SDK's ID.") });
export const annotations = {
  title: 'Delete an SDK',
  readOnlyHint: false,
  openWorldHint: true,
  destructiveHint: true,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    const endpoint = `/sdks/${encodeURIComponent(String(args.sdkId))}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const options: any = {
      headers: extra.headers,
    };
    const result = await extra.client.delete(url, options);
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
