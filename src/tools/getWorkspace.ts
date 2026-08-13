import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'getWorkspace';
export const title = 'Get a workspace';
export const description =
  "Gets information about a workspace.\n\n**Note:**\n\nThis endpoint's response contains the \\`visibility\\` field. [Visibility](https://learning.postman.com/docs/collaborating-in-postman/using-workspaces/managing-workspaces/#changing-workspace-visibility) determines who can access the workspace:\n- \\`personal\\` — Only you can access the workspace.\n- \\`team\\` — All team members can access the workspace.\n- \\`private\\` — Only invited team members can access the workspace ([**Team** and **Enterprise** plans only](https://www.postman.com/pricing)).\n- \\`public\\` — Everyone can access the workspace.\n- \\`partner\\` — Only invited team members and [partners](https://learning.postman.com/docs/collaborating-in-postman/using-workspaces/partner-workspaces/) can access the workspace ([**Team** and **Enterprise** plans only](https://www.postman.com/pricing)).\n";
export const parameters = z.object({
  workspaceId: z.string().describe("The workspace's ID."),
  include: z
    .string()
    .regex(
      new RegExp(
        '^(?!.*(?:^|,)(team|scim|mocks:deactivated),(?:.*,)?\\1(?:$|,))(team|scim|mocks:deactivated)(,(team|scim|mocks:deactivated))*$'
      )
    )
    .describe(
      "A comma-separated list of values to include in the endpoint's response:\n- `scim` — Return the SCIM user IDs of the workspace creator and who last modified it.\n- `team` — Return the workspace's team ID. Returns a null value if the workspace isn't associated with a team.\n- `mocks:deactivated` — Include all deactivated mock servers in the response.\n"
    )
    .optional(),
});
export const annotations = {
  title: 'Get a workspace',
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
    const endpoint = `/workspaces/${encodeURIComponent(String(args.workspaceId))}`;
    const query = new URLSearchParams();
    if (args.include !== undefined) query.set('include', String(args.include));
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
