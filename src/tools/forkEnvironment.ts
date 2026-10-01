import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'forkEnvironment';
export const title = 'Fork an environment';
export const description =
  'Forks an environment into a workspace, giving that workspace an editable copy that\nstays linked to the original. Requires the destination \\`workspaceId\\` as a query\nparameter and a \\`forkName\\` label in the body. Use this when a team needs to change\nvariable values without touching a shared environment.\nDo not use this tool to copy an environment into a workspace with no ongoing link;\ncreate a new environment with createEnvironment and set its values instead.\n';
export const parameters = z.object({
  environmentId: z.string().describe("The environment's unique ID."),
  workspaceId: z.string().describe("The workspace's ID."),
  forkName: z.string().describe("The forked environment's label."),
});
export const annotations = {
  title: 'Fork an environment',
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
    const endpoint = `/environments/${encodeURIComponent(String(args.environmentId))}/forks`;
    const query = new URLSearchParams();
    if (args.workspaceId !== undefined) query.set('workspaceId', String(args.workspaceId));
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.forkName !== undefined) bodyPayload.forkName = args.forkName;
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
