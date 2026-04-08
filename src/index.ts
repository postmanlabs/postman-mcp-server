#!/usr/bin/env node

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

import { readdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { z } from 'zod';
import dotenv from 'dotenv';
import { enabledResources } from './enabledResources.js';
import { PostmanAPIClient } from './clients/postman.js';
import { SERVER_NAME, APP_VERSION } from './constants.js';
import { ServerContext } from './tools/utils/toolHelpers.js';
import { env } from './env.js';
import { createTemplateRenderer } from './tools/utils/templateRenderer.js';
import { createErrorTemplateRenderer } from './tools/utils/errorTemplateRenderer.js';

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
  env.POSTMAN_API_BASE_URL = SUPPORTED_REGIONS[region];
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const quietMode = process.argv.includes('--quiet');

function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  if (quietMode && (level === 'debug' || level === 'info')) return;
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
type CodeResourceMethod = (typeof enabledResources.code)[number];
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
      serverContext?: ServerContext;
    }
  ) => Promise<CallToolResult>;
}

async function loadAllTools(): Promise<ToolModule[]> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const generatedToolsDir = join(__dirname, './tools');

  const tools: ToolModule[] = [];

  // Load generated tools from ./tools/*.js
  try {
    log('info', 'Loading tools from directory', { toolsDir: generatedToolsDir });
    const files = await readdir(generatedToolsDir);
    const toolFiles = files.filter((file) => file.endsWith('.js'));
    log('debug', 'Discovered tool files', { count: toolFiles.length });

    const importResults = await Promise.allSettled(
      toolFiles.map(async (file) => {
        const toolPath = join(generatedToolsDir, file);
        const toolModule = await import(pathToFileURL(toolPath).href);
        return { toolModule, file };
      })
    );

    for (const result of importResults) {
      if (result.status === 'rejected') {
        log('error', 'Failed to load tool module', {
          error: String(result.reason?.message || result.reason),
        });
        continue;
      }
      const { toolModule, file } = result.value;
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
    }
  } catch (error: any) {
    log('error', 'Failed to read tools directory', {
      toolsDir: generatedToolsDir,
      error: String(error?.message || error),
    });
  }

  log('info', 'Tool loading completed', { totalLoaded: tools.length });
  return tools;
}

const dotEnvOutput = dotenv.config({ quiet: true });

if (dotEnvOutput.error) {
  if ((dotEnvOutput.error as NodeJS.ErrnoException).code !== 'ENOENT') {
    log('error', `Error loading .env file: ${dotEnvOutput.error}`);
    process.exit(1);
  }
} else {
  log(
    'info',
    `Environment variables loaded: ${dotEnvOutput.parsed ? Object.keys(dotEnvOutput.parsed).length : 0} environment variables: ${Object.keys(dotEnvOutput.parsed || {}).join(', ')}`
  );
}

let clientInfo: InitializeRequest['params']['clientInfo'] | undefined = undefined;

async function run() {
  const args = process.argv.slice(2);
  const useFull = args.includes('--full');
  const useCode = args.includes('--code');

  const regionIndex = args.findIndex((arg) => arg === '--region');
  if (regionIndex !== -1 && regionIndex + 1 < args.length) {
    const region = args[regionIndex + 1];
    if (isValidRegion(region)) {
      setRegionEnvironment(region);
      log('info', `Using region: ${region}`, {
        region,
        baseUrl: env.POSTMAN_API_BASE_URL,
      });
    } else {
      log('error', `Invalid region: ${region}`);
      console.error(`Supported regions: ${Object.keys(SUPPORTED_REGIONS).join(', ')}`);
      process.exit(1);
    }
  }

  // For STDIO mode, validate API key is available in environment
  const apiKey = env.POSTMAN_API_KEY;
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
  const codeTools = allGeneratedTools.filter((t) =>
    enabledResources.code.includes(t.method as CodeResourceMethod)
  );
  const tools = useCode ? codeTools : useFull ? fullTools : minimalTools;

  // Load instructions
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  let instructionsContent: string | undefined;
  try {
    const resourcesDir = join(__dirname, './resources');
    instructionsContent = await readFile(join(resourcesDir, 'Instructions.md'), 'utf-8');
    log('info', 'Loaded Instructions.md resource');
  } catch (error: any) {
    log('warn', 'Failed to load Instructions.md resource', {
      error: String(error?.message || error),
    });
  }

  // Create McpServer instance
  const server = new McpServer(
    { name: SERVER_NAME, version: APP_VERSION },
    instructionsContent
      ? { instructions: 'Read the instructions resource completely for detailed usage instructions before answering any API-related questions.' }
      : {}
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

  // Create server context that will be passed to all tools
  const serverContext: ServerContext = {
    serverType: useCode ? 'code' : useFull ? 'full' : 'minimal',
    availableTools: tools.map((t) => t.method),
  };
  const viewsDir = join(__dirname, './views');
  const renderTemplate = createTemplateRenderer(viewsDir);
  const errorsDir = join(__dirname, './views/errors');
  const renderErrorTemplate = createErrorTemplateRenderer(errorsDir);

  // Create a client instance with the API key and server context for STDIO mode
  const client = new PostmanAPIClient(apiKey, undefined, serverContext);

  log('info', 'Registering tools with McpServer');

  // Register all tools using the McpServer registerTool method
  for (const tool of tools) {
    server.registerTool(
      tool.method,
      {
        description: tool.description,
        inputSchema: tool.parameters.shape,
        annotations: tool.annotations || {},
      },
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
            serverContext,
          });

          const durationMs = Date.now() - start;
          // Completion: stderr only to avoid spamming client logs
          log('info', `Tool invocation completed: ${toolName} (${durationMs}ms)`, {
            toolName,
            durationMs,
          });

          // Apply template rendering
          if (result.content?.[0]?.type === 'text') {
            const rendered = renderTemplate(toolName, result.content[0].text);
            if (rendered) {
              return { content: [{ type: 'text' as const, text: rendered }] };
            }
          }

          return result;
        } catch (error: any) {
          const errMsg = String(error?.message || error);
          // Failures: notify both server stderr and client
          logBoth(server, 'error', `Tool invocation failed: ${toolName}: ${errMsg}`, { toolName });
          if (error instanceof McpError) {
            const httpStatus = (error.data as Record<string, unknown>)?.httpStatus;
            if (typeof httpStatus === 'number') {
              const rawBody = String((error.data as Record<string, unknown>)?.cause ?? '');
              let parsedBody: Record<string, unknown> | null = null;
              try { parsedBody = JSON.parse(rawBody) as Record<string, unknown>; } catch { /* not JSON */ }

              // Unwrap common { error: { ... } } API response pattern
              const errorObj = parsedBody?.error && typeof parsedBody.error === 'object'
                ? parsedBody.error as Record<string, unknown>
                : parsedBody;

              const rendered = renderErrorTemplate(toolName, httpStatus, {
                toolName,
                statusCode: httpStatus,
                args,
                errorMessage: error.message,
                errorBody: rawBody,
                error: errorObj,
              });
              if (rendered) {
                throw new McpError(error.code, rendered, error.data);
              }
            }
            throw error;
          }
          throw new McpError(ErrorCode.InternalError, `API error: ${error.message}`);
        }
      }
    );
  }

  if (instructionsContent) {
    server.registerResource(
      'instructions',
      'postman://instructions',
      { description: 'Instructions for using the Postman MCP server', mimeType: 'text/markdown' },
      async (uri) => ({
        contents: [{ uri: uri.href, mimeType: 'text/markdown', text: instructionsContent }],
      })
    );
    log('info', 'Registered resource: instructions');
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
  const toolsetName = useCode ? 'code' : useFull ? 'full' : 'minimal';
  logBoth(
    server,
    'info',
    `Server connected and ready: ${SERVER_NAME}@${APP_VERSION} with ${tools.length} tools (${toolsetName})`
  );
}

run().catch((error: unknown) => {
  log('error', 'Unhandled error during server execution', {
    error: String((error as any)?.message || error),
  });
  process.exit(1);
});
