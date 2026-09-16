import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

export { McpError };

export interface ServerContext {
  serverType: 'full' | 'minimal' | 'code' | 'learn' | 'contextGraph';
  availableTools: string[];
}

export function asMcpError(error: unknown): McpError {
  const cause = (error as any)?.cause ?? String(error);
  return new McpError(ErrorCode.InternalError, cause);
}

/**
 * The annotation hints a tool module exports.
 *
 * Every field is required on purpose. Generated tools always emit all four hints
 * because the generator derives them, but hand-written tools set theirs by hand and
 * silently omitted `openWorldHint` for a long time — an absent hint falls back to the
 * protocol default rather than to anything considered. Requiring the full set means a
 * missing or misspelled hint is a compile error instead of a silent default.
 */
export interface ToolAnnotations {
  /** Human-readable tool name shown to users. */
  title: string;
  /** True when the tool only reads and never writes. */
  readOnlyHint: boolean;
  /**
   * True when the tool may destroy, revoke, or displace something: it removes data,
   * takes away access someone had, moves rather than copies, or runs code the caller
   * did not write. Clients gate confirmation prompts on this, so understating it is
   * the dangerous direction to be wrong in.
   */
  destructiveHint: boolean;
  /** True when repeating the call with the same arguments has no additional effect. */
  idempotentHint: boolean;
  /**
   * True when the tool reaches an open-ended set of external systems. Reads and
   * writes confined to Postman are closed; running a user-authored collection, whose
   * requests may point anywhere, is not.
   */
  openWorldHint: boolean;
}

/**
 * Declares a hand-written tool's annotations.
 *
 * Generated tools get their hints from the generator, which derives them from the
 * HTTP method and applies the `x-mcp-annotations` overlay override. Hand-written
 * tools have no spec operation, so the overlay cannot reach them; this is their
 * equivalent guardrail. Passing an incomplete object or misspelling a hint fails
 * type-checking, which runs as part of the build.
 */
export function defineToolAnnotations(annotations: ToolAnnotations): ToolAnnotations {
  return annotations;
}
