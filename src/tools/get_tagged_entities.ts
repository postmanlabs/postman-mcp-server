import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';

export const method = 'get-tagged-entities';
export const description =
  'Gets Postman elements (entities) by a given tag. Tags enable you to organize and search [workspaces](https://learning.postman.com/docs/collaborating-in-postman/using-workspaces/managing-workspaces/#tagging-a-workspace), [APIs](https://learning.postman.com/docs/designing-and-developing-your-api/managing-apis/#tagging-apis), and [collections](https://learning.postman.com/docs/collections/using-collections/#tagging-a-collection) that contain shared tags.\n\n**Note:**\n\nTagging is available on Postman [**Enterprise** plans](https://www.postman.com/pricing/).\n';
export const parameters = z.object({
  slug: z
    .string()
    .regex(new RegExp('^[a-z][a-z0-9-]*[a-z0-9]+$'))
    .min(2)
    .max(64)
    .describe("The tag's ID within a team or individual (non-team) user scope."),
  limit: z
    .number()
    .int()
    .lte(50)
    .describe('The maximum number of tagged elements to return in a single call.')
    .default(10),
  direction: z
    .enum(['asc', 'desc'])
    .describe(
      "The ascending (`asc`) or descending (`desc`) order to sort the results by, based on the time of the entity's tagging."
    )
    .default('desc'),
  cursor: z
    .string()
    .describe(
      'The cursor to get the next set of results in the paginated response. If you pass an invalid value, the API only returns the first set of results.'
    )
    .optional(),
  entityType: z
    .enum(['api', 'collection', 'workspace'])
    .describe('Filter results for the given entity type.')
    .optional(),
});
export const annotations = {
  title:
    'Gets Postman elements (entities) by a given tag. Tags enable you to organize and search [workspaces](https://learning.postman.com/docs/collaborating-in-postman/using-workspaces/managing-workspaces/#tagging-a-workspace), [APIs](https://learning.postman.com/docs/designing-and-developing-your-api/managing-apis/#tagging-apis), and [collections](https://learning.postman.com/docs/collections/using-collections/#tagging-a-collection) that contain shared tags.\n\n**Note:**\n\nTagging is available on Postman [**Enterprise** plans](https://www.postman.com/pricing/).\n',
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/tags/${params.slug}/entities`;
    const query = new URLSearchParams();
    if (params.limit !== undefined) query.set('limit', String(params.limit));
    if (params.direction !== undefined) query.set('direction', String(params.direction));
    if (params.cursor !== undefined) query.set('cursor', String(params.cursor));
    if (params.entityType !== undefined) query.set('entityType', String(params.entityType));
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const result = await fetchPostmanAPI(url, {
      method: 'GET',
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
