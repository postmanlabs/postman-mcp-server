import { z } from 'zod';
import { fetchPostmanAPI, ContentType } from '../clients/postman.js';

export const method = 'generate-collection';
export const description =
  'Creates a collection from the given API specification. The response contains a polling link to the task status.';
export const parameters = z.object({
  specId: z.string().describe("The spec's ID."),
  elementType: z.literal('collection').describe('The `collection` element type.'),
  name: z.string().describe("The generated collection's name.").optional(),
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
    })
    .describe(
      "The advanced creation options and their values. For more details, see Postman's [OpenAPI to Postman Collection Converter OPTIONS documentation](https://github.com/postmanlabs/openapi-to-postman/blob/develop/OPTIONS.md). These properties are case-sensitive."
    )
    .optional(),
});
export const annotations = {
  title:
    'Creates a collection from the given API specification. The response contains a polling link to the task status.',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/specs/${params.specId}/generations/${params.elementType}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (params.name !== undefined) bodyPayload.name = params.name;
    if (params.options !== undefined) bodyPayload.options = params.options;
    const result = await fetchPostmanAPI(url, {
      method: 'POST',
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
