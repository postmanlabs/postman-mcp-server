import { z } from 'zod';
import { PostmanAPIClient } from '../clients/postman.js';
import { IsomorphicHeaders, CallToolResult, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { ServerContext, asMcpError, McpError } from './utils/toolHelpers.js';
import { env } from '../env.js';

export const method = 'searchLearningCenter';

export const description = `Search the official Postman documentation and learning resources at https://learning.postman.com.

Use this tool when you need authoritative, up-to-date guidance on how to use Postman features — for example creating mock servers, writing tests, using environments, configuring monitors, or any "how do I…" question about the Postman product. Returns relevant documentation passages with their source URLs.

Do not use this tool to search a user's own Postman resources (collections, workspaces, specs) — use \`searchPostmanElements\` for that.`;

export const parameters = z.object({
  query: z
    .string()
    .min(1)
    .max(512)
    .describe(
      'The search query to run against the Postman documentation (e.g. "how to create a mock server", "write a test script", "set a collection variable").'
    ),
});

export const annotations = {
  title: 'Search the Postman Learning Center',
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
};

/** Name of the search tool exposed by the remote Learning Center MCP server. */
const REMOTE_TOOL_NAME = 'searchDocs';

/**
 * Minimal shape of a JSON-RPC response from the remote MCP server. We only
 * read `result` (a CallToolResult) and `error`.
 */
interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number | string | null;
  result?: CallToolResult;
  error?: { code: number; message: string; data?: unknown };
}

/**
 * The remote MCP server responds with a Streamable HTTP body that may be
 * either plain JSON or an SSE stream (`event: message\ndata: {...}`). This
 * extracts the JSON-RPC payload from whichever framing was used.
 */
function parseMcpResponseBody(body: string, contentType: string): JsonRpcResponse {
  const trimmed = body.trim();

  if (contentType.includes('text/event-stream') || trimmed.startsWith('event:')) {
    // The server sends a single JSON-RPC response as one SSE `message` event.
    // Per the SSE spec a payload may span multiple `data:` lines, so join them.
    const dataLines = trimmed
      .split(/\r?\n/)
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice('data:'.length).trim());

    if (dataLines.length === 0) {
      throw new Error('Learning Center MCP server returned an empty SSE response.');
    }
    return JSON.parse(dataLines.join('')) as JsonRpcResponse;
  }

  return JSON.parse(trimmed) as JsonRpcResponse;
}

export async function handler(
  args: z.infer<typeof parameters>,
  _extra: { client: PostmanAPIClient; headers?: IsomorphicHeaders; serverContext?: ServerContext }
): Promise<CallToolResult> {
  try {
    const response = await fetch(env.POSTMAN_LEARNING_CENTER_MCP_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: REMOTE_TOOL_NAME,
          arguments: { query: args.query },
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new McpError(
        ErrorCode.InternalError,
        `Learning Center search failed: ${response.status} ${response.statusText}${
          text ? ` — ${text.slice(0, 500)}` : ''
        }`
      );
    }

    const rawBody = await response.text();
    const parsed = parseMcpResponseBody(rawBody, response.headers.get('content-type') ?? '');

    if (parsed.error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Learning Center search error: ${parsed.error.message}`
      );
    }

    if (!parsed.result) {
      throw new McpError(ErrorCode.InternalError, 'Learning Center search returned no result.');
    }

    return parsed.result;
  } catch (e: unknown) {
    if (e instanceof McpError) {
      throw e;
    }
    throw asMcpError(e);
  }
}
