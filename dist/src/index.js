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
                }
            }
            catch {
            }
        }
        return tools;
    }
    catch {
        return [];
    }
}
dotenv.config();
const SERVER_NAME = packageJson.name;
const APP_VERSION = packageJson.version;
export const USER_AGENT = `${SERVER_NAME}/${APP_VERSION}`;
let currentApiKey = undefined;
const allGeneratedTools = await loadAllTools();
async function run() {
    const server = new Server({ name: SERVER_NAME, version: APP_VERSION }, { capabilities: { tools: {}, logging: {} } });
    server.onerror = (_error) => { };
    process.on('SIGINT', async () => {
        await server.close();
        process.exit(0);
    });
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
        process.exit(1);
    }
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
run().catch(() => {
    process.exit(1);
});
