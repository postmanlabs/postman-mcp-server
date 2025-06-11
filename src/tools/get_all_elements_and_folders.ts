import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';

export const method = 'get-all-elements-and-folders';
export const description =
  "Gets information about the folders and their elements added to your team's [Private API Network](https://learning.postman.com/docs/collaborating-in-postman/adding-private-network/).\n\n**Note:**\n\nThe \\`limit\\` and \\`offset\\` parameters are separately applied to elements and folders. For example, if you query a \\`limit\\` value of \\`10\\` and an \\`offset\\` value \\`0\\`, the endpoint returns 10 elements and 10 folders for a total of 20 items. The \\`totalCount\\` property in the \\`meta\\` response is the total count of both elements and folders.\n";
export const parameters = z.object({
  since: z
    .string()
    .datetime({ offset: true })
    .describe(
      'Return only results created since the given time, in [ISO 8601](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6) format. This value cannot be later than the `until` value.'
    )
    .optional(),
  until: z
    .string()
    .datetime({ offset: true })
    .describe(
      'Return only results created until this given time, in [ISO 8601](https://datatracker.ietf.org/doc/html/rfc3339#section-5.6) format. This value cannot be earlier than the `since` value.'
    )
    .optional(),
  addedBy: z
    .number()
    .int()
    .describe('Return only elements published by the given user ID.')
    .optional(),
  name: z
    .string()
    .describe(
      'Return only elements whose name includes the given value. Matching is not case-sensitive.'
    )
    .optional(),
  summary: z
    .string()
    .describe(
      'Return only elements whose summary includes the given value. Matching is not case-sensitive.'
    )
    .optional(),
  description: z
    .string()
    .describe(
      'Return only elements whose description includes the given value. Matching is not case-sensitive.'
    )
    .optional(),
  sort: z
    .enum(['createdAt', 'updatedAt'])
    .describe(
      'Sort the results by the given value. If you use this query parameter, you must also use the `direction` parameter.'
    )
    .optional(),
  direction: z
    .enum(['asc', 'desc'])
    .describe(
      'Sort in ascending (`asc`) or descending (`desc`) order. Matching is not case-sensitive. If you use this query parameter, you must also use the `sort` parameter.'
    )
    .optional(),
  createdBy: z
    .number()
    .int()
    .describe('Return only results created by the given user ID.')
    .optional(),
  offset: z
    .number()
    .int()
    .describe('The zero-based offset of the first item to return.')
    .default(0),
  limit: z
    .number()
    .int()
    .describe(
      'The maximum number of elements to return. If the value exceeds the maximum value of `1000`, then the system uses the `1000` value.'
    )
    .default(1000),
  parentFolderId: z
    .number()
    .int()
    .describe(
      "Return the folders and elements in a specific folder. If this value is `0`, then the endpoint only returns the root folder's elements."
    )
    .default(0),
  type: z
    .enum(['api', 'folder', 'collection', 'workspace'])
    .describe('Filter by the element type.')
    .optional(),
});
export const annotations = {
  title:
    "Gets information about the folders and their elements added to your team's [Private API Network](https://learning.postman.com/docs/collaborating-in-postman/adding-private-network/).\n\n**Note:**\n\nThe \\`limit\\` and \\`offset\\` parameters are separately applied to elements and folders. For example, if you query a \\`limit\\` value of \\`10\\` and an \\`offset\\` value \\`0\\`, the endpoint returns 10 elements and 10 folders for a total of 20 items. The \\`totalCount\\` property in the \\`meta\\` response is the total count of both elements and folders.\n",
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/network/private`;
    const query = new URLSearchParams();
    if (params.since !== undefined) query.set('since', String(params.since));
    if (params.until !== undefined) query.set('until', String(params.until));
    if (params.addedBy !== undefined) query.set('addedBy', String(params.addedBy));
    if (params.name !== undefined) query.set('name', String(params.name));
    if (params.summary !== undefined) query.set('summary', String(params.summary));
    if (params.description !== undefined) query.set('description', String(params.description));
    if (params.sort !== undefined) query.set('sort', String(params.sort));
    if (params.direction !== undefined) query.set('direction', String(params.direction));
    if (params.createdBy !== undefined) query.set('createdBy', String(params.createdBy));
    if (params.offset !== undefined) query.set('offset', String(params.offset));
    if (params.limit !== undefined) query.set('limit', String(params.limit));
    if (params.parentFolderId !== undefined)
      query.set('parentFolderId', String(params.parentFolderId));
    if (params.type !== undefined) query.set('type', String(params.type));
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
