import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'getSpecVersionTag';
export const title = 'Get a version tag';
export const description =
  "Gets one version tag and the specification files captured in that snapshot, letting you\nread a specification as it stood when the tag was created. Use getSpecVersionTags first\nto find the tag ID.\nDo not use this tool to read the specification's current content; use getSpecFiles or\ngetSpecDefinition instead.\n";
export const parameters = z.object({
  specId: z.string().describe("The spec's ID."),
  tagId: z.string().describe("The version tag's ID."),
});
export const annotations = {
  title: 'Get a version tag',
  readOnlyHint: true,
  openWorldHint: false,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    const endpoint = `/specs/${encodeURIComponent(String(args.specId))}/version-tags/${encodeURIComponent(String(args.tagId))}/files`;
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
