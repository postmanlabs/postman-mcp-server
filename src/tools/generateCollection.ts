import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
import {
  IsomorphicHeaders,
  McpError,
  ErrorCode,
  CallToolResult,
} from '@modelcontextprotocol/sdk/types.js';

function asMcpError(error: unknown): McpError {
  const cause = (error as any)?.cause ?? String(error);
  return new McpError(ErrorCode.InternalError, cause);
}

export const method = 'generateCollection';
export const description =
  'Creates a collection from the given API specification.\nThe specification must already exist or be created before it can be used to generate a collection.\nThe response contains a polling link to the task status.\n';
export const parameters = z.object({
  specId: z.string().describe("The spec's ID."),
  elementType: z.literal('collection').describe('The `collection` element type.'),
  name: z.string().describe("The generated collection's name."),
  options: z
    .object({
      requestNameSource: z
        .enum(['Fallback', 'URL'])
        .describe(
          "Determines how the generated collection's requests are named. If the `Fallback` value is passed, then the request is named after one of the following values in the schema:\n- `summary`\n- `operationId`\n- `description`\n- `url`\n"
        )
        .default('Fallback'),
      indentCharacter: z
        .enum(['Tab', 'Space'])
        .describe('The option for setting the indentation character type.')
        .default('Space'),
      parametersResolution: z
        .enum(['Schema', 'Example'])
        .describe(
          "Whether to generate the request and response parameters based on the specification or the specification's examples."
        )
        .default('Schema'),
      folderStrategy: z
        .enum(['Paths', 'Tags'])
        .describe(
          "Whether to create folders based on the specification's `paths` or `tags` properties."
        )
        .default('Paths'),
      includeAuthInfoInExample: z
        .boolean()
        .describe('If true, include the authentication parameters in the example request.')
        .default(true),
      enableOptionalParameters: z
        .boolean()
        .describe('If true, enables optional parameters in the collection and its requests.')
        .default(true),
      keepImplicitHeaders: z
        .boolean()
        .describe(
          'If true, keep the implicit headers from the OpenAPI specification, which are removed by default.'
        )
        .default(false),
      includeDeprecated: z
        .boolean()
        .describe(
          'If true, includes all deprecated operations, parameters, and properties in generated collection.'
        )
        .default(true),
      alwaysInheritAuthentication: z
        .boolean()
        .describe(
          'Whether authentication details should be included in all requests, or always inherited from the collection.'
        )
        .default(false),
      nestedFolderHierarchy: z
        .boolean()
        .describe(
          "If true, creates subfolders in the generated collection based on the order of the endpoints' tags."
        )
        .default(false),
    })
    .describe(
      "The advanced creation options and their values. For more details, see Postman's [OpenAPI to Postman Collection Converter OPTIONS documentation](https://github.com/postmanlabs/openapi-to-postman/blob/develop/OPTIONS.md). These properties are case-sensitive."
    )
    .default({ enableOptionalParameters: true, folderStrategy: 'Paths' }),
});
export const annotations = {
  title:
    'Creates a collection from the given API specification.\nThe specification must already exist or be created before it can be used to generate a collection.\nThe response contains a polling link to the task status.\n',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders }
): Promise<CallToolResult> {
  try {
    const endpoint = `/specs/${args.specId}/generations/${args.elementType}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.name !== undefined) bodyPayload.name = args.name;
    if (args.options !== undefined) bodyPayload.options = args.options;
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
