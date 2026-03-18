import { z } from 'zod';
import { ContentType } from '../clients/postman.js';
import { asMcpError, McpError } from './utils/toolHelpers.js';
export const method = 'updateCollectionResponse';
export const description = 'Updates a response in a collection. For a complete list of properties, see the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).\n\n**Note:**\n\n- You must pass a collection ID (\\`12ece9e1-2abf-4edc-8e34-de66e74114d2\\`), not a collection UID (\\`12345678-12ece9e1-2abf-4edc-8e34-de66e74114d2\\`), in this endpoint.\n- This endpoint acts like a PATCH method. It only updates the values that you pass in the request body (for example, the \\`name\\` property). The endpoint does not update the entire resource.\n';
export const parameters = z.object({
    responseId: z.string().describe("The response's ID."),
    collectionId: z.string().describe("The collection's ID."),
    name: z.string().describe("The response's name.").optional(),
    description: z.string().nullable().describe("The response's description.").optional(),
    url: z.string().nullable().describe("The associated request's URL.").optional(),
    method: z
        .preprocess((v) => (typeof v === 'string' ? v.toUpperCase() : v), z.enum([
        'GET',
        'PUT',
        'POST',
        'PATCH',
        'DELETE',
        'COPY',
        'HEAD',
        'OPTIONS',
        'LINK',
        'UNLINK',
        'PURGE',
        'LOCK',
        'UNLOCK',
        'PROPFIND',
        'VIEW',
    ]))
        .describe("The request's HTTP method.")
        .optional(),
    headers: z
        .array(z
        .object({
        key: z
            .string()
            .describe("The header's key, such as `Content-Type` or `X-Custom-Header`."),
        value: z.string().describe("The header key's value."),
        description: z.string().nullable().describe("The header's description.").optional(),
    })
        .describe('Information about the header.'))
        .describe('A list of headers.')
        .optional(),
    dataMode: z
        .enum(['raw', 'urlencoded', 'formdata', 'binary', 'graphql'])
        .describe("The associated request body's data mode.")
        .optional(),
    rawModeData: z
        .string()
        .nullable()
        .describe("The associated request body's raw mode data.")
        .optional(),
    dataOptions: z
        .object({
        raw: z
            .object({ language: z.string().describe("The raw mode data's language type.").optional() })
            .describe('Options for the `raw` data mode.')
            .optional(),
        urlencoded: z
            .record(z.string(), z.unknown())
            .describe('Options for the `urlencoded` data mode.')
            .optional(),
        params: z
            .record(z.string(), z.unknown())
            .describe('Options for the `params` data mode.')
            .optional(),
        binary: z
            .record(z.string(), z.unknown())
            .describe('Options for the `binary` data mode.')
            .optional(),
        graphql: z
            .record(z.string(), z.unknown())
            .describe('Options for the `graphql` data mode.')
            .optional(),
    })
        .nullable()
        .describe("Additional configurations and options set for the request body's various data modes.")
        .optional(),
    responseCode: z
        .object({
        code: z.number().describe("The response's HTTP response status code.").optional(),
        name: z.string().describe('The name of the status code.').optional(),
    })
        .describe("The response's HTTP response code information.")
        .optional(),
    status: z.string().nullable().describe("The response's HTTP status text.").optional(),
    time: z
        .string()
        .describe('The time taken by the request to complete, in milliseconds.')
        .optional(),
    cookies: z.string().nullable().describe("The response's cookie data.").optional(),
    mime: z.string().nullable().describe("The response's MIME type.").optional(),
    text: z.string().describe('The raw text of the response body.').optional(),
    language: z.string().describe("The response body's language type.").optional(),
    rawDataType: z.string().nullable().describe("The response's raw data type.").optional(),
    requestObject: z
        .string()
        .describe('A JSON-stringified representation of the associated request.')
        .optional(),
});
export const annotations = {
    title: 'Updates a response in a collection. For a complete list of properties, see the [Postman Collection Format documentation](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).',
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(args, extra) {
    try {
        const endpoint = `/collections/${args.collectionId}/responses/${args.responseId}`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (args.name !== undefined)
            bodyPayload.name = args.name;
        if (args.description !== undefined)
            bodyPayload.description = args.description;
        if (args.url !== undefined)
            bodyPayload.url = args.url;
        if (args.method !== undefined)
            bodyPayload.method = args.method;
        if (args.headers !== undefined)
            bodyPayload.headers = args.headers;
        if (args.dataMode !== undefined)
            bodyPayload.dataMode = args.dataMode;
        if (args.rawModeData !== undefined)
            bodyPayload.rawModeData = args.rawModeData;
        if (args.dataOptions !== undefined)
            bodyPayload.dataOptions = args.dataOptions;
        if (args.responseCode !== undefined)
            bodyPayload.responseCode = args.responseCode;
        if (args.status !== undefined)
            bodyPayload.status = args.status;
        if (args.time !== undefined)
            bodyPayload.time = args.time;
        if (args.cookies !== undefined)
            bodyPayload.cookies = args.cookies;
        if (args.mime !== undefined)
            bodyPayload.mime = args.mime;
        if (args.text !== undefined)
            bodyPayload.text = args.text;
        if (args.language !== undefined)
            bodyPayload.language = args.language;
        if (args.rawDataType !== undefined)
            bodyPayload.rawDataType = args.rawDataType;
        if (args.requestObject !== undefined)
            bodyPayload.requestObject = args.requestObject;
        const options = {
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
    }
    catch (e) {
        if (e instanceof McpError) {
            throw e;
        }
        throw asMcpError(e);
    }
}
