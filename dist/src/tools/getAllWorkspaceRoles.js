import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getAllWorkspaceRoles';
export const title = 'Get all roles';
export const description = "Lists the workspace role types available to the team, which depend on the team's plan.\nCall this before updateWorkspaceRoles to learn which roles you are allowed to assign.\nThis returns the catalogue of possible roles, not anyone's actual assignments — use\ngetWorkspaceRoles for those.\n";
export const parameters = z.object({});
export const annotations = {
    title: 'Get all roles',
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/workspaces-roles`;
        const query = new URLSearchParams();
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
