import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'createRulesetAssignment';
export const title = 'Assign a ruleset to a governance group';
export const description =
  "Assigns a ruleset to a governance group so its rules apply to every workspace in that\ngroup. Set \\`targetType\\` to \\`governance_group\\` and \\`targetId\\` to the group's ID from\ngetAllGovernanceGroups. This is the only way to apply a ruleset; rulesets can't be\nassigned to a workspace directly.\n";
export const parameters = z.object({
  rulesetId: z.string().describe("The ruleset's ID."),
  targetType: z.literal('governance_group').describe('The assignment target type.'),
  targetId: z.string().describe("The target governance group's ID."),
});
export const annotations = {
  title: 'Assign a ruleset to a governance group',
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
    const endpoint = `/rulesets/${encodeURIComponent(String(args.rulesetId))}/assignments`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.targetType !== undefined) bodyPayload.targetType = args.targetType;
    if (args.targetId !== undefined) bodyPayload.targetId = args.targetId;
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
