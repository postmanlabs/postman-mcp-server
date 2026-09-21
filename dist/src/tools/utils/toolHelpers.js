import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
export { McpError };
export function asMcpError(error) {
    const cause = error?.cause ?? String(error);
    return new McpError(ErrorCode.InternalError, cause);
}
export function defineToolAnnotations(annotations) {
    return annotations;
}
