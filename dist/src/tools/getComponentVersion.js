import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getComponentVersion';
export const title = 'Get a component version';
export const description = 'Gets a single published version of a component by version ID. Pass \\`include=content\\`\nto return the published content itself. Use getComponentVersions first when you need\nto discover a version ID.\nDo not use this tool to read the working draft; use getComponentDraft instead.\nRequires a Postman Enterprise plan.\n';
export const parameters = z.object({
    componentId: z.string().describe("The component's ID."),
    versionId: z.string().describe("The component version's ID."),
    include: z
        .string()
        .describe('A comma-separated list of additional fields to include. Accepts the `content` value.')
        .optional(),
});
export const annotations = {
    title: 'Get a component version',
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/components/${encodeURIComponent(String(args.componentId))}/versions/${encodeURIComponent(String(args.versionId))}`;
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
