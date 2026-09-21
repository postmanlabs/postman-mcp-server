import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getComponentVersions';
export const title = 'Get all component versions';
export const description = "Lists a component's published versions. Use this to discover version IDs and labels,\nor to check whether pending draft edits have been published yet. Pass\n\\`include=content\\` when you also need each version's content.\nDo not use this tool to read unpublished edits; use getComponentDraft instead.\nRequires a Postman Enterprise plan.\n";
export const parameters = z.object({
    componentId: z.string().describe("The component's ID."),
    include: z
        .string()
        .describe('A comma-separated list of additional fields to include. Accepts the `content` value.')
        .optional(),
});
export const annotations = {
    title: 'Get all component versions',
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/components/${encodeURIComponent(String(args.componentId))}/versions`;
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
