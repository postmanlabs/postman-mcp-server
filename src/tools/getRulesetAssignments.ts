import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'getRulesetAssignments';
export const title = "Get a ruleset's governance group assignments";
export const description =
  "Lists the governance groups a ruleset is assigned to. Each assignment's \\`targetId\\` is\na governance group ID. To go the other way, from a group to its rulesets, use\ngetGovernanceGroupAssignments.\n";
export const parameters = z.object({ rulesetId: z.string().describe("The ruleset's ID.") });
export const annotations = {
  title: "Get a ruleset's governance group assignments",
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
    const endpoint = `/rulesets/${encodeURIComponent(String(args.rulesetId))}/assignments`;
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
