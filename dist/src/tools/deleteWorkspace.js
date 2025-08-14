import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'deleteWorkspace';
export const description = 'Deletes an existing workspace.\n\n### Important\n\nIf you delete a workspace that has a linked collection or environment with another workspace, this will delete the collection and environment in all workspaces.\n';
export const parameters = z.object({ workspaceId: z.string().describe("The workspace's ID.") });
export const annotations = {
    title: 'Deletes an existing workspace.\n\n### Important\n\nIf you delete a workspace that has a linked collection or environment with another workspace, this will delete the collection and environment in all workspaces.\n',
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
};
export async function handler(params, extra) {
    try {
        const endpoint = `/workspaces/${params.workspaceId}`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const result = await fetchPostmanAPI(url, {
            method: 'DELETE',
            apiKey: extra.apiKey,
            headers: extra.headers,
        });
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
