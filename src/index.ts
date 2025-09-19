#!/usr/bin/env node

import dotenv from 'dotenv';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { InitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import {
  ErrorCode,
  isInitializeRequest,
  IsomorphicHeaders,
  McpError,
  CallToolResult,
} from '@modelcontextprotocol/sdk/types.js';

import packageJson from '../package.json' with { type: 'json' };
import { readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { z } from 'zod';
import { enabledResources } from './enabledResources.js';
import { PostmanAPIClient } from './clients/postman.js';

const SUPPORTED_REGIONS = {
  us: 'https://api.postman.com',
  eu: 'https://api.eu.postman.com',
} as const;

function isValidRegion(region: string): region is keyof typeof SUPPORTED_REGIONS {
  return region in SUPPORTED_REGIONS;
}

function setRegionEnvironment(region: string): void {
  if (!isValidRegion(region)) {
    throw new Error(`Invalid region: ${region}. Supported regions: us, eu`);
  }
  process.env.POSTMAN_API_BASE_URL = SUPPORTED_REGIONS[region];
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const suffix = context ? ` ${JSON.stringify(context)}` : '';
  console.error(`[${timestamp}] [${level.toUpperCase()}] ${message}${suffix}`);
}

function sendClientLog(server: McpServer, level: LogLevel, data: string) {
  try {
    (server as any).sendLoggingMessage?.({ level, data });
  } catch {
    // ignore
  }
}

function logBoth(
  server: McpServer | null | undefined,
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
) {
  log(level, message, context);
  if (server) sendClientLog(server, level, message);
}

type FullResourceMethod = (typeof enabledResources.full)[number];
type MinimalResourceMethod = (typeof enabledResources.minimal)[number];
type EnabledResourceMethod = FullResourceMethod;

interface ToolModule {
  method: EnabledResourceMethod;
  description: string;
  parameters: z.ZodObject<any>;
  annotations?: {
    title?: string;
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
  };
  handler: (
    args: any,
    extra: {
      client: PostmanAPIClient;
      headers?: IsomorphicHeaders;
    }
  ) => Promise<CallToolResult>;
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

let clientInfo: InitializeRequest['params']['clientInfo'] | undefined = undefined;

async function run() {
  const args = process.argv.slice(2);
  const useFull = args.includes('--full');

  const regionIndex = args.findIndex((arg) => arg === '--region');
  if (regionIndex !== -1 && regionIndex + 1 < args.length) {
    const region = args[regionIndex + 1];
    if (isValidRegion(region)) {
      setRegionEnvironment(region);
      log('info', `Using region: ${region}`, {
        region,
        baseUrl: process.env.POSTMAN_API_BASE_URL,
      });
    } else {
      log('error', `Invalid region: ${region}`);
      console.error(`Supported regions: ${Object.keys(SUPPORTED_REGIONS).join(', ')}`);
      process.exit(1);
    }
  }

  // For STDIO mode, validate API key is available in environment
  const apiKey = process.env.POSTMAN_API_KEY;
  if (!apiKey) {
    log('error', 'POSTMAN_API_KEY environment variable is required for STDIO mode');
    process.exit(1);
  }

  const allGeneratedTools = await loadAllTools();
  log('info', 'Server initialization starting', {
    serverName: SERVER_NAME,
    version: APP_VERSION,
    toolCount: allGeneratedTools.length,
  });

  const fullTools = allGeneratedTools.filter((t) => enabledResources.full.includes(t.method));
  const minimalTools = allGeneratedTools.filter((t) =>
    enabledResources.minimal.includes(t.method as MinimalResourceMethod)
  );
  const tools = useFull ? fullTools : minimalTools;

  // Create McpServer instance
  const server = new McpServer({ name: SERVER_NAME, version: APP_VERSION });

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

  // Create a client instance with the API key for STDIO mode
  const client = new PostmanAPIClient(apiKey);

  log('info', 'Registering tools with McpServer');

  // Register all tools using the McpServer .tool() method
  for (const tool of tools) {
    server.tool(
      tool.method,
      tool.description,
      tool.parameters.shape,
      tool.annotations || {},
      async (args, extra) => {
        const toolName = tool.method;
        // Keep start event on stderr only to reduce client noise
        log('info', `Tool invocation started: ${toolName}`, { toolName });

        try {
          const start = Date.now();

          const result = await tool.handler(args, {
            client,
            headers: {
              ...extra?.requestInfo?.headers,
              'user-agent': clientInfo?.name,
            },
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
      }
    );
  }

  // API key validation is handled by the singleton client
  log('info', 'Starting stdio transport');
  const transport = new StdioServerTransport();
  transport.onmessage = (message) => {
    if (isInitializeRequest(message)) {
      clientInfo = message.params.clientInfo;
      log('debug', '📥 Received MCP initialize request', { clientInfo });
    }
  };
  await server.connect(transport);
  logBoth(
    server,
    'info',
    `Server connected and ready: ${SERVER_NAME}@${APP_VERSION} with ${tools.length} tools (${useFull ? 'full' : 'minimal'})`
  );
}

run().catch((error: unknown) => {
  log('error', 'Unhandled error during server execution', {
    error: String((error as any)?.message || error),
  });
  process.exit(1);
});
