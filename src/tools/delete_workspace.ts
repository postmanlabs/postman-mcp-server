import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';

export const method = 'delete-workspace';
export const description =
  'Deletes an existing workspace.\n\n### Important\n\nIf you delete a workspace that has a linked collection or environment with another workspace, this will delete the collection and environment in all workspaces.\n';
export const parameters = z.object({ workspaceId: z.string().describe("The workspace's ID.") });
export const annotations = {
  title:
    'Deletes an existing workspace.\n\n### Important\n\nIf you delete a workspace that has a linked collection or environment with another workspace, this will delete the collection and environment in all workspaces.\n',
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/workspaces/${params.workspaceId}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const result = await fetchPostmanAPI(url, {
      method: 'DELETE',
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
