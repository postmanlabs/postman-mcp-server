import { z } from 'zod';
import { PostmanAPIClient, ContentType } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';

export const method = 'patchCollection';
export const title = 'Update part of a collection';
export const description =
  "Updates specific collection information, such as its name, events, or its variables. For more information, see the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).\n\n**Important usage notes:**\n\n- **Sequential calls only.** Do NOT call \\`patchCollection\\` in parallel with other \\`patchCollection\\` calls for the same collection — concurrent PATCH requests conflict with each other and cause cancellation errors. Always wait for one call to complete before making another.\n- **Partial updates.** Only include the fields you want to change. Omit all other fields entirely; unspecified fields are left unchanged.\n- **Variables (\\`collection.variable\\`).** Send \\`key\\` and \\`value\\` for each variable, and use \\`disabled\\` to turn one off. An \\`enabled\\` field is accepted but silently ignored, so \\`disabled\\` is the only one that takes effect.\n- **Secret variables.** You can't set secret variables through this endpoint. Manage cloud- or vault-backed secrets through environments instead.\n- **Events (\\`collection.events\\`).** Each event's \\`script.id\\` is required and must be supplied by you — generate a UUID string for it. Omitting it fails with \\`Parameters required: ('id') for key: 'collection.events.script'\\`. The event itself is identified by its \\`script.id\\`.\n";
export const parameters = z.object({
  collectionId: z
    .string()
    .describe(
      'The collection ID must be in the form <OWNER_ID>-<UUID> (e.g. 12345-33823532ab9e41c9b6fd12d0fd459b8b).'
    ),
  collection: z
    .object({
      info: z
        .object({
          name: z.string().describe("The collection's updated name.").optional(),
          description: z.string().describe("The collection's updated description.").optional(),
        })
        .strict()
        .describe("An object that contains the collection's updated name and description.")
        .optional(),
      variable: z
        .array(
          z
            .object({
              key: z.string().describe("The variable's key (name).").optional(),
              value: z
                .union([z.string(), z.boolean(), z.number().int()])
                .describe("The key's value.")
                .optional(),
              disabled: z.boolean().describe('If true, the variable is not enabled.').optional(),
            })
            .describe(
              "Information about a collection-level variable. Collection variables don't support `id`, `description`, or `enabled` fields. Use `disabled` to control whether a variable is active."
            )
        )
        .describe(
          "A list of the collection's variables to add or update. Secret variables can't be set through this endpoint; manage cloud or vault-backed secrets through environments instead."
        )
        .optional(),
      auth: z
        .object({
          type: z
            .enum([
              'basic',
              'bearer',
              'apikey',
              'digest',
              'oauth1',
              'oauth2',
              'hawk',
              'awsv4',
              'ntlm',
              'edgegrid',
              'jwt',
              'asap',
            ])
            .describe('The authorization type.'),
          apikey: z
            .array(
              z
                .object({
                  key: z.string().describe("The auth method's key value."),
                  value: z
                    .union([z.string(), z.array(z.record(z.string(), z.unknown()))])
                    .describe("The key's value.")
                    .optional(),
                  type: z
                    .enum(['string', 'boolean', 'number', 'array', 'object', 'any'])
                    .describe("The value's type.")
                    .optional(),
                })
                .describe(
                  'Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'
                )
            )
            .describe("The API key's authentication information.")
            .optional(),
          awsv4: z
            .array(
              z
                .object({
                  key: z.string().describe("The auth method's key value."),
                  value: z
                    .union([z.string(), z.array(z.record(z.string(), z.unknown()))])
                    .describe("The key's value.")
                    .optional(),
                  type: z
                    .enum(['string', 'boolean', 'number', 'array', 'object', 'any'])
                    .describe("The value's type.")
                    .optional(),
                })
                .describe(
                  'Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'
                )
            )
            .describe(
              'The attributes for [AWS Signature](https://learning.postman.com/docs/sending-requests/authorization/aws-signature/) authentication.'
            )
            .optional(),
          basic: z
            .array(
              z
                .object({
                  key: z.string().describe("The auth method's key value."),
                  value: z
                    .union([z.string(), z.array(z.record(z.string(), z.unknown()))])
                    .describe("The key's value.")
                    .optional(),
                  type: z
                    .enum(['string', 'boolean', 'number', 'array', 'object', 'any'])
                    .describe("The value's type.")
                    .optional(),
                })
                .describe(
                  'Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'
                )
            )
            .describe(
              'The attributes for [Basic Auth](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/#basic-auth).'
            )
            .optional(),
          bearer: z
            .array(
              z
                .object({
                  key: z.string().describe("The auth method's key value."),
                  value: z
                    .union([z.string(), z.array(z.record(z.string(), z.unknown()))])
                    .describe("The key's value.")
                    .optional(),
                  type: z
                    .enum(['string', 'boolean', 'number', 'array', 'object', 'any'])
                    .describe("The value's type.")
                    .optional(),
                })
                .describe(
                  'Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'
                )
            )
            .describe(
              'The attributes for [Bearer Token](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/#bearer-token) authentication.'
            )
            .optional(),
          digest: z
            .array(
              z
                .object({
                  key: z.string().describe("The auth method's key value."),
                  value: z
                    .union([z.string(), z.array(z.record(z.string(), z.unknown()))])
                    .describe("The key's value.")
                    .optional(),
                  type: z
                    .enum(['string', 'boolean', 'number', 'array', 'object', 'any'])
                    .describe("The value's type.")
                    .optional(),
                })
                .describe(
                  'Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'
                )
            )
            .describe(
              'The attributes for [Digest](https://learning.postman.com/docs/sending-requests/authorization/digest-auth/) access authentication.'
            )
            .optional(),
          edgegrid: z
            .array(
              z
                .object({
                  key: z.string().describe("The auth method's key value."),
                  value: z
                    .union([z.string(), z.array(z.record(z.string(), z.unknown()))])
                    .describe("The key's value.")
                    .optional(),
                  type: z
                    .enum(['string', 'boolean', 'number', 'array', 'object', 'any'])
                    .describe("The value's type.")
                    .optional(),
                })
                .describe(
                  'Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'
                )
            )
            .describe(
              'The attributes for [Akamai Edgegrid](https://learning.postman.com/docs/sending-requests/authorization/akamai-edgegrid/) authentication.'
            )
            .optional(),
          hawk: z
            .array(
              z
                .object({
                  key: z.string().describe("The auth method's key value."),
                  value: z
                    .union([z.string(), z.array(z.record(z.string(), z.unknown()))])
                    .describe("The key's value.")
                    .optional(),
                  type: z
                    .enum(['string', 'boolean', 'number', 'array', 'object', 'any'])
                    .describe("The value's type.")
                    .optional(),
                })
                .describe(
                  'Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'
                )
            )
            .describe(
              'The attributes for [Hawk](https://learning.postman.com/docs/sending-requests/authorization/hawk-authentication/) authentication.'
            )
            .optional(),
          ntlm: z
            .array(
              z
                .object({
                  key: z.string().describe("The auth method's key value."),
                  value: z
                    .union([z.string(), z.array(z.record(z.string(), z.unknown()))])
                    .describe("The key's value.")
                    .optional(),
                  type: z
                    .enum(['string', 'boolean', 'number', 'array', 'object', 'any'])
                    .describe("The value's type.")
                    .optional(),
                })
                .describe(
                  'Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'
                )
            )
            .describe(
              'The attributes for [NTLM](https://learning.postman.com/docs/sending-requests/authorization/ntlm-authentication/) authentication.'
            )
            .optional(),
          oauth1: z
            .array(
              z
                .object({
                  key: z.string().describe("The auth method's key value."),
                  value: z
                    .union([z.string(), z.array(z.record(z.string(), z.unknown()))])
                    .describe("The key's value.")
                    .optional(),
                  type: z
                    .enum(['string', 'boolean', 'number', 'array', 'object', 'any'])
                    .describe("The value's type.")
                    .optional(),
                })
                .describe(
                  'Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'
                )
            )
            .describe(
              'The attributes for [OAuth1](https://learning.postman.com/docs/sending-requests/authorization/oauth-10/) authentication.'
            )
            .optional(),
          oauth2: z
            .array(
              z
                .object({
                  key: z.string().describe("The auth method's key value."),
                  value: z
                    .union([z.string(), z.array(z.record(z.string(), z.unknown()))])
                    .describe("The key's value.")
                    .optional(),
                  type: z
                    .enum(['string', 'boolean', 'number', 'array', 'object', 'any'])
                    .describe("The value's type.")
                    .optional(),
                })
                .describe(
                  'Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'
                )
            )
            .describe(
              'The attributes for [OAuth2](https://learning.postman.com/docs/sending-requests/authorization/oauth-20/) authentication.'
            )
            .optional(),
          jwt: z
            .array(
              z
                .object({
                  key: z.string().describe("The auth method's key value."),
                  value: z
                    .union([z.string(), z.array(z.record(z.string(), z.unknown()))])
                    .describe("The key's value.")
                    .optional(),
                  type: z
                    .enum(['string', 'boolean', 'number', 'array', 'object', 'any'])
                    .describe("The value's type.")
                    .optional(),
                })
                .describe(
                  'Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'
                )
            )
            .describe(
              'The attributes for JWT (JSON Web Token). Includes the `payload`, `secret`, `algorithm`, `addTokenTo`, and `headerPrefix` properties.'
            )
            .optional(),
          asap: z
            .array(
              z
                .object({
                  key: z.string().describe("The auth method's key value."),
                  value: z
                    .union([z.string(), z.array(z.record(z.string(), z.unknown()))])
                    .describe("The key's value.")
                    .optional(),
                  type: z
                    .enum(['string', 'boolean', 'number', 'array', 'object', 'any'])
                    .describe("The value's type.")
                    .optional(),
                })
                .describe(
                  'Information about the supported Postman [authorization type](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'
                )
            )
            .describe(
              'The attributes for ASAP (Atlassian S2S Authentication Protocol). Includes the `kid`, `aud`, `iss`, `alg`, `privateKey`, and `claims` properties.'
            )
            .optional(),
        })
        .describe("The collection's updated authorization settings.")
        .optional(),
      events: z
        .array(
          z
            .object({
              listen: z
                .enum(['test', 'prerequest'])
                .describe('The `prerequest` (pre-request) or `test` (post-response) value.'),
              script: z
                .object({
                  id: z
                    .string()
                    .describe(
                      "The script's ID. You must supply a value (for example, a UUID) when creating or updating collection-level events."
                    ),
                  type: z
                    .string()
                    .describe('The type of script. For example, `text/javascript`.')
                    .optional(),
                  exec: z
                    .array(z.string().nullable())
                    .describe(
                      'A list of script strings, where each line represents a line of code. Separate lines makes it easy to track script changes.'
                    )
                    .optional(),
                })
                .describe(
                  'Information about the Javascript code that runs on a collection-level event. Unlike request-level scripts, collection-level scripts require a client-supplied `id` value.'
                )
                .optional(),
            })
            .describe(
              "Information about a collection-level event. Collection events don't accept a top-level `id`; the event is identified by its `script.id` value, which the client must supply."
            )
        )
        .describe("The collection's updated pre-request and test scripts.")
        .optional(),
    })
    .strict()
    .and(z.union([z.unknown(), z.unknown(), z.unknown(), z.unknown()]))
    .describe(
      'The collection updates to apply. You must pass at least one of the following: `info`, `variable`, `auth`, or `events`. Unsupported properties are rejected.\n'
    )
    .optional(),
});
export const annotations = {
  title: 'Update part of a collection',
  readOnlyHint: false,
  openWorldHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  args: z.infer<typeof parameters>,
  extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    const endpoint = `/collections/${encodeURIComponent(String(args.collectionId))}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (args.collection !== undefined) bodyPayload.collection = args.collection;
    const options: any = {
      body: JSON.stringify(bodyPayload),
      contentType: ContentType.Json,
      headers: extra.headers,
    };
    const result = await extra.client.patch(url, options);
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
