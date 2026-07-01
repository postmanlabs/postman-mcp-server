import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'createMockServerResponse';
export const description =
  'Creates a server response on a mock server. Server responses simulate 5xx server-level failures (e.g. 500, 503) that are agnostic to any specific route — when active, every request to the mock returns this response.\n\n- \\`statusCode\\` must be a 5xx value (500–599).\n- \\`body\\` is a raw string — pass the response body exactly as the mock should return it (e.g. a JSON string like \\`"{\\"message\\":\\"error\\"}"\\` or plain text).\n- \\`language\\` controls syntax highlighting in the Postman UI (\\`json\\`, \\`xml\\`, \\`html\\`, \\`javascript\\`, \\`text\\`). It does not affect the actual response Content-Type — set that via \\`headers\\` instead.\n- \\`headers\\` is an array of \\`{key, value}\\` pairs for response headers (e.g. \\`[{"key": "Content-Type", "value": "application/json"}]\\`).\n- You can create multiple server responses per mock, but only one can be active at a time. Creating a response does NOT automatically activate it — call \\`updateMock\\` with \\`config.serverResponseId\\` set to the new response\'s \\`id\\` to activate it.\n';
export const parameters = z.object({
  mockId: z.string().describe("The mock's ID."),
  serverResponse: z
    .object({
      name: z.string().describe("The server response's name."),
      statusCode: z
        .number()
        .int()
        .gte(500)
        .lte(599)
        .describe('The HTTP status code the mock returns. Must be a 5xx value (500–599).'),
      headers: z
        .array(
          z.object({
            key: z.string().describe("The request header's key value.").optional(),
            value: z.string().describe("The request header's value.").optional(),
          })
        )
        .describe(
          "The server response's request headers, such as Content-Type, Accept, encoding, and other information."
        )
        .optional(),
      language: z
        .enum(['text', 'javascript', 'json', 'html', 'xml'])
        .nullable()
        .describe("The server response's body language type.")
        .optional(),
      body: z
        .string()
        .describe("The server response's body that returns when calling the mock server.")
        .optional(),
    })
    .optional(),
});
export const annotations = {
  title:
    'Creates a server response on a mock server. Server responses simulate 5xx server-level failures (e.g. 500, 503) that are agnostic to any specific route — when active, every request to the mock returns this response.',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    const endpoint = `/mocks/${encodeURIComponent(String(args.mockId))}/server-responses`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.serverResponse !== undefined) bodyPayload.serverResponse = args.serverResponse;
    const options: any = {
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
  } catch (e: unknown) {
    if (e instanceof McpError) {
      throw e;
    }
    throw asMcpError(e);
  }
}
