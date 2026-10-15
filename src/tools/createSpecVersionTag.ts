import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'createSpecVersionTag';
export const title = 'Create a version tag';
export const description =
  "Tags the specification's current state as a new version snapshot under the \\`name\\` you\nsupply. Use this to mark a release or a reviewed state before making further edits.\nA tag attaches to the specification's current changelog group, so tagging twice without\nany intervening change conflicts with a 409 — edit the specification first to open a new\nchangelog group, then tag again.\nDo not use this tool to save specification content; use updateSpecFile for that and tag\nafterwards.\n";
export const parameters = z.object({
  specId: z.string().describe("The spec's ID."),
  name: z.string().describe("The version tag's name."),
});
export const annotations = {
  title: 'Create a version tag',
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
    const endpoint = `/specs/${encodeURIComponent(String(args.specId))}/version-tags`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.name !== undefined) bodyPayload.name = args.name;
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
