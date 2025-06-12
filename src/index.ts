#!/usr/bin/env tsx

import dotenv from 'dotenv';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import zodToJsonSchema from 'zod-to-json-schema';
import packageJson from '../package.json' with { type: 'json' };
import { readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { z } from 'zod';

import { createApp } from './servers/express.js';

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
    extra: { apiKey: string }
  ) => Promise<{
    content: Array<{ type: string; text: string } & Record<string, unknown>>;
  }>;
}

async function loadAllTools(): Promise<ToolModule[]> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const toolsDir = join(__dirname, 'tools');

  try {
    const files = await readdir(toolsDir);
    const toolFiles = files.filter((file) => file.endsWith('.js'));

    const tools: ToolModule[] = [];

    for (const file of toolFiles) {
      try {
        const toolPath = join(toolsDir, file);
        const toolModule = await import(toolPath);

        if (
          toolModule.method &&
          toolModule.description &&
          toolModule.parameters &&
          toolModule.handler
        ) {
          tools.push(toolModule as ToolModule);
        } else {
          console.warn(`Tool module ${file} is missing required exports. Skipping.`);
        }
      } catch (error) {
        console.error(`Failed to load tool ${file}:`, error);
      }
    }

    return tools;
  } catch (error) {
    console.error('Failed to read tools directory:', error);
    return [];
  }
}

dotenv.config();

const SERVER_NAME = packageJson.name;
const APP_VERSION = packageJson.version;
export const USER_AGENT = `${SERVER_NAME}/${APP_VERSION}`;

const logger = {
  timestamp() {
    return new Date().toISOString();
  },
  info(message: string, sessionId: string | null = null) {
    const sessionPart = sessionId ? `[SessionId: ${sessionId}] ` : '';
    console.log(`[${this.timestamp()}] [INFO] ${sessionPart}${message}`);
  },
  debug(message: string, sessionId: string | null = null) {
    const sessionPart = sessionId ? `[SessionId: ${sessionId}] ` : '';
    console.log(`[${this.timestamp()}] [DEBUG] ${sessionPart}${message}`);
  },
  warn(message: string, sessionId: string | null = null) {
    const sessionPart = sessionId ? `[SessionId: ${sessionId}] ` : '';
    console.warn(`[${this.timestamp()}] [WARN] ${sessionPart}${message}`);
  },
  error(message: string, error: any = null, sessionId: string | null = null) {
    const sessionPart = sessionId ? `[SessionId: ${sessionId}] ` : '';
    console.error(`[${this.timestamp()}] [ERROR] ${sessionPart}${message}`, error || '');
  },
};

let currentApiKey: string | undefined = undefined;

async function run() {
  const args = process.argv.slice(2);
  const isSSE = args.includes('--sse') || process.env.MCP_TRANSPORT === 'sse';
  logger.info(`Transport mode determined: ${isSSE ? 'HTTP/SSE' : 'Stdio'}`);

  const allGeneratedTools = await loadAllTools();
  logger.info(`Dynamically loaded ${allGeneratedTools.length} tools...`);

  const server = new Server(
    { name: SERVER_NAME, version: APP_VERSION },
    { capabilities: { tools: {} } }
  );

  server.onerror = (error: any) => logger.error('[MCP Server Error]', error);

  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down server...');
    await server.close();
    process.exit(0);
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    const tool = allGeneratedTools.find((t) => t.method === toolName);

    if (!tool) {
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
    }

    const args = request.params.arguments || {};

    try {
      if (!currentApiKey) {
        throw new McpError(ErrorCode.InvalidParams, 'API key is required.');
      }

      const result = await tool.handler(args as any, { apiKey: currentApiKey });
      return result;
    } catch (error: any) {
      throw new McpError(ErrorCode.InternalError, `API error: ${error.message}`, {
        originalError: error,
      });
    }
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const transformedTools = allGeneratedTools.map((tool) => ({
      name: tool.method,
      description: tool.description,
      inputSchema: zodToJsonSchema(tool.parameters),
      annotations: tool.annotations,
    }));
    return { tools: transformedTools };
  });

  if (isSSE) {
    const apiKeyCb = (key: string | undefined) => {
      currentApiKey = key;
      logger.info('API key set successfully.');
    };
    const app = createApp(server, logger, apiKeyCb);
    const port = process.env.PORT || 1337;
    const httpServer = app.listen(port, () => {
      logger.info(`[${SERVER_NAME} - HTTP/SSE Server] running on port ${port}.`);
    });
    process.on('SIGINT', () => {
      httpServer.close(() => logger.info('HTTP server closed.'));
    });
  } else {
    currentApiKey = process.env.POSTMAN_API_KEY;
    if (!currentApiKey) {
      logger.error('API key is required. Set the POSTMAN_API_KEY environment variable.');
      process.exit(1);
    }
    logger.info(`[${SERVER_NAME} - Stdio Transport] running.`);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info('Stdio transport connected. Waiting for messages...');
  }
}

run().catch((error) => {
  logger.error('Unhandled error during server execution:', error);
  process.exit(1);
});
