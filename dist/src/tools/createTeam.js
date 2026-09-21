import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'createTeam';
export const title = 'Create a team';
export const description = 'Creates a new Postman team in the organization. \\`name\\` accepts only alphanumeric\ncharacters and spaces.\nThis creates a billable organizational unit and is not something to do speculatively —\nonly call it on an explicit, specific instruction to create a team, never to satisfy a\nvaguer request such as organizing or setting up a workspace. Use createWorkspace for\nthat instead.\n';
export const parameters = z.object({
    identifierType: z
        .string()
        .describe('Use SCIM user and group IDs instead of Postman user IDs.')
        .optional(),
    name: z
        .string()
        .describe("The team's name. Accepts only alphanumeric characters and spaces.")
        .optional(),
    description: z.string().nullable().describe("The team's description.").optional(),
});
export const annotations = {
    title: 'Create a team',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: false,
    idempotentHint: false,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/teams`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.name !== undefined)
            bodyPayload.name = args.name;
        if (args.description !== undefined)
            bodyPayload.description = args.description;
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
