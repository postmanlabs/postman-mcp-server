import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

export { McpError };

export interface ServerContext {
  serverType: 'full' | 'minimal' | 'code';
  availableTools: string[];
}

export function asMcpError(error: unknown): McpError {
  const cause = (error as any)?.cause ?? String(error);
  return new McpError(ErrorCode.InternalError, cause);
}
