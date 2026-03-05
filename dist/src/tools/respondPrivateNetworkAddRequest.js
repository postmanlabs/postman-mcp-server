import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'respondPrivateNetworkAddRequest';
export const description = "Responds to a user's request to add a workspace to your team's Private API Network. Only managers can approve or deny a request. Once approved, the workspace will appear in the team's Private API Network.\n\nWARNING: This tool is for Private API Network management, not for general workspace operations. For workspace management use: getWorkspaces, getWorkspace, createWorkspace, updateWorkspace, deleteWorkspace.\n";
export const parameters = z.object({
    requestId: z.number().int().describe("The request's ID."),
    status: z.enum(['denied', 'approved']).describe("The request's approval status."),
    response: z
        .object({
        message: z
            .string()
            .describe("A message that details why the user's request was denied.")
            .optional(),
    })
        .describe("If the request is denied, the response to the user's request.")
        .optional(),
});
export const annotations = {
    title: "Responds to a user's request to add a workspace to your team's Private API Network. Only managers can approve or deny a request. Once approved, the workspace will appear in the team's Private API Network.",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/network/private/network-entity/request/${args.requestId}`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.status !== undefined)
            bodyPayload.status = args.status;
        if (args.response !== undefined)
            bodyPayload.response = args.response;
        const options = {
            body: JSON.stringify(bodyPayload),
            contentType: ContentType.Json,
            headers: extra.headers,
        };
        const result = await extra.client.put(url, options);
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
