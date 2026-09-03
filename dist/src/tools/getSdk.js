import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getSdk';
export const title = 'Get an SDK';
export const description = 'Gets one SDK, including the \\`buildStatus\\` of its generation job. This is the tool to\npoll after createSdk: \\`succeeded\\` means the archive is ready for getSdkDownloadUrl,\nand a failure status is reported here rather than by the original call.\nRequires a Postman Team or Enterprise plan.\n';
export const parameters = z.object({ sdkId: z.string().describe("The SDK's ID.") });
export const annotations = {
    title: 'Get an SDK',
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/sdks/${encodeURIComponent(String(args.sdkId))}`;
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
