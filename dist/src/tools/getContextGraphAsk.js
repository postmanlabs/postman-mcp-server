import { z } from 'zod';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'getContextGraphAsk';
export const title = 'Get a Context Graph ask';
export const description = "Gets a submitted Context Graph ask's status and, once it finishes, its result. Call\nthis after submitContextGraphAsk with the \\`askId\\` it returned, and poll while\n\\`status\\` is \\`pending\\` or \\`running\\` — leave a few seconds between polls rather than\ncalling in a tight loop.\n\\`result\\` is only present once \\`status\\` is \\`completed\\`; a \\`failed\\` ask carries a short\n\\`error\\` instead. When reporting a completed ask, treat \\`result.answer\\` as the prose\nsummary and \\`result.structured\\`, \\`result.citations\\`, and \\`result.provenance\\` as the\ngraph data it rests on — cite that evidence rather than presenting the answer on its\nown, and say so when \\`result.provenance.truncated\\` is \\`true\\`, since the ask hit its\ndeadline and the answer is partial.\n";
export const parameters = z.object({ askId: z.string().describe("The ask's ID.") });
export const annotations = {
    title: 'Get a Context Graph ask',
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/context-graph/asks/${encodeURIComponent(String(args.askId))}`;
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
