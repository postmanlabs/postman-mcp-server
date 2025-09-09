#!/usr/bin/env node
import dotenv from 'dotenv';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, isInitializeRequest, ListToolsRequestSchema, McpError, } from '@modelcontextprotocol/sdk/types.js';
import zodToJsonSchema from 'zod-to-json-schema';
import packageJson from '../package.json' with { type: 'json' };
import { readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { enabledResources } from './enabledResources.js';
function log(level, message, context) {
    const timestamp = new Date().toISOString();
    const suffix = context ? ` ${JSON.stringify(context)}` : '';
    console.error(`[${timestamp}] [${level.toUpperCase()}] ${message}${suffix}`);
}
function sendClientLog(server, level, data) {
    try {
        server.sendLoggingMessage?.({ level, data });
    }
    catch {
    }
}
function logBoth(server, level, message, context) {
    log(level, message, context);
    if (server)
        sendClientLog(server, level, message);
}
async function loadAllTools() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const toolsDir = join(__dirname, 'tools');
    try {
        log('info', 'Loading tools from directory', { toolsDir });
        const files = await readdir(toolsDir);
        const toolFiles = files.filter((file) => file.endsWith('.js'));
        log('debug', 'Discovered tool files', { count: toolFiles.length });
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
                    log('info', 'Loaded tool', { method: toolModule.method, file });
                }
                else {
                    log('warn', 'Tool module missing required exports; skipping', { file });
                }
            }
            catch (error) {
                log('error', 'Failed to load tool module', {
                    file,
                    error: String(error?.message || error),
                });
            }
        }
        log('info', 'Tool loading completed', { totalLoaded: tools.length });
        return tools;
    }
    catch (error) {
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
let currentApiKey = undefined;
let clientInfo = undefined;
const allGeneratedTools = await loadAllTools();
log('info', 'Server initialization starting', {
    serverName: SERVER_NAME,
    version: APP_VERSION,
    toolCount: allGeneratedTools.length,
});
async function run() {
    const args = process.argv.slice(2);
    const useFull = args.includes('--full');
    const fullTools = allGeneratedTools.filter((t) => enabledResources.full.includes(t.method));
    const minimalTools = allGeneratedTools.filter((t) => enabledResources.minimal.includes(t.method));
    const tools = useFull ? fullTools : minimalTools;
    const server = new Server({ name: SERVER_NAME, version: APP_VERSION }, { capabilities: { tools: {}, logging: {} } });
    server.onerror = (error) => {
        const msg = String(error?.message || error);
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
        const tool = tools.find((t) => t.method === toolName);
        log('info', `Tool invocation started: ${toolName}`, { toolName });
        if (!tool) {
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
            const result = await tool.handler(args, {
                apiKey: currentApiKey,
                headers: {
                    ...extra.requestInfo?.headers,
                    'user-agent': clientInfo?.name,
                },
            });
            const durationMs = Date.now() - start;
            log('info', `Tool invocation completed: ${toolName} (${durationMs}ms)`, {
                toolName,
                durationMs,
            });
            return result;
        }
        catch (error) {
            const errMsg = String(error?.message || error);
            logBoth(server, 'error', `Tool invocation failed: ${toolName}: ${errMsg}`, { toolName });
            if (error instanceof McpError)
                throw error;
            throw new McpError(ErrorCode.InternalError, `API error: ${error.message}`);
        }
    });
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        log('debug', `Tools list requested; ${tools.length} tools available`, {
            toolCount: tools.length,
        });
        const transformedTools = tools.map((tool) => ({
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
    transport.onmessage = (message) => {
        if (isInitializeRequest(message)) {
            clientInfo = message.params.clientInfo;
            log('debug', '📥 Received MCP initialize request', { clientInfo });
        }
    };
    await server.connect(transport);
    logBoth(server, 'info', `Server connected and ready: ${SERVER_NAME}@${APP_VERSION} with ${tools.length} tools (${useFull ? 'full' : 'minimal'})`);
}
run().catch((error) => {
    log('error', 'Unhandled error during server execution', {
        error: String(error?.message || error),
    });
    process.exit(1);
});
