#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ErrorCode, isInitializeRequest, McpError, } from '@modelcontextprotocol/sdk/types.js';
import { readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { enabledResources } from './enabledResources.js';
import { PostmanAPIClient } from './clients/postman.js';
import { SERVER_NAME, APP_VERSION } from './constants.js';
import { env } from './env.js';
import { createTemplateRenderer } from './tools/utils/templateRenderer.js';
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
    env.POSTMAN_API_BASE_URL = SUPPORTED_REGIONS[region];
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
    const generatedToolsDir = join(__dirname, './tools');
    const isWindows = process.platform === 'win32';
    const tools = [];
    try {
        log('info', 'Loading tools from directory', { toolsDir: generatedToolsDir });
        const files = await readdir(generatedToolsDir);
        const toolFiles = files.filter((file) => file.endsWith('.js'));
        log('debug', 'Discovered tool files', { count: toolFiles.length });
        for (const file of toolFiles) {
            try {
                const toolPath = join(generatedToolsDir, file);
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
    }
    catch (error) {
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
    if (dotEnvOutput.error.code !== 'ENOENT') {
        log('error', `Error loading .env file: ${dotEnvOutput.error}`);
        process.exit(1);
    }
}
else {
    log('info', `Environment variables loaded: ${dotEnvOutput.parsed ? Object.keys(dotEnvOutput.parsed).length : 0} environment variables: ${Object.keys(dotEnvOutput.parsed || {}).join(', ')}`);
}
let clientInfo = undefined;
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
        }
        else {
            log('error', `Invalid region: ${region}`);
            console.error(`Supported regions: ${Object.keys(SUPPORTED_REGIONS).join(', ')}`);
            process.exit(1);
        }
    }
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
    const minimalTools = allGeneratedTools.filter((t) => enabledResources.minimal.includes(t.method));
    const codeTools = allGeneratedTools.filter((t) => enabledResources.code.includes(t.method));
    const tools = useCode ? codeTools : useFull ? fullTools : minimalTools;
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
    const serverContext = {
        serverType: useCode ? 'code' : useFull ? 'full' : 'minimal',
        availableTools: tools.map((t) => t.method),
    };
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const viewsDir = join(__dirname, './views');
    const renderTemplate = createTemplateRenderer(viewsDir);
    const client = new PostmanAPIClient(apiKey, undefined, serverContext);
    log('info', 'Registering tools with McpServer');
    for (const tool of tools) {
        server.registerTool(tool.method, {
            description: tool.description,
            inputSchema: tool.parameters.shape,
            annotations: tool.annotations || {},
        }, async (args, extra) => {
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
                    serverContext,
                });
                const durationMs = Date.now() - start;
                log('info', `Tool invocation completed: ${toolName} (${durationMs}ms)`, {
                    toolName,
                    durationMs,
                });
                if (result.content?.[0]?.type === 'text') {
                    const rendered = renderTemplate(toolName, result.content[0].text);
                    if (rendered) {
                        return { content: [{ type: 'text', text: rendered }] };
                    }
                }
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
    const toolsetName = useCode ? 'code' : useFull ? 'full' : 'minimal';
    logBoth(server, 'info', `Server connected and ready: ${SERVER_NAME}@${APP_VERSION} with ${tools.length} tools (${toolsetName})`);
}
run().catch((error) => {
    log('error', 'Unhandled error during server execution', {
        error: String(error?.message || error),
    });
    process.exit(1);
});
