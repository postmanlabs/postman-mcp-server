import { z } from 'zod';
import { fetchPostmanAPI, ContentType } from '../clients/postman.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export const method = 'updateSpecFile';
export const description = "Updates an API specification's file.\n\n**Note:**\n\n- This endpoint does not accept an empty request body. You must pass one of the accepted values.\n- This endpoint does not accept multiple request body properties in a single call. For example, you cannot pass both the \\`content\\` and \\`type\\` property at the same time.\n- Multi-file specifications can only have one root file.\n- When updating a file type to \\`ROOT\\`, the previous root file is updated to the \\`DEFAULT\\` file type.\n- Files cannot exceed a maximum of 10 MB in size.\n";
export const parameters = z.object({
    specId: z.string().describe("The spec's ID."),
    filePath: z.string().describe('The path to the file.'),
    name: z.string().describe("The file's name.").optional(),
    type: z
        .enum(['DEFAULT', 'ROOT'])
        .describe('The type of file:\n- `ROOT` — The file containing the full OpenAPI structure. This serves as the entry point for the API spec and references other (`DEFAULT`) spec files. Multi-file specs can only have one root file.\n- `DEFAULT` — A file referenced by the `ROOT` file.\n')
        .optional(),
    content: z.string().describe("The specification's stringified contents.").optional(),
});
export const annotations = {
    title: "Updates an API specification's file.\n\n**Note:**\n\n- This endpoint does not accept an empty request body. You must pass one of the accepted values.\n- This endpoint does not accept multiple request body properties in a single call. For example, you cannot pass both the \\`content\\` and \\`type\\` property at the same time.\n- Multi-file specifications can only have one root file.\n- When updating a file type to \\`ROOT\\`, the previous root file is updated to the \\`DEFAULT\\` file type.\n- Files cannot exceed a maximum of 10 MB in size.\n",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
};
export async function handler(params, extra) {
    try {
        const endpoint = `/specs/${params.specId}/files/${params.filePath}`;
        const query = new URLSearchParams();
        const url = query.toString() ? `${endpoint}?${query.toString()}` : endpoint;
        const bodyPayload = {};
        if (params.name !== undefined)
            bodyPayload.name = params.name;
        if (params.type !== undefined)
            bodyPayload.type = params.type;
        if (params.content !== undefined)
            bodyPayload.content = params.content;
        const result = await fetchPostmanAPI(url, {
            method: 'PATCH',
            body: JSON.stringify(bodyPayload),
            contentType: ContentType.Json,
            apiKey: extra.apiKey,
            headers: extra.headers,
        });
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
