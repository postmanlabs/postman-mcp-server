import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'deletePackage';
export const title = 'Delete a package';
export const description =
  'Deletes a package and its associated index script content.\nThis operation returns no content and also succeeds when the package no longer exists.\nDo not use this tool to clear or replace script content while retaining the package;\nuse updatePackage instead.\n';
export const parameters = z.object({ packageId: z.string().describe("The package's ID.") });
export const annotations = {
  title: 'Delete a package',
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
    const endpoint = `/packages/${encodeURIComponent(String(args.packageId))}`;
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
