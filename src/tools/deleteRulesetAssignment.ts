import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'deleteRulesetAssignment';
export const title = 'Unassign a ruleset from a governance group';
export const description =
  "Unassigns a ruleset from one governance group, so its rules stop applying to that\ngroup's workspaces. Pass \\`targetType=governance_group\\` and the group's ID as\n\\`targetId\\`. The ruleset and the group both remain.\n";
export const parameters = z.object({
  rulesetId: z.string().describe("The ruleset's ID."),
  targetType: z
    .literal('governance_group')
    .describe('The assignment target type. Currently only `governance_group` is supported.'),
  targetId: z.string().describe("The target governance group's ID."),
});
export const annotations = {
  title: 'Unassign a ruleset from a governance group',
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
    const endpoint = `/rulesets/${encodeURIComponent(String(args.rulesetId))}/assignments`;
    const query = new URLSearchParams();
    if (args.targetType !== undefined) query.set('targetType', String(args.targetType));
    if (args.targetId !== undefined) query.set('targetId', String(args.targetId));
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
