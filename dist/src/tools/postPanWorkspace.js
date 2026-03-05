import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'postPanWorkspace';
export const description = "Publishes a workspace in your team's [Private API Network](https://learning.postman.com/docs/collaborating-in-postman/adding-private-network/).";
export const parameters = z.object({
    workspace: z.object({
        id: z.string().describe("The workspace's ID."),
        parentFolderId: z.number().int().describe('The `0` value.').default(0),
    }),
});
export const annotations = {
    title: "Publishes a workspace in your team's [Private API Network](https://learning.postman.com/docs/collaborating-in-postman/adding-private-network/).",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/network/private`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.workspace !== undefined)
            bodyPayload.workspace = args.workspace;
        const options = {
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
    }
    catch (e) {
        if (e instanceof McpError) {
            throw e;
        }
        throw asMcpError(e);
    }
}
