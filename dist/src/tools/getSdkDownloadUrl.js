import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getSdkDownloadUrl';
export const title = "Get an SDK's download URL";
export const description = "Gets a short-lived signed URL for a generated SDK's zip archive. The response carries a\nURL, not the archive — the API deliberately does not stream file contents — and the URL\nexpires within a few minutes, so fetch it at the moment you intend to download and do\nnot store or pass it around.\nOnly works once the SDK's \\`buildStatus\\` is \\`succeeded\\`; check with getSdk first, since\nasking too early returns 409. Requires a Postman Team or Enterprise plan.\n";
export const parameters = z.object({ sdkId: z.string().describe("The SDK's ID.") });
export const annotations = {
    title: "Get an SDK's download URL",
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/sdks/${encodeURIComponent(String(args.sdkId))}/downloads`;
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
