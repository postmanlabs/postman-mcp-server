import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'createSdk';
export const title = 'Generate an SDK';
export const description =
  'Starts an SDK generation job for one language from a collection or a specification.\nReturns 202 with a job record — the SDK does not exist yet. Poll getSdk and wait for\n\\`buildStatus\\` to reach \\`succeeded\\` before trying to download it. The request body\ndepends on the \\`language\\` you pick, so send only the properties that language accepts.\nOne call generates one language; call it once per language rather than expecting a\nbundle. Requires a Postman Team or Enterprise plan.\n';
export const parameters = z.object({
  source: z
    .object({
      type: z.enum(['collection', 'spec']).describe('The type of Postman element.'),
      id: z.string().describe('The ID of the Postman Collection or specification in Postman.'),
    })
    .describe('The collection or specification that the SDK is generated from.'),
  language: z
    .enum(['typescript', 'python', 'go', 'java', 'csharp', 'ruby', 'php', 'kotlin', 'rust', 'cli'])
    .describe('The target output language for the generated SDK.'),
  sdkVersion: z
    .string()
    .describe(
      "An optional override for the SDK version. If this isn't provided, the next version is resolved from the latest auto-pull request."
    )
    .optional(),
  authors: z
    .array(
      z
        .object({
          name: z.string().describe("The author's name."),
          email: z.string().email().describe("The author's email address.").optional(),
        })
        .describe('Information about the author of the generated SDK.')
    )
    .describe('A list of package authors written into the generated manifest.')
    .optional(),
  retry: z
    .object({
      enabled: z
        .boolean()
        .describe('If true, the generated SDK includes retry behavior.')
        .default(true),
      maxAttempts: z
        .number()
        .int()
        .describe('The maximum number of attempts to try before giving up.')
        .default(3),
      retryDelay: z
        .number()
        .int()
        .describe('The base wait between attempts, in milliseconds.')
        .default(150),
      maxDelay: z
        .number()
        .int()
        .gte(0)
        .describe('The maximum wait between attempts, in milliseconds.')
        .optional(),
      backOffFactor: z
        .number()
        .gt(0)
        .describe('The exponent base used to compute exponential backoff between attempts.')
        .optional(),
      retryDelayJitter: z
        .number()
        .int()
        .gte(0)
        .describe('The maximum random jitter added to wait times, in milliseconds.')
        .optional(),
      httpCodesToRetry: z
        .array(z.number().int().gte(200).lte(599).describe('An HTTP status code.'))
        .describe('A list of HTTP status codes that the SDK attempts its retries on.')
        .optional(),
      httpMethodsToRetry: z
        .array(
          z.preprocess(
            (v) => (typeof v === 'string' ? v.toUpperCase() : v),
            z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'CONNECT', 'TRACE'])
          )
        )
        .describe('A list of the HTTP methods that the SDK attempts its retries on.')
        .optional(),
    })
    .describe(
      "Retry behavior baked into the generated SDK's HTTP client. A power-user option; sensible defaults apply for any field left unset."
    )
    .optional(),
  typescriptOptions: z
    .object({
      npmOrg: z
        .string()
        .describe("An npm organization's scope. Don't include a trailing slash.")
        .optional(),
      npmName: z.string().describe("The unscoped npm package's name.").optional(),
    })
    .describe('TypeScript-specific SDK generation options.')
    .optional(),
  pythonOptions: z
    .object({ pypiPackageName: z.string().describe("The PyPI package's name.").optional() })
    .describe('Python-specific SDK generation options.')
    .optional(),
  goOptions: z
    .object({
      goModuleName: z
        .string()
        .describe('The Go module path written into the `go.mod` definition file.')
        .optional(),
    })
    .describe('Go-specific SDK generation options.')
    .optional(),
  javaOptions: z
    .object({
      groupId: z
        .string()
        .describe('The Maven group ID written into the `pom.xml` dependencies file.')
        .optional(),
      artifactId: z
        .string()
        .describe('The Maven artifact ID written into the `pom.xml` dependencies file.')
        .optional(),
    })
    .describe('Java-specific SDK generation options.')
    .optional(),
  csharpOptions: z
    .object({ packageId: z.string().describe("The NuGet package's ID.").optional() })
    .describe('C#-specific SDK generation options.')
    .optional(),
  rubyOptions: z
    .object({ gemName: z.string().describe("The RubyGems gem's name.").optional() })
    .describe('Ruby-specific generation options.')
    .optional(),
  phpOptions: z
    .object({
      packageName: z
        .string()
        .describe('The composer package name, in `vendor/package` format.')
        .optional(),
    })
    .describe('PHP-specific SDK generation options.')
    .optional(),
  kotlinOptions: z
    .object({
      groupId: z
        .string()
        .describe('The Maven group ID written into the `pom.xml` dependencies file.')
        .optional(),
      artifactId: z
        .string()
        .describe('The Maven artifact ID written into the `pom.xml` dependencies file.')
        .optional(),
    })
    .describe('Kotlin-specific SDK generation options.')
    .optional(),
  rustOptions: z
    .object({ packageName: z.string().describe("The crates.io package's name.").optional() })
    .describe('Rust-specific SDK generation options.')
    .optional(),
  cliOptions: z
    .object({
      goModuleName: z.string().describe("The Go module's path for the generated CLI.").optional(),
    })
    .describe('CLI-specific SDK generation options.')
    .optional(),
});
export const annotations = {
  title: 'Generate an SDK',
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
    const endpoint = `/sdks`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.source !== undefined) bodyPayload.source = args.source;
    if (args.language !== undefined) bodyPayload.language = args.language;
    if (args.sdkVersion !== undefined) bodyPayload.sdkVersion = args.sdkVersion;
    if (args.authors !== undefined) bodyPayload.authors = args.authors;
    if (args.retry !== undefined) bodyPayload.retry = args.retry;
    if (args.typescriptOptions !== undefined)
      bodyPayload.typescriptOptions = args.typescriptOptions;
    if (args.pythonOptions !== undefined) bodyPayload.pythonOptions = args.pythonOptions;
    if (args.goOptions !== undefined) bodyPayload.goOptions = args.goOptions;
    if (args.javaOptions !== undefined) bodyPayload.javaOptions = args.javaOptions;
    if (args.csharpOptions !== undefined) bodyPayload.csharpOptions = args.csharpOptions;
    if (args.rubyOptions !== undefined) bodyPayload.rubyOptions = args.rubyOptions;
    if (args.phpOptions !== undefined) bodyPayload.phpOptions = args.phpOptions;
    if (args.kotlinOptions !== undefined) bodyPayload.kotlinOptions = args.kotlinOptions;
    if (args.rustOptions !== undefined) bodyPayload.rustOptions = args.rustOptions;
    if (args.cliOptions !== undefined) bodyPayload.cliOptions = args.cliOptions;
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
