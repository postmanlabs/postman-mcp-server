import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
import { IsomorphicHeaders, McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

function asMcpError(error: unknown): McpError {
  const cause = (error as any)?.cause ?? String(error);
  return new McpError(ErrorCode.InternalError, cause);
}

export const method = 'putEnvironment';
export const description =
  'Replaces all the contents of an environment with the given information.\n\n**Note:**\n\n- The request body size cannot exceed the maximum allowed size of 30MB.\n- If you receive an HTTP \\`411 Length Required\\` error response, manually pass the \\`Content-Length\\` header and its value in the request header.\n';
export const parameters = z.object({
  environmentId: z.string().describe("The environment's ID."),
  environment: z
    .object({
      name: z.string().describe("The environment's name.").optional(),
      values: z
        .array(
          z
            .object({
              enabled: z.boolean().describe('If true, the variable is enabled.').optional(),
              key: z.string().describe("The variable's name.").optional(),
              value: z.string().describe("The variable's value.").optional(),
              type: z
                .enum(['secret', 'default'])
                .describe(
                  "The variable's type:\n- `secret` — The variable value is masked.\n- `default` — The variable value is visible in plain text.\n"
                )
                .optional(),
              description: z.string().max(512).describe("The variable's description.").optional(),
            })
            .describe("Information about the environment's variables.")
        )
        .describe("Information about the environment's variables.")
        .optional(),
    })
    .describe('Information about the environment.')
    .optional(),
});
export const annotations = {
  title:
    'Replaces all the contents of an environment with the given information.\n\n**Note:**\n\n- The request body size cannot exceed the maximum allowed size of 30MB.\n- If you receive an HTTP \\`411 Length Required\\` error response, manually pass the \\`Content-Length\\` header and its value in the request header.\n',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/environments/${params.environmentId}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (params.environment !== undefined) bodyPayload.environment = params.environment;
    const options: any = {
      body: JSON.stringify(bodyPayload),
      contentType: ContentType.Json,
      headers: extra.headers,
    };
    const result = await extra.client.put(url, options);
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
