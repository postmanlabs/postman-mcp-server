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
    const files = await readdir(toolsDir);
    const toolFiles = files.filter((file) => file.endsWith('.js'));

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
        } else {
          // Intentionally no console logging; rely on MCP logging once server is initialized
        }
      } catch {
        // Intentionally no console logging; rely on MCP logging once server is initialized
      }
    }

    return tools;
  } catch {
    // Intentionally no console logging; rely on MCP logging once server is initialized
    return [];
  }
}

dotenv.config();

const SERVER_NAME = packageJson.name;
const APP_VERSION = packageJson.version;
export const USER_AGENT = `${SERVER_NAME}/${APP_VERSION}`;

let currentApiKey: string | undefined = undefined;

const allGeneratedTools = await loadAllTools();

async function run() {
  const server = new Server(
    { name: SERVER_NAME, version: APP_VERSION },
    { capabilities: { tools: {}, logging: {} } }
  );

  server.onerror = (_error: any) => {};

  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });

  // Logging handled by MCP framework/clients; avoid explicit logs

  server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
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

      const result = await tool.handler(args as any, {
        apiKey: currentApiKey,
        headers: extra.requestInfo?.headers,
      });
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

  currentApiKey = process.env.POSTMAN_API_KEY;
  if (!currentApiKey) {
    // Avoid explicit logging; exit with failure
    process.exit(1);
  }
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

run().catch(() => {
  // Avoid console logging per requirements; exit with failure
  process.exit(1);
});
