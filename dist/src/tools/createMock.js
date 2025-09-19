import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { McpError, ErrorCode, } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'createMock';
export const description = 'Creates a mock server in a collection.\n\n- Pass the collection UID (ownerId-collectionId), not the bare collection ID.\n- If you only have a \\`collectionId\\`, resolve the UID first:\n  1) Prefer GET \\`/collections/{collectionId}\\` and read \\`uid\\`, or\n  2) Construct \\`{ownerId}-{collectionId}\\` using ownerId from GET \\`/me\\`:\n    - For team-owned collections: \\`ownerId = me.teamId\\`\n    - For personal collections: \\`ownerId = me.user.id\\`\n- Use the \\`workspace\\` query to place the mock in a specific workspace. Prefer explicit workspace scoping.\n';
export const parameters = z.object({
    workspace: z.string().describe("The workspace's ID."),
    mock: z
        .object({
        collection: z.string().describe("The unique ID of the mock's associated collection."),
        environment: z
            .string()
            .describe("The unique ID of the mock's associated environment.")
            .optional(),
        name: z.string().describe("The mock server's name.").optional(),
        private: z
            .boolean()
            .describe('If true, the mock server is set private. By default, mock servers are public and can receive requests from anyone and anywhere.')
            .default(false),
    })
        .optional(),
});
export const annotations = {
    title: 'Creates a mock server in a collection.\n\n- Pass the collection UID (ownerId-collectionId), not the bare collection ID.\n- If you only have a \\`collectionId\\`, resolve the UID first:\n  1) Prefer GET \\`/collections/{collectionId}\\` and read \\`uid\\`, or\n  2) Construct \\`{ownerId}-{collectionId}\\` using ownerId from GET \\`/me\\`:\n    - For team-owned collections: \\`ownerId = me.teamId\\`\n    - For personal collections: \\`ownerId = me.user.id\\`\n- Use the \\`workspace\\` query to place the mock in a specific workspace. Prefer explicit workspace scoping.\n',
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/mocks`;
        const query = new URLSearchParams();
        if (args.workspace !== undefined)
            query.set('workspace', String(args.workspace));
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.mock !== undefined)
            bodyPayload.mock = args.mock;
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
