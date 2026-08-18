import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getPackage';
export const title = 'Get a package';
export const description = "Gets an active package's metadata and current index script content by package ID.\nUse getPackages first when you need to discover a package ID.\nDo not use this tool to list packages or discover package IDs; use getPackages instead.\n";
export const parameters = z.object({ packageId: z.string().describe("The package's ID.") });
export const annotations = {
    title: 'Get a package',
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/packages/${encodeURIComponent(String(args.packageId))}`;
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
