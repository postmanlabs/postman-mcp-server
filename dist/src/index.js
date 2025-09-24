#!/usr/bin/env node
import dotenv from 'dotenv';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ErrorCode, isInitializeRequest, McpError, } from '@modelcontextprotocol/sdk/types.js';
import packageJson from '../package.json' with { type: 'json' };
import { readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { enabledResources } from './enabledResources.js';
import { PostmanAPIClient } from './clients/postman.js';
const SUPPORTED_REGIONS = {
    us: 'https://api.postman.com',
    eu: 'https://api.eu.postman.com',
};
function isValidRegion(region) {
    return region in SUPPORTED_REGIONS;
}
function setRegionEnvironment(region) {
    if (!isValidRegion(region)) {
        throw new Error(`Invalid region: ${region}. Supported regions: us, eu`);
    }
    process.env.POSTMAN_API_BASE_URL = SUPPORTED_REGIONS[region];
}
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
let clientInfo = undefined;
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
        }
        else {
            log('error', `Invalid region: ${region}`);
            console.error(`Supported regions: ${Object.keys(SUPPORTED_REGIONS).join(', ')}`);
            process.exit(1);
        }
    }
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
    const minimalTools = allGeneratedTools.filter((t) => enabledResources.minimal.includes(t.method));
    const tools = useFull ? fullTools : minimalTools;
    const server = new McpServer({ name: SERVER_NAME, version: APP_VERSION });
    server.onerror = (error) => {
        const msg = String(error?.message || error);
        logBoth(server, 'error', `MCP server error: ${msg}`, { error: msg });
    };
    process.on('SIGINT', async () => {
        logBoth(server, 'warn', 'SIGINT received; shutting down');
        await server.close();
        process.exit(0);
    });
    const client = new PostmanAPIClient(apiKey);
    log('info', 'Registering tools with McpServer');
    for (const tool of tools) {
        server.tool(tool.method, tool.description, tool.parameters.shape, tool.annotations || {}, async (args, extra) => {
            const toolName = tool.method;
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
