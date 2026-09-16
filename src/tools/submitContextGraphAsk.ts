import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'submitContextGraphAsk';
export const title = 'Submit a Context Graph ask';
export const description =
  "Asks a natural-language question about the team's software estate — which APIs and\nservices exist, what they expose, and how they depend on each other — and gets an\nanswer grounded in the team's Context Graph. Use this for questions about the estate\nas a whole that no single collection or workspace can answer.\nThis is asynchronous and does not return the answer: it returns an \\`askId\\` with\nstatus \\`pending\\`. Poll getContextGraphAsk with that ID until \\`status\\` is \\`completed\\`\nor \\`failed\\`, and only report an answer once it is \\`completed\\`. Set\n\\`includeAnswer=false\\` when you want just the graph data and intend to phrase the\nanswer yourself, and lower \\`maxSteps\\` (1-15, default 10) to cap how much work the\nask does.\nDo not use this tool to search Postman elements by name; use searchPostmanElements\ninstead. Each ask counts against the team's quota, so ask one well-formed question\nrather than retrying variations of the same one. Requires Context Graph to be\nenabled for the team.\n";
export const parameters = z.object({
  query: z
    .string()
    .min(1)
    .max(2000)
    .describe('The natural-language question to answer against the graph.'),
  includeAnswer: z
    .boolean()
    .describe(
      "Whether to include the prose answer in the result. If `false`, the result's `answer` property is `null` and the result's other properties are unaffected."
    )
    .default(true),
  maxSteps: z
    .number()
    .int()
    .gte(1)
    .lte(15)
    .describe('The maximum number of tool calls the ask can make. Must be between `1` and `15`.')
    .default(10),
});
export const annotations = {
  title: 'Submit a Context Graph ask',
  readOnlyHint: false,
  openWorldHint: true,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    const endpoint = `/context-graph/asks`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.query !== undefined) bodyPayload.query = args.query;
    if (args.includeAnswer !== undefined) bodyPayload.includeAnswer = args.includeAnswer;
    if (args.maxSteps !== undefined) bodyPayload.maxSteps = args.maxSteps;
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
