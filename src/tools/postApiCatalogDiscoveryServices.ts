import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'postApiCatalogDiscoveryServices';
export const title = 'Add discovered services to the API Catalog';
export const description =
  'Registers services with the API Catalog as discovered services, for sources Postman\ncannot detect on its own. Accepts up to 20 services per call; each needs at least a\n\\`name\\`. Supply \\`apiDefinition\\` to attach an OpenAPI definition, or \\`endpoints\\` to list\nendpoints directly — if you send both, \\`endpoints\\` is ignored. Without\n\\`providerServiceId\\` the system derives one from \\`{name}:{version}\\`, so pass it\nexplicitly when you need a stable identifier across calls.\nDo not use this tool to create a Postman API specification or collection; it only adds\ncatalog discovery records. Requires a Postman Enterprise plan.\n';
export const parameters = z.object({
  discoveredServices: z
    .array(
      z
        .object({
          name: z.string().describe("The service's name."),
          version: z.string().describe("The service's version.").optional(),
          providerServiceId: z
            .string()
            .describe(
              'The ID of the service in the source registry. If you do not pass this property, the system uses the `{name}:{version}` value.'
            )
            .optional(),
          description: z.string().describe("The service's description.").optional(),
          sourceEnvironment: z.string().describe("The service's source environment.").optional(),
          apiDefinition: z
            .object({
              content: z
                .string()
                .describe(
                  'A Base64-encoded JSON API definition. Cannot exceed 2 MB after decoding.'
                )
                .optional(),
            })
            .describe(
              'The API definition (specification) for the service. If you pass this with the `endpoints` array, this object is given preference and `endpoints` is ignored.'
            )
            .optional(),
          endpoints: z
            .array(
              z
                .object({
                  method: z.string().describe("The endpoint's HTTP method.").optional(),
                  path: z.string().describe("The endpoint's URL path.").optional(),
                  description: z
                    .string()
                    .nullable()
                    .describe("The endpoint's description.")
                    .optional(),
                  host: z.string().describe("The endpoint's host.").optional(),
                })
                .describe("Information about a service's endpoint.")
            )
            .max(100)
            .describe(
              "A list of the service's endpoints. If you pass this with the `apiDefinition` array, this array is ignored."
            )
            .optional(),
          tags: z
            .array(z.string())
            .max(50)
            .describe('A list of tags associated with the service.')
            .optional(),
          providerMetadata: z
            .object({
              commitSha: z.string().describe('A commit hash ID.').optional(),
              branch: z.string().describe("The source provider's branch name.").optional(),
              gitRepoUrl: z.string().describe("The source provider's Git repo URL.").optional(),
              deployedAt: z
                .string()
                .datetime({ offset: true })
                .describe('The date and time at which the service was deployed.')
                .optional(),
            })
            .describe('Additional metadata from the discovery source provider.')
            .optional(),
        })
        .describe('Information about the discovered service.')
    )
    .describe('A list of discovered services to add to the API Catalog.'),
});
export const annotations = {
  title: 'Add discovered services to the API Catalog',
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
    const endpoint = `/api-catalog/discovery-services`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.discoveredServices !== undefined)
      bodyPayload.discoveredServices = args.discoveredServices;
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
