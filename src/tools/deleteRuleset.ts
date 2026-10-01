import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'deleteRuleset';
export const title = 'Delete a ruleset';
export const description =
  "Permanently deletes a custom ruleset, which stops its rules from applying to every\ngovernance group it was assigned to. To stop applying it to one group only, use\ndeleteRulesetAssignment instead. Postman-managed rulesets (\\`type: system\\`) can't be\ndeleted and return 403.\n";
export const parameters = z.object({ rulesetId: z.string().describe("The ruleset's ID.") });
export const annotations = {
  title: 'Delete a ruleset',
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
    const endpoint = `/rulesets/${encodeURIComponent(String(args.rulesetId))}`;
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
