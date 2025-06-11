import { z } from 'zod';
import { fetchPostmanAPI, ContentType } from '../clients/postman.js';

export const method = 'patch-collection';
export const description =
  'Updates specific collection information, such as its name, events, or its variables. For more information about the \\`auth\\`, \\`variable\\`, and \\`events\\` properties, refer to the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html):\n- For \\`variable\\`, refer to the **Variable List** entry. Also accepts \\`variables\\`.\n- For \\`auth\\`, refer to the **Auth** entry.\n- For \\`events\\`, refer to the **Event List** entry.\n';
export const parameters = z.object({
  collectionId: z.string().describe("The collection's ID."),
  collection: z
    .object({
      info: z
        .object({
          name: z.string().describe("The collection's updated name.").optional(),
          description: z.string().describe("The collection's updated description.").optional(),
        })
        .describe("An object that contains the collection's updated name and description.")
        .optional(),
      variable: z
        .array(
          z
            .object({
              key: z.string().describe("The variable's key (name).").optional(),
              value: z.string().describe("The key's value.").optional(),
              type: z
                .enum(['string', 'boolean', 'integer'])
                .describe("The variable's type.")
                .optional(),
              name: z.string().describe("The variable's name.").optional(),
              description: z
                .string()
                .describe(
                  "The variable's description. Doesn't apply to collection-level variables."
                )
                .optional(),
              disabled: z.boolean().default(false),
            })
            .describe('Information about the variable.')
        )
        .describe(
          "A list of the collection's [variables](https://learning.postman.com/docs/sending-requests/variables/variables/). Make certain not to include sensitive information in variables."
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
            ])
            .describe('The authorization type.'),
          apikey: z
            .array(
              z
                .object({
                  key: z.string().describe("The auth method's key value."),
                  value: z
                    .union([z.string(), z.array(z.record(z.any()))])
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
                    .union([z.string(), z.array(z.record(z.any()))])
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
                    .union([z.string(), z.array(z.record(z.any()))])
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
                    .union([z.string(), z.array(z.record(z.any()))])
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
                    .union([z.string(), z.array(z.record(z.any()))])
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
                    .union([z.string(), z.array(z.record(z.any()))])
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
                    .union([z.string(), z.array(z.record(z.any()))])
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
                    .union([z.string(), z.array(z.record(z.any()))])
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
                    .union([z.string(), z.array(z.record(z.any()))])
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
                    .union([z.string(), z.array(z.record(z.any()))])
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
        })
        .describe(
          'The [authorization type supported by Postman](https://learning.postman.com/docs/sending-requests/authorization/authorization-types/).'
        )
        .optional(),
      events: z
        .array(
          z
            .object({
              id: z.string().describe("The event's ID.").optional(),
              listen: z
                .enum(['test', 'prerequest'])
                .describe(
                  'Can be set to `test` or `prerequest` for test scripts or pre-request scripts respectively.'
                ),
              script: z
                .object({
                  id: z.string().describe("The script's ID.").optional(),
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
                  src: z
                    .any()
                    .superRefine((x, ctx) => {
                      const schemas = [
                        z
                          .object({
                            raw: z.string().describe("The request's raw URL.").optional(),
                            protocol: z.string().describe('The request protocol.').optional(),
                            host: z
                              .any()
                              .superRefine((x, ctx) => {
                                const schemas = [
                                  z.string().describe("The host's URL."),
                                  z
                                    .array(z.string().nullable())
                                    .describe("A list of the host's subdomain components."),
                                ];
                                const errors = schemas.reduce<z.ZodError[]>(
                                  (errors, schema) =>
                                    ((result) =>
                                      result.error ? [...errors, result.error] : errors)(
                                      schema.safeParse(x)
                                    ),
                                  []
                                );
                                if (schemas.length - errors.length !== 1) {
                                  ctx.addIssue({
                                    path: ctx.path,
                                    code: 'invalid_union',
                                    unionErrors: errors,
                                    message: 'Invalid input: Should pass single schema',
                                  });
                                }
                              })
                              .describe("The host's URL.")
                              .optional(),
                            path: z
                              .any()
                              .superRefine((x, ctx) => {
                                const schemas = [
                                  z.string(),
                                  z
                                    .array(
                                      z.any().superRefine((x, ctx) => {
                                        const schemas = [
                                          z.string().nullable(),
                                          z.object({
                                            type: z.string().nullable().optional(),
                                            value: z.string().nullable().optional(),
                                          }),
                                        ];
                                        const errors = schemas.reduce<z.ZodError[]>(
                                          (errors, schema) =>
                                            ((result) =>
                                              result.error ? [...errors, result.error] : errors)(
                                              schema.safeParse(x)
                                            ),
                                          []
                                        );
                                        if (schemas.length - errors.length !== 1) {
                                          ctx.addIssue({
                                            path: ctx.path,
                                            code: 'invalid_union',
                                            unionErrors: errors,
                                            message: 'Invalid input: Should pass single schema',
                                          });
                                        }
                                      })
                                    )
                                    .describe("A list of the URL's path components."),
                                ];
                                const errors = schemas.reduce<z.ZodError[]>(
                                  (errors, schema) =>
                                    ((result) =>
                                      result.error ? [...errors, result.error] : errors)(
                                      schema.safeParse(x)
                                    ),
                                  []
                                );
                                if (schemas.length - errors.length !== 1) {
                                  ctx.addIssue({
                                    path: ctx.path,
                                    code: 'invalid_union',
                                    unionErrors: errors,
                                    message: 'Invalid input: Should pass single schema',
                                  });
                                }
                              })
                              .optional(),
                            port: z
                              .string()
                              .describe(
                                "The URL's port number. An empty value indicates port `80` (http) or `443` (https)."
                              )
                              .optional(),
                            query: z
                              .array(
                                z.object({
                                  key: z
                                    .string()
                                    .nullable()
                                    .describe("The query parameter's key.")
                                    .optional(),
                                  value: z
                                    .string()
                                    .nullable()
                                    .describe("The key's value.")
                                    .optional(),
                                  disabled: z
                                    .boolean()
                                    .describe(
                                      "If true, the query parameter isn't sent with the request."
                                    )
                                    .default(false),
                                  description: z
                                    .any()
                                    .superRefine((x, ctx) => {
                                      const schemas = [
                                        z.object({
                                          content: z
                                            .string()
                                            .describe("The description's contents.")
                                            .optional(),
                                          type: z
                                            .string()
                                            .describe(
                                              "The raw description content's MIME type, such as `text/markdown` or `text/html`. The type is used to render the description in the Postman app or when generating documentation."
                                            )
                                            .optional(),
                                        }),
                                        z
                                          .string()
                                          .nullable()
                                          .describe("The collection's description."),
                                      ];
                                      const errors = schemas.reduce<z.ZodError[]>(
                                        (errors, schema) =>
                                          ((result) =>
                                            result.error ? [...errors, result.error] : errors)(
                                            schema.safeParse(x)
                                          ),
                                        []
                                      );
                                      if (schemas.length - errors.length !== 1) {
                                        ctx.addIssue({
                                          path: ctx.path,
                                          code: 'invalid_union',
                                          unionErrors: errors,
                                          message: 'Invalid input: Should pass single schema',
                                        });
                                      }
                                    })
                                    .describe(
                                      'A description can be a raw text or an object containing the description along with its format.'
                                    )
                                    .optional(),
                                })
                              )
                              .describe(
                                'A list of query parameters. These are the query string parts of the URL, parsed as separate variables.'
                              )
                              .optional(),
                            hash: z
                              .string()
                              .describe(
                                'Contains the URL fragment (if any). Usually this is not transmitted over the network, but it could be useful to store this in some cases.'
                              )
                              .optional(),
                            variable: z
                              .array(
                                z
                                  .object({
                                    key: z
                                      .string()
                                      .describe("The variable's key (name).")
                                      .optional(),
                                    value: z.string().describe("The key's value.").optional(),
                                    type: z
                                      .enum(['string', 'boolean', 'integer'])
                                      .describe("The variable's type.")
                                      .optional(),
                                    name: z.string().describe("The variable's name.").optional(),
                                    description: z
                                      .string()
                                      .describe(
                                        "The variable's description. Doesn't apply to collection-level variables."
                                      )
                                      .optional(),
                                    disabled: z.boolean().default(false),
                                  })
                                  .describe('Information about the variable.')
                              )
                              .describe('A list of variables.')
                              .optional(),
                          })
                          .describe('Information about the URL.'),
                        z.string().describe('The literal request URL.'),
                      ];
                      const errors = schemas.reduce<z.ZodError[]>(
                        (errors, schema) =>
                          ((result) => (result.error ? [...errors, result.error] : errors))(
                            schema.safeParse(x)
                          ),
                        []
                      );
                      if (schemas.length - errors.length !== 1) {
                        ctx.addIssue({
                          path: ctx.path,
                          code: 'invalid_union',
                          unionErrors: errors,
                          message: 'Invalid input: Should pass single schema',
                        });
                      }
                    })
                    .describe('Information about the URL.')
                    .optional(),
                  name: z.string().describe("The script's name.").optional(),
                })
                .describe(
                  'Information about the Javascript code that can be used to to perform setup or teardown operations in a response.'
                )
                .optional(),
              disabled: z
                .boolean()
                .describe(
                  'If true, the event is disabled. If this value is absent, then the event is considered enabled.'
                )
                .default(false),
            })
            .describe("Information about the collection's events.")
        )
        .optional(),
    })
    .optional(),
});
export const annotations = {
  title:
    'Updates specific collection information, such as its name, events, or its variables. For more information about the \\`auth\\`, \\`variable\\`, and \\`events\\` properties, refer to the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html):\n- For \\`variable\\`, refer to the **Variable List** entry. Also accepts \\`variables\\`.\n- For \\`auth\\`, refer to the **Auth** entry.\n- For \\`events\\`, refer to the **Event List** entry.\n',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/collections/${params.collectionId}`;
    const query = new URLSearchParams();
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (params.collection !== undefined) bodyPayload.collection = params.collection;
    const result = await fetchPostmanAPI(url, {
      method: 'PATCH',
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
