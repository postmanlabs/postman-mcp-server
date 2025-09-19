import { z } from 'zod';
import { McpError, ErrorCode, } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'getWorkspace';
export const description = "Gets information about a workspace.\n\n**Note:**\n\nThis endpoint's response contains the \\`visibility\\` field. [Visibility](https://learning.postman.com/docs/collaborating-in-postman/using-workspaces/managing-workspaces/#changing-workspace-visibility) determines who can access the workspace:\n- \\`personal\\` — Only you can access the workspace.\n- \\`team\\` — All team members can access the workspace.\n- \\`private\\` — Only invited team members can access the workspace ([**Professional** and **Enterprise** plans only](https://www.postman.com/pricing)).\n- \\`public\\` — Everyone can access the workspace.\n- \\`partner\\` — Only invited team members and [partners](https://learning.postman.com/docs/collaborating-in-postman/using-workspaces/partner-workspaces/) can access the workspace ([**Professional** and **Enterprise** plans only](https://www.postman.com/pricing)).\n\n### Important\n\nWe have deprecated the \\`name\\` and \\`uid\\` responses in the following array of objects:\n- \\`collections\\`\n- \\`environments\\`\n- \\`mocks\\`\n- \\`monitors\\`\n- \\`apis\\`\n";
export const parameters = z.object({
    workspaceId: z.string().describe("The workspace's ID."),
    include: z
        .enum(['mocks:deactivated', 'scim'])
        .describe("Include the following information in the endpoint's response:\n- `mocks:deactivated` — Include all deactivated mock servers in the response.\n- `scim` — Return the SCIM user IDs of the workspace creator and who last modified it.\n")
        .optional(),
});
export const annotations = {
    title: "Gets information about a workspace.\n\n**Note:**\n\nThis endpoint's response contains the \\`visibility\\` field. [Visibility](https://learning.postman.com/docs/collaborating-in-postman/using-workspaces/managing-workspaces/#changing-workspace-visibility) determines who can access the workspace:\n- \\`personal\\` — Only you can access the workspace.\n- \\`team\\` — All team members can access the workspace.\n- \\`private\\` — Only invited team members can access the workspace ([**Professional** and **Enterprise** plans only](https://www.postman.com/pricing)).\n- \\`public\\` — Everyone can access the workspace.\n- \\`partner\\` — Only invited team members and [partners](https://learning.postman.com/docs/collaborating-in-postman/using-workspaces/partner-workspaces/) can access the workspace ([**Professional** and **Enterprise** plans only](https://www.postman.com/pricing)).\n\n### Important\n\nWe have deprecated the \\`name\\` and \\`uid\\` responses in the following array of objects:\n- \\`collections\\`\n- \\`environments\\`\n- \\`mocks\\`\n- \\`monitors\\`\n- \\`apis\\`\n",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/workspaces/${args.workspaceId}`;
        const query = new URLSearchParams();
        if (args.include !== undefined)
            query.set('include', String(args.include));
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const options = {
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
    }
    catch (e) {
        if (e instanceof McpError) {
            throw e;
        }
        throw asMcpError(e);
    }
}
