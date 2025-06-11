import { z } from 'zod';
import { fetchPostmanAPI, ContentType } from '../clients/postman.js';

export const method = 'update-workspace-tags';
export const description =
  "Updates a workspace's associated tags. This endpoint replaces all existing tags with those you pass in the request body.";
export const parameters = z.object({
  workspaceId: z.string().describe("The workspace's ID."),
  tags: z
    .array(
      z
        .object({
          slug: z
            .string()
            .regex(new RegExp('^[a-z][a-z0-9-]*[a-z0-9]+$'))
            .min(2)
            .max(64)
            .describe("The tag's ID within a team or individual (non-team) user scope."),
        })
        .describe('Information about the tag.')
    )
    .min(0)
    .max(5)
    .describe('A list of the associated tags as slugs.'),
});
export const annotations = {
  title:
    "Updates a workspace's associated tags. This endpoint replaces all existing tags with those you pass in the request body.",
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/workspaces/${params.workspaceId}/tags`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (params.tags !== undefined) bodyPayload.tags = params.tags;
    const result = await fetchPostmanAPI(url, {
      method: 'PUT',
      body: JSON.stringify(bodyPayload),
      contentType: ContentType.Json,
      apiKey: extra.apiKey,
    });
    return {
      content: [
        {
          type: 'text',
          text: `${typeof result === 'string' ? result : JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  } catch (e: any) {
    return {
      content: [{ type: 'text', text: `Failed: ${e.message}` }],
    };
  }
}
