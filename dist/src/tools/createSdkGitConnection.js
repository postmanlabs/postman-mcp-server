import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'createSdkGitConnection';
export const title = 'Connect a Git repository to an SDK';
export const description = 'Connects a collection or specification to a Git repository for one SDK language, so\ngenerated SDK updates can be delivered there as pull requests. The connection starts\n\\`active\\`.\nEach source and language pair supports exactly one connection — creating a second\nreturns 409, and the way to change an existing one is updateSdkGitConnection, not a\nrepeat call here. \\`autoUpdatePullRequestsEnabled\\` is Enterprise-only and is forced to\nfalse on Team plans. Requires a Postman Team or Enterprise plan.\n';
export const parameters = z.object({
    source: z
        .object({
        type: z.enum(['collection', 'spec']).describe('The type of Postman element.'),
        id: z.string().describe('The ID of the Postman Collection or specification in Postman.'),
    })
        .describe('The collection or specification that the SDK is generated from.'),
    language: z
        .enum(['typescript', 'python', 'go', 'java', 'csharp', 'ruby', 'php', 'kotlin', 'rust', 'cli'])
        .describe('The target output language for the generated SDK.'),
    repositoryUrl: z.string().url().describe('The canonical URL of the target Git repository.'),
    targetBranch: z
        .string()
        .describe('The branch the SDK is published to. Defaults to `main`.')
        .default('main'),
    autoUpdatePullRequestsEnabled: z
        .boolean()
        .describe("If true, pull requests are opened automatically whenever the source changes or a new version of the SDK generator is released. If false, pull requests are opened automatically, but only for manually-triggered SDK regeneration. If `autoUpdatePullRequestsEnabled` isn't set, the default behavior depends on the user's Postman plan:\n\n- **Enterprise** plan users — Defaults to the `true` value.\n- **Team** plan users and read only — Defaults to the `false` value.\n")
        .optional(),
});
export const annotations = {
    title: 'Connect a Git repository to an SDK',
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: false,
    idempotentHint: false,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/sdk-git-connections`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.source !== undefined)
            bodyPayload.source = args.source;
        if (args.language !== undefined)
            bodyPayload.language = args.language;
        if (args.repositoryUrl !== undefined)
            bodyPayload.repositoryUrl = args.repositoryUrl;
        if (args.targetBranch !== undefined)
            bodyPayload.targetBranch = args.targetBranch;
        if (args.autoUpdatePullRequestsEnabled !== undefined)
            bodyPayload.autoUpdatePullRequestsEnabled = args.autoUpdatePullRequestsEnabled;
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
