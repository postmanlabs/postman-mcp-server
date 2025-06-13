import { z } from 'zod';
import { fetchPostmanAPI, ContentType } from '../clients/postman.js';

export const method = 'create-collection';
export const description =
  'Creates a collection using the [Postman Collection v2.1.0 schema format](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).\n\n**Note:**\n\n- If you do not include the \\`workspace\\` query parameter, the system creates the collection in your "My Workspace" workspace.\n- For a complete list of available property values for this endpoint, use the following references available in the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html):\n    - \\`info\\` object — Refer to the **Information** entry.\n    - \\`item\\` object — Refer to the **Items** entry.\n- For all other possible values, refer to the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).\n';
export const parameters = z.object({
  workspace: z.string().describe("The workspace's ID.").optional(),
  collection: z
    .object({
      info: z
        .object({
          name: z.string().describe("The collection's name."),
          description: z.string().describe("The collection's description.").optional(),
          schema: z
            .literal('https://schema.getpostman.com/json/collection/v2.1.0/collection.json')
            .describe(
              'The "https://schema.getpostman.com/json/collection/v2.1.0/collection.json" Postman Collection Format v2.1.0 schema.'
            ),
        })
        .describe('Information about the collection.'),
      item: z.array(
        z
          .object({
            name: z.string().describe("The item's name.").optional(),
            description: z.string().nullable().describe("The item's description.").optional(),
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
            event: z
              .array(
                z
                  .object({
                    listen: z
                      .enum(['test', 'prerequest'])
                      .describe(
                        'Can be set to `test` or `prerequest` for test scripts or pre-request scripts respectively.'
                      ),
                    script: z
                      .object({
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
                        'Information about the Javascript code that can be used to to perform setup or teardown operations in a response.'
                      )
                      .optional(),
                  })
                  .describe("Information about the collection's events.")
              )
              .describe('A list of scripts configured to run when specific events occur.')
              .optional(),
            request: z
              .object({
                url: z
                  .object({
                    raw: z.string().describe("The request's raw URL.").optional(),
                    protocol: z.string().describe('The request protocol.').optional(),
                    host: z.array(z.string().nullable()).describe("The host's URL.").optional(),
                    path: z
                      .array(z.string())
                      .describe("A list of the URL's path components.")
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
                          value: z.string().nullable().describe("The key's value.").optional(),
                          disabled: z
                            .boolean()
                            .describe("If true, the query parameter isn't sent with the request.")
                            .default(false),
                          description: z
                            .string()
                            .nullable()
                            .describe("The query parameter's description.")
                            .optional(),
                        })
                      )
                      .describe(
                        'A list of query parameters. These are the query string parts of the URL, parsed as separate variables.'
                      )
                      .optional(),
                  })
                  .describe('Information about the URL.')
                  .optional(),
                auth: z
                  .object({
                    type: z
                      .enum([
                        'noauth',
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
                    noauth: z.any().optional(),
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
                method: z.string().describe("The request's standard HTTP method.").optional(),
                description: z
                  .string()
                  .nullable()
                  .describe("The request's description.")
                  .optional(),
                header: z
                  .array(
                    z
                      .object({
                        key: z
                          .string()
                          .describe(
                            "The header's key, such as `Content-Type` or `X-Custom-Header`."
                          ),
                        value: z.string().describe("The header key's value."),
                        disabled: z
                          .boolean()
                          .describe("If true, the current header isn't sent with requests.")
                          .default(false),
                        description: z
                          .string()
                          .nullable()
                          .describe("The header's description.")
                          .optional(),
                      })
                      .describe('Information about the header.')
                  )
                  .describe('A list of headers.')
                  .optional(),
                body: z
                  .object({
                    mode: z
                      .enum(['raw', 'urlencoded', 'formdata', 'file', 'graphql'])
                      .describe('The data associated with the request.')
                      .optional(),
                    raw: z
                      .string()
                      .describe(
                        'If the `mode` value is `raw`, the raw content of the request body.'
                      )
                      .optional(),
                    urlencoded: z
                      .array(
                        z.object({
                          key: z.string().describe('The key value.'),
                          value: z.string().describe("The key's value.").optional(),
                          description: z
                            .string()
                            .nullable()
                            .describe("The key's description.")
                            .optional(),
                        })
                      )
                      .describe('A list of x-www-form-encoded key/value pairs.')
                      .optional(),
                    formdata: z
                      .array(
                        z.record(z.any()).and(
                          z.union([
                            z.object({
                              key: z.string().describe('The key value.').optional(),
                              value: z.string().describe("The key's value.").optional(),
                              type: z.literal('text').describe('The `text` value.').optional(),
                              contentType: z
                                .string()
                                .describe('The form-data Content-Type header.')
                                .optional(),
                              description: z
                                .string()
                                .nullable()
                                .describe("The key's description.")
                                .optional(),
                            }),
                            z.object({
                              key: z.string().describe('The key value.').optional(),
                              src: z
                                .any()
                                .superRefine((x, ctx) => {
                                  const schemas = [z.string().nullable(), z.array(z.string())];
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
                              type: z.literal('file').describe('The `file` value.').optional(),
                              contentType: z
                                .string()
                                .describe('The form-data Content-Type header.')
                                .optional(),
                              description: z
                                .string()
                                .nullable()
                                .describe("The key's description.")
                                .optional(),
                            }),
                          ])
                        )
                      )
                      .describe(
                        'If the `mode` value is `formdata`, then a list of form-data key/pair values.'
                      )
                      .optional(),
                    file: z
                      .object({
                        src: z
                          .string()
                          .nullable()
                          .describe(
                            'The name of the file to upload (not its path). A null value indicates that no file is selected as a part of the request body.'
                          )
                          .optional(),
                      })
                      .describe(
                        'If the `mode` value is `file`, an object containing the file request information.'
                      )
                      .optional(),
                    graphql: z
                      .object({
                        query: z.string().describe('The GraphQL query.').optional(),
                        variables: z
                          .string()
                          .nullable()
                          .describe('The GraphQL query variables, in JSON format.')
                          .optional(),
                      })
                      .describe(
                        'If the `mode` value is `graphql`, an object containing the GraphQL request information.'
                      )
                      .optional(),
                    options: z
                      .record(z.any())
                      .describe('Additional configurations and options set for various modes.')
                      .optional(),
                  })
                  .describe(
                    'Information about the collection\'s request body. To set this to "none", pass an empty object.'
                  )
                  .optional(),
              })
              .describe('Information about the collection request.')
              .optional(),
            response: z
              .array(z.any().describe("Information about the request's response."))
              .describe("A list of the collection's responses.")
              .optional(),
            protocolProfileBehavior: z
              .object({
                strictSSL: z
                  .boolean()
                  .describe('If true, enables certificate verification.')
                  .optional(),
                followRedirects: z
                  .boolean()
                  .describe('If true, follow HTTP 3xx responses as redirects.')
                  .optional(),
                maxRedirects: z
                  .number()
                  .describe('The maximum number of redirects to follow.')
                  .optional(),
                disableBodyPruning: z
                  .boolean()
                  .describe(
                    'If true, disables request body pruning for the GET, COPY, HEAD, PURGE, and UNLOCK methods.'
                  )
                  .optional(),
                disableUrlEncoding: z
                  .boolean()
                  .describe(
                    'If true, disables the percent encoding of auth, path, query, and fragment URL segments.'
                  )
                  .optional(),
                disabledSystemHeaders: z
                  .object({
                    'cache-control': z.boolean().optional(),
                    'postman-token': z.boolean().optional(),
                    'content-type': z.boolean().optional(),
                    'content-length': z.boolean().optional(),
                    'accept-encoding': z.boolean().optional(),
                    connection: z.boolean().optional(),
                    host: z.boolean().optional(),
                  })
                  .describe('Disable the system headers which are added implicitly.')
                  .optional(),
                insecureHTTPParser: z
                  .boolean()
                  .describe(
                    'If true, uses an insecure HTTP parser that accepts invalid HTTP headers.'
                  )
                  .optional(),
                followOriginalHttpMethod: z
                  .boolean()
                  .describe(
                    'If true, redirects with the original HTTP method. Redirects with the GET HTTP method by default.'
                  )
                  .optional(),
                followAuthorizationHeader: z
                  .boolean()
                  .describe(
                    'If true, retains the `authorization` header when a redirect happens to a different hostname.'
                  )
                  .optional(),
                protocolVersion: z
                  .enum(['http1', 'http2', 'auto'])
                  .describe(
                    'The HTTP protocol version to use. Supports the `http1`, `http2`, and `auto` values.'
                  )
                  .optional(),
                removeRefererHeaderOnRedirect: z
                  .boolean()
                  .describe('If true, removes the `referer` header when a redirect happens.')
                  .optional(),
                tlsPreferServerCiphers: z
                  .boolean()
                  .describe(
                    "If true, uses the server's cipher suite order instead of the client's during negotiation."
                  )
                  .optional(),
                tlsDisabledProtocols: z
                  .array(z.string())
                  .describe('The SSL and TLS protocol versions to disable during negotiation.')
                  .optional(),
                tlsCipherSelection: z
                  .array(z.string())
                  .describe(
                    'The order of cipher suites that the SSL server profile uses to establish a secure connection.'
                  )
                  .optional(),
              })
              .describe(
                'The [settings](https://learning.postman.com/docs/sending-requests/create-requests/request-settings/) used to alter the [Protocol Profile Behavior](https://github.com/postmanlabs/postman-runtime/blob/develop/docs/protocol-profile-behavior.md) of sending a request.'
              )
              .optional(),
          })
          .describe('Information about the collection request or folder.')
      ),
      event: z
        .array(
          z
            .object({
              listen: z
                .enum(['test', 'prerequest'])
                .describe(
                  'Can be set to `test` or `prerequest` for test scripts or pre-request scripts respectively.'
                ),
              script: z
                .object({
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
                  'Information about the Javascript code that can be used to to perform setup or teardown operations in a response.'
                )
                .optional(),
            })
            .describe("Information about the collection's events.")
        )
        .describe('A list of scripts configured to run when specific events occur.')
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
              'noauth',
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
          noauth: z.any().optional(),
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
      protocolProfileBehavior: z
        .object({
          strictSSL: z.boolean().describe('If true, enables certificate verification.').optional(),
          followRedirects: z
            .boolean()
            .describe('If true, follow HTTP 3xx responses as redirects.')
            .optional(),
          maxRedirects: z
            .number()
            .describe('The maximum number of redirects to follow.')
            .optional(),
          disableBodyPruning: z
            .boolean()
            .describe(
              'If true, disables request body pruning for the GET, COPY, HEAD, PURGE, and UNLOCK methods.'
            )
            .optional(),
          disableUrlEncoding: z
            .boolean()
            .describe(
              'If true, disables the percent encoding of auth, path, query, and fragment URL segments.'
            )
            .optional(),
          disabledSystemHeaders: z
            .object({
              'cache-control': z.boolean().optional(),
              'postman-token': z.boolean().optional(),
              'content-type': z.boolean().optional(),
              'content-length': z.boolean().optional(),
              'accept-encoding': z.boolean().optional(),
              connection: z.boolean().optional(),
              host: z.boolean().optional(),
            })
            .describe('Disable the system headers which are added implicitly.')
            .optional(),
          insecureHTTPParser: z
            .boolean()
            .describe('If true, uses an insecure HTTP parser that accepts invalid HTTP headers.')
            .optional(),
          followOriginalHttpMethod: z
            .boolean()
            .describe(
              'If true, redirects with the original HTTP method. Redirects with the GET HTTP method by default.'
            )
            .optional(),
          followAuthorizationHeader: z
            .boolean()
            .describe(
              'If true, retains the `authorization` header when a redirect happens to a different hostname.'
            )
            .optional(),
          protocolVersion: z
            .enum(['http1', 'http2', 'auto'])
            .describe(
              'The HTTP protocol version to use. Supports the `http1`, `http2`, and `auto` values.'
            )
            .optional(),
          removeRefererHeaderOnRedirect: z
            .boolean()
            .describe('If true, removes the `referer` header when a redirect happens.')
            .optional(),
          tlsPreferServerCiphers: z
            .boolean()
            .describe(
              "If true, uses the server's cipher suite order instead of the client's during negotiation."
            )
            .optional(),
          tlsDisabledProtocols: z
            .array(z.string())
            .describe('The SSL and TLS protocol versions to disable during negotiation.')
            .optional(),
          tlsCipherSelection: z
            .array(z.string())
            .describe(
              'The order of cipher suites that the SSL server profile uses to establish a secure connection.'
            )
            .optional(),
        })
        .describe(
          'The [settings](https://learning.postman.com/docs/sending-requests/create-requests/request-settings/) used to alter the [Protocol Profile Behavior](https://github.com/postmanlabs/postman-runtime/blob/develop/docs/protocol-profile-behavior.md) of sending a request.'
        )
        .optional(),
    })
    .optional(),
});
export const annotations = {
  title:
    'Creates a collection using the [Postman Collection v2.1.0 schema format](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).\n\n**Note:**\n\n- If you do not include the \\`workspace\\` query parameter, the system creates the collection in your "My Workspace" workspace.\n- For a complete list of available property values for this endpoint, use the following references available in the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html):\n    - \\`info\\` object — Refer to the **Information** entry.\n    - \\`item\\` object — Refer to the **Items** entry.\n- For all other possible values, refer to the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).\n',
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
};

export async function handler(
  params: z.infer<typeof parameters>,
  extra: { apiKey: string }
): Promise<{ content: Array<{ type: string; text: string } & Record<string, unknown>> }> {
  try {
    const endpoint = `/collections`;
    const query = new URLSearchParams();
    if (params.workspace !== undefined) query.set('workspace', String(params.workspace));
    const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
    const bodyPayload: any = {};
    if (params.collection !== undefined) bodyPayload.collection = params.collection;
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
