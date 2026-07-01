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
import { enabledResources } from './enabledResources.js';
import { PostmanAPIClient } from './clients/postman.js';
import { SERVER_NAME, APP_VERSION } from './constants.js';
import { ServerContext } from './tools/utils/toolHelpers.js';
import { env } from './env.js';
import { createTemplateRenderer } from './tools/utils/templateRenderer.js';
import { createErrorTemplateRenderer } from './tools/utils/errorTemplateRenderer.js';
import {
  createTelemetryClient,
  detectPaginationUsed,
  parseTelemetryFlag,
  TelemetrySession,
  type ITelemetryClient,
} from './telemetry/index.js';

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

type EnabledResourceMethod = (typeof enabledResources.full)[number];

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
  // Match the extension of the running entrypoint: tsx runs us from .ts,
  // node runs the compiled .js from dist/. Avoids needing a dev-mode flag.
  const ext = __filename.endsWith('.ts') ? '.ts' : '.js';

  const tools: ToolModule[] = [];

  try {
    log('info', 'Loading tools from directory', { toolsDir: generatedToolsDir, ext });
    const files = await readdir(generatedToolsDir);
    const toolFiles = files.filter((file) => file.endsWith(ext));
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

let clientInfo: InitializeRequest['params']['clientInfo'] | undefined = undefined;

async function run() {
  const args = process.argv.slice(2);
  const useFull = args.includes('--full');
  const useCode = args.includes('--code');
  const useLearn = args.includes('--learn');

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

  const enabledMethods = useLearn
    ? enabledResources.learn
    : useCode
      ? enabledResources.code
      : useFull
        ? enabledResources.full
        : enabledResources.minimal;

  // Sort alphabetically for deterministic tools/list ordering (MCP spec minor change #3).
  const toolSorter = (a: ToolModule, b: ToolModule) =>
    a.method < b.method ? -1 : a.method > b.method ? 1 : 0;
  const tools = allGeneratedTools
    .filter((t) => (enabledMethods as readonly string[]).includes(t.method))
    .sort(toolSorter);

  // Determine region for telemetry
  const region: 'us' | 'eu' =
    regionIndex !== -1 && regionIndex + 1 < args.length && isValidRegion(args[regionIndex + 1])
      ? (args[regionIndex + 1] as 'us' | 'eu')
      : 'us';

  // Telemetry is OFF by default for the open-source STDIO server. Users must
  // opt in explicitly with POSTMAN_MCP_TELEMETRY=true; any other value (or
  // unset) keeps telemetry disabled.
  const telemetryEnabled = parseTelemetryFlag(process.env.POSTMAN_MCP_TELEMETRY) ?? false;
  if (telemetryEnabled) {
    log(
      'info',
      'Telemetry enabled (POSTMAN_MCP_TELEMETRY=true). Set POSTMAN_MCP_TELEMETRY=false to disable.'
    );
  }
  const telemetry: ITelemetryClient = createTelemetryClient({
    telemetryEnabled,
    apiKey,
  });

  // STDIO is single-session per process: one TelemetrySession lives for the
  // lifetime of the server, mutated only by setClientInfo at the initialize
  // handshake. All telemetry events emit against this same session.
  const telemetrySession = new TelemetrySession({
    installId: TelemetrySession.loadOrCreateInstallIdFromDisk(),
    region,
    transport: 'stdio',
    toolset: useLearn ? 'learn' : useCode ? 'code' : useFull ? 'full' : 'minimal',
    serverVersion: APP_VERSION,
  });
  telemetrySession.setToolNames(tools.map((t: any) => t.method));

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
      ? {
          instructions:
            'Before answering any API-related questions, fetch the MCP resource at URI `postman://instructions` using FetchMcpResource from this MCP server, and follow the usage instructions contained within.',
        }
      : {}
  );

  // Surface MCP server errors to stderr and notify client if possible
  (server as any).onerror = (error: unknown) => {
    const msg = String((error as any)?.message || error);
    logBoth(server, 'error', `MCP server error: ${msg}`, { error: msg });
  };

  process.on('SIGINT', async () => {
    logBoth(server, 'warn', 'SIGINT received; shutting down');
    await telemetry.shutdown();
    await server.close();
    process.exit(0);
  });

  // Create server context that will be passed to all tools
  const serverContext: ServerContext = {
    serverType: useLearn ? 'learn' : useCode ? 'code' : useFull ? 'full' : 'minimal',
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

        const start = Date.now();
        const paginationUsed = detectPaginationUsed(args as Record<string, unknown>);
        const metaRaw = extra?._meta ? JSON.stringify(extra._meta) : '';
        try {
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

          // Telemetry: successful tool call
          telemetry.toolCall(telemetrySession, {
            toolName,
            args: args as Record<string, unknown>,
            result,
            latencyMs: durationMs,
            isError: result.isError ?? false,
            authMethod: 'api_key',
            paginationUsed,
            meta: extra?._meta
              ? {
                  trigger: (extra._meta as any).trigger ?? '',
                  conversation_id: (extra._meta as any).conversation_id ?? '',
                  task_type: (extra._meta as any).task_type ?? '',
                  model_name: (extra._meta as any).model_name ?? '',
                }
              : undefined,
            metaRaw,
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

          const errDurationMs = Date.now() - start;
          const errorMeta = extra?._meta
            ? {
                trigger: (extra._meta as any).trigger ?? '',
                conversation_id: (extra._meta as any).conversation_id ?? '',
                task_type: (extra._meta as any).task_type ?? '',
                model_name: (extra._meta as any).model_name ?? '',
              }
            : undefined;

          if (error instanceof McpError) {
            const httpStatus = (error.data as Record<string, unknown>)?.httpStatus;

            if (typeof httpStatus === 'number') {
              telemetry.toolCall(telemetrySession, {
                toolName,
                args: args as Record<string, unknown>,
                result: { content: [] },
                latencyMs: errDurationMs,
                isError: true,
                authMethod: 'api_key',
                paginationUsed,
                errorType: 'tool',
                errorCode:
                  typeof httpStatus === 'number' && (httpStatus === 401 || httpStatus === 403)
                    ? 'AUTH_ERROR'
                    : typeof httpStatus === 'number' && httpStatus === 429
                      ? 'RATE_LIMITED'
                      : 'UPSTREAM_ERROR',
                errorStage:
                  typeof httpStatus === 'number' && (httpStatus === 401 || httpStatus === 403)
                    ? 'auth'
                    : 'upstream',
                errorUpstream: 'postman-api',
                rateLimited: typeof httpStatus === 'number' && httpStatus === 429,
                meta: errorMeta,
                metaRaw,
              });

              const rawBody = String((error.data as Record<string, unknown>)?.cause ?? '');
              let parsedBody: Record<string, unknown> | null = null;
              try {
                parsedBody = JSON.parse(rawBody) as Record<string, unknown>;
              } catch {
                /* not JSON */
              }

              // Unwrap common { error: { ... } } API response pattern
              const errorObj =
                parsedBody?.error && typeof parsedBody.error === 'object'
                  ? (parsedBody.error as Record<string, unknown>)
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
            } else {
              telemetry.toolCall(telemetrySession, {
                toolName,
                args: args as Record<string, unknown>,
                result: { content: [] },
                latencyMs: errDurationMs,
                isError: true,
                authMethod: 'api_key',
                paginationUsed,
                errorType: 'tool',
                errorCode: 'UPSTREAM_ERROR',
                errorStage: 'upstream',
                errorUpstream: 'postman-api',
                rateLimited: false,
                meta: errorMeta,
                metaRaw,
              });
            }
            throw error;
          }

          telemetry.toolCall(telemetrySession, {
            toolName,
            args: args as Record<string, unknown>,
            result: { content: [] },
            latencyMs: errDurationMs,
            isError: true,
            authMethod: 'api_key',
            paginationUsed,
            errorType: 'protocol',
            errorCode: 'INTERNAL_ERROR',
            errorStage: '',
            meta: errorMeta,
            metaRaw,
          });
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
      // Telemetry: session_init
      telemetrySession.setClientInfo(
        { name: clientInfo?.name ?? 'unknown', version: clientInfo?.version ?? 'unknown' },
        message.params.protocolVersion ?? ''
      );
      telemetrySession.setClientCapabilities(message.params.capabilities);
      telemetry.sessionInit(telemetrySession, {
        clientCapabilities: telemetrySession.clientCapabilities,
        serverCapabilities: ['tools', 'resources'],
      });
    }
  };
  await server.connect(transport);
  const toolsetName = useLearn ? 'learn' : useCode ? 'code' : useFull ? 'full' : 'minimal';
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
