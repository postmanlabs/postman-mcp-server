#!/usr/bin/env tsx

import dotenv from 'dotenv';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import {
  CallToolRequestSchema,
  ErrorCode,
  IsomorphicHeaders,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import zodToJsonSchema from 'zod-to-json-schema';
import packageJson from '../package.json' with { type: 'json' };
import { readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { z } from 'zod';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const suffix = context ? ` ${JSON.stringify(context)}` : '';
  console.error(`[${timestamp}] [${level.toUpperCase()}] ${message}${suffix}`);
}

function sendClientLog(server: Server, level: LogLevel, data: string) {
  try {
    (server as any).sendLoggingMessage?.({ level, data });
  } catch {
    // ignore
  }
}

function logBoth(
  server: Server | null | undefined,
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
) {
  log(level, message, context);
  if (server) sendClientLog(server, level, message);
}

interface ToolModule {
  method: string;
  description: string;
  parameters: z.ZodSchema;
  annotations?: {
    title?: string;
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
  };
  handler: (
    params: any,
    extra: { apiKey: string; headers?: IsomorphicHeaders }
  ) => Promise<{
    content: Array<{ type: string; text: string } & Record<string, unknown>>;
  }>;
}

async function loadAllTools(): Promise<ToolModule[]> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const toolsDir = join(__dirname, 'tools');

  try {
    log('info', 'Loading tools from directory', { toolsDir });
    const files = await readdir(toolsDir);
    const toolFiles = files.filter((file) => file.endsWith('.js'));
    log('debug', 'Discovered tool files', { count: toolFiles.length });

    const tools: ToolModule[] = [];

    for (const file of toolFiles) {
      try {
        const toolPath = join(toolsDir, file);
        // If the OS is windows, prepend 'file://' to the path
        const isWindows = process.platform === 'win32';
        const toolModule = await import(isWindows ? `file://${toolPath}` : toolPath);

        if (
          toolModule.method &&
          toolModule.description &&
          toolModule.parameters &&
          toolModule.handler
        ) {
          tools.push(toolModule as ToolModule);
          log('info', 'Loaded tool', { method: toolModule.method, file });
        } else {
          log('warn', 'Tool module missing required exports; skipping', { file });
        }
      } catch (error: any) {
        log('error', 'Failed to load tool module', {
          file,
          error: String(error?.message || error),
        });
      }
    }

    log('info', 'Tool loading completed', { totalLoaded: tools.length });
    return tools;
  } catch (error: any) {
    log('error', 'Failed to read tools directory', {
      toolsDir,
      error: String(error?.message || error),
    });
    return [];
  }
}

dotenv.config();

const SERVER_NAME = packageJson.name;
const APP_VERSION = packageJson.version;
export const USER_AGENT = `${SERVER_NAME}/${APP_VERSION}`;

let currentApiKey: string | undefined = undefined;

const allGeneratedTools = await loadAllTools();
log('info', 'Server initialization starting', {
  serverName: SERVER_NAME,
  version: APP_VERSION,
  toolCount: allGeneratedTools.length,
});

async function run() {
  const server = new Server(
    { name: SERVER_NAME, version: APP_VERSION },
    { capabilities: { tools: {}, logging: {} } }
  );

  // Surface MCP server errors to stderr and notify client if possible
  (server as any).onerror = (error: unknown) => {
    const msg = String((error as any)?.message || error);
    logBoth(server, 'error', `MCP server error: ${msg}`, { error: msg });
  };

  process.on('SIGINT', async () => {
    logBoth(server, 'warn', 'SIGINT received; shutting down');
    await server.close();
    process.exit(0);
  });

  log('info', 'Setting up request handlers');

  server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
    const toolName = request.params.name;
    const tool = allGeneratedTools.find((t) => t.method === toolName);

    // Keep start event on stderr only to reduce client noise
    log('info', `Tool invocation started: ${toolName}`, { toolName });

    if (!tool) {
      // Unknown tool: log to stderr; error response is sufficient for client
      log('warn', `Unknown tool requested: ${toolName}`, { toolName });
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
    }

    const args = request.params.arguments || {};

    try {
      const start = Date.now();
      if (!currentApiKey) {
        log('error', 'Missing API key for tool invocation', { toolName });
        throw new McpError(ErrorCode.InvalidParams, 'API key is required.');
      }

      const result = await tool.handler(args as any, {
        apiKey: currentApiKey,
        headers: extra.requestInfo?.headers,
      });

      const durationMs = Date.now() - start;
      // Completion: stderr only to avoid spamming client logs
      log('info', `Tool invocation completed: ${toolName} (${durationMs}ms)`, {
        toolName,
        durationMs,
      });
      return result;
    } catch (error: any) {
      const errMsg = String(error?.message || error);
      // Failures: notify both server stderr and client
      logBoth(server, 'error', `Tool invocation failed: ${toolName}: ${errMsg}`, { toolName });
      if (error instanceof McpError) throw error;
      throw new McpError(ErrorCode.InternalError, `API error: ${error.message}`);
    }
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    // Debug-only on stderr; avoid client notification noise
    log('debug', `Tools list requested; ${allGeneratedTools.length} tools available`, {
      toolCount: allGeneratedTools.length,
    });
    const transformedTools = allGeneratedTools.map((tool) => ({
      name: tool.method,
      description: tool.description,
      inputSchema: zodToJsonSchema(tool.parameters),
      annotations: tool.annotations,
    }));
    return { tools: transformedTools };
  });

  currentApiKey = process.env.POSTMAN_API_KEY;
  if (!currentApiKey) {
    log('error', 'POSTMAN_API_KEY is required');
    process.exit(1);
  }
  log('info', 'Starting stdio transport');
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logBoth(
    server,
    'info',
    `Server connected and ready: ${SERVER_NAME}@${APP_VERSION} with ${allGeneratedTools.length} tools`
  );
}

run().catch((error: unknown) => {
  log('error', 'Unhandled error during server execution', {
    error: String((error as any)?.message || error),
  });
  process.exit(1);
});
