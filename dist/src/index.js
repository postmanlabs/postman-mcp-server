#!/usr/bin/env tsx
import dotenv from 'dotenv';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from '@modelcontextprotocol/sdk/types.js';
import zodToJsonSchema from 'zod-to-json-schema';
import packageJson from '../package.json' with { type: 'json' };
import { readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
async function loadAllTools() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const toolsDir = join(__dirname, 'tools');
    try {
        const files = await readdir(toolsDir);
        const toolFiles = files.filter((file) => file.endsWith('.js'));
        const tools = [];
        for (const file of toolFiles) {
            try {
                const toolPath = join(toolsDir, file);
                const isWindows = process.platform === 'win32';
                const toolModule = await import(isWindows ? `file://${toolPath}` : toolPath);
                if (toolModule.method &&
                    toolModule.description &&
                    toolModule.parameters &&
                    toolModule.handler) {
                    tools.push(toolModule);
                }
                else {
                    console.warn(`Tool module ${file} is missing required exports. Skipping.`);
                }
            }
            catch (error) {
                console.error(`Failed to load tool ${file}:`, error);
            }
        }
        return tools;
    }
    catch (error) {
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
    info(message, sessionId = null) {
        const sessionPart = sessionId ? `[SessionId: ${sessionId}] ` : '';
        console.log(`[${this.timestamp()}] [INFO] ${sessionPart}${message}`);
    },
    debug(message, sessionId = null) {
        const sessionPart = sessionId ? `[SessionId: ${sessionId}] ` : '';
        console.log(`[${this.timestamp()}] [DEBUG] ${sessionPart}${message}`);
    },
    warn(message, sessionId = null) {
        const sessionPart = sessionId ? `[SessionId: ${sessionId}] ` : '';
        console.warn(`[${this.timestamp()}] [WARN] ${sessionPart}${message}`);
    },
    error(message, error = null, sessionId = null) {
        const sessionPart = sessionId ? `[SessionId: ${sessionId}] ` : '';
        console.error(`[${this.timestamp()}] [ERROR] ${sessionPart}${message}`, error || '');
    },
};
let currentApiKey = undefined;
const allGeneratedTools = await loadAllTools();
logger.info(`Dynamically loaded ${allGeneratedTools.length} tools...`);
async function run() {
    logger.info(`Transport mode: Stdio`);
    const server = new Server({ name: SERVER_NAME, version: APP_VERSION }, { capabilities: { tools: {} } });
    server.onerror = (error) => logger.error('[MCP Server Error]', error);
    process.on('SIGINT', async () => {
        logger.info('SIGINT received, shutting down server...');
        await server.close();
        process.exit(0);
    });
    logger.info(`Registering ${allGeneratedTools.length} tools...`);
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
            const result = await tool.handler(args, {
                apiKey: currentApiKey,
                headers: extra.requestInfo?.headers,
            });
            return result;
        }
        catch (error) {
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
        logger.error('API key is required. Set the POSTMAN_API_KEY environment variable.');
        process.exit(1);
    }
    logger.info(`[${SERVER_NAME} - Stdio Transport] running.`);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info('Stdio transport connected. Waiting for messages...');
}
run().catch((error) => {
    logger.error('Unhandled error during server execution:', error);
    process.exit(1);
});
