import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getComponentDraft';
export const title = 'Get a component draft';
export const description = "Gets a component's working draft — its latest unpublished content and format. The\ndraft is where edits live before they are published, so it may differ from the most\nrecently published version. Use this to read pending changes before publishing.\nDo not use this tool to read published content; use getComponentVersion instead.\nRequires a Postman Enterprise plan.\n";
export const parameters = z.object({ componentId: z.string().describe("The component's ID.") });
export const annotations = {
    title: 'Get a component draft',
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/components/${encodeURIComponent(String(args.componentId))}/drafts`;
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
