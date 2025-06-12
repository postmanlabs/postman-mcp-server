import { z } from 'zod';
import { fetchPostmanAPI } from '../clients/postman.js';

export const method = 'resolve-comment-thread';
export const description =
  'Resolves a comment and any associated replies. On success, this returns an HTTP \\`204 No Content\\` response.\n\nComment thread IDs return in the GET comments response for [APIs](https://www.postman.com/postman/workspace/postman-public-workspace/request/12959542-2103ea20-f7de-4628-90e6-b823b3084a52), [collections](https://www.postman.com/postman/workspace/postman-public-workspace/request/12959542-a6582e0a-9382-4760-8b91-53a8aa6cb8d7), and [collection items](https://www.postman.com/postman/workspace/postman-public-workspace/folder/12959542-efeda219-66e1-474c-a83b-253d15723bf7).\n';
export const parameters = z.object({
  threadId: z.number().int().describe("The comment's thread ID."),
});
export const annotations = {
  title:
    'Resolves a comment and any associated replies. On success, this returns an HTTP \\`204 No Content\\` response.\n\nComment thread IDs return in the GET comments response for [APIs](https://www.postman.com/postman/workspace/postman-public-workspace/request/12959542-2103ea20-f7de-4628-90e6-b823b3084a52), [collections](https://www.postman.com/postman/workspace/postman-public-workspace/request/12959542-a6582e0a-9382-4760-8b91-53a8aa6cb8d7), and [collection items](https://www.postman.com/postman/workspace/postman-public-workspace/folder/12959542-efeda219-66e1-474c-a83b-253d15723bf7).\n',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/comments-resolutions/${params.threadId}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const result = await fetchPostmanAPI(url, {
      method: 'POST',
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
