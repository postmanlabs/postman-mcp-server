import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import { WorkspaceDataFactory, EnvironmentDataFactory, } from './factories/dataFactory.js';
describe('Postman MCP - Direct Integration Tests', () => {
    let client;
    let serverProcess;
    let createdWorkspaceIds = [];
    let createdEnvironmentIds = [];
    beforeAll(async () => {
        console.log('🚀 Starting Postman MCP server for integration tests...');
        const cleanEnv = Object.fromEntries(Object.entries(process.env).filter(([_, value]) => value !== undefined));
        cleanEnv.NODE_ENV = 'test';
        serverProcess = spawn('node', ['dist/src/index.js'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: cleanEnv,
        });
        await new Promise((resolve) => setTimeout(resolve, 3000));
        client = new Client({
            name: 'integration-test-client',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        const transport = new StdioClientTransport({
            command: 'node',
            args: ['dist/src/index.js'],
            env: cleanEnv,
        });
        await client.connect(transport);
        console.log('✅ Connected to MCP server');
    }, 30000);
    afterAll(async () => {
        await cleanupAllTestResources();
        if (client) {
            await client.close();
        }
        if (serverProcess && !serverProcess.killed) {
            serverProcess.kill();
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        console.log('🧹 Integration test cleanup completed');
    }, 30000);
    beforeEach(() => {
        createdWorkspaceIds = [];
        createdEnvironmentIds = [];
    });
    afterEach(async () => {
        await cleanupTestWorkspaces(createdWorkspaceIds);
        await cleanupTestEnvironments(createdEnvironmentIds);
        createdWorkspaceIds = [];
        createdEnvironmentIds = [];
    });
    describe('Workspace Workflow', () => {
        it('should create, list, search, update, and delete a single workspace', async () => {
            const workspaceData = WorkspaceDataFactory.createWorkspace();
            const workspaceId = await createWorkspace(workspaceData);
            createdWorkspaceIds.push(workspaceId);
            expect(createdWorkspaceIds).toHaveLength(1);
            expect(createdWorkspaceIds[0]).toBe(workspaceId);
            const listResult = await client.callTool({
                name: 'get-workspaces',
                arguments: {},
            });
            expect(WorkspaceDataFactory.validateResponse(listResult)).toBe(true);
            expect(listResult.content[0].text).toContain(workspaceId);
            const searchResult = await client.callTool({
                name: 'get-workspace',
                arguments: { workspaceId },
            });
            expect(WorkspaceDataFactory.validateResponse(searchResult)).toBe(true);
            expect(searchResult.content[0].text).toContain(workspaceData.name);
            const updatedName = '[Integration Test] Updated Workspace';
            const updateResult = await client.callTool({
                name: 'update-workspace',
                arguments: {
                    workspaceId,
                    workspace: { name: updatedName, type: 'personal' },
                },
            });
            expect(WorkspaceDataFactory.validateResponse(updateResult)).toBe(true);
            const verifyUpdateResult = await client.callTool({
                name: 'get-workspace',
                arguments: {
                    workspaceId,
                },
            });
            expect(WorkspaceDataFactory.validateResponse(verifyUpdateResult)).toBe(true);
            expect(verifyUpdateResult.content[0].text).toContain(updatedName);
        });
    });
    describe('Environment Workflow', () => {
        it('should create, list, search, update, and delete a single environment', async () => {
            const environmentData = EnvironmentDataFactory.createEnvironment();
            const environmentId = await createEnvironment(environmentData);
            createdEnvironmentIds.push(environmentId);
            expect(createdEnvironmentIds).toHaveLength(1);
            expect(createdEnvironmentIds[0]).toBe(environmentId);
            const listResult = await client.callTool({
                name: 'get-environments',
                arguments: {},
            });
            expect(EnvironmentDataFactory.validateResponse(listResult)).toBe(true);
            expect(listResult.content[0].text).toContain(environmentId);
            const getResult = await client.callTool({
                name: 'get-environment',
                arguments: { environmentId },
            });
            expect(EnvironmentDataFactory.validateResponse(getResult)).toBe(true);
            expect(getResult.content[0].text).toContain(environmentData.name);
            const updatedName = '[Integration Test] Updated Environment';
            const updatedEnvironment = {
                name: updatedName,
                values: [
                    {
                        enabled: true,
                        key: 'updated_var',
                        value: 'updated_value',
                        type: 'default',
                    },
                ],
            };
            const updateResult = await client.callTool({
                name: 'put-environment',
                arguments: {
                    environmentId,
                    environment: updatedEnvironment,
                },
            });
            expect(EnvironmentDataFactory.validateResponse(updateResult)).toBe(true);
            const verifyUpdateResult = await client.callTool({
                name: 'get-environment',
                arguments: {
                    environmentId,
                },
            });
            expect(EnvironmentDataFactory.validateResponse(verifyUpdateResult)).toBe(true);
            expect(verifyUpdateResult.content[0].text).toContain(updatedName);
            expect(verifyUpdateResult.content[0].text).toContain('updated_var');
        });
        it('should create and delete a minimal environment', async () => {
            const environmentData = EnvironmentDataFactory.createMinimalEnvironment();
            const environmentId = await createEnvironment(environmentData);
            createdEnvironmentIds.push(environmentId);
            const getResult = await client.callTool({
                name: 'get-environment',
                arguments: { environmentId },
            });
            expect(EnvironmentDataFactory.validateResponse(getResult)).toBe(true);
            expect(getResult.content[0].text).toContain(environmentData.name);
        });
    });
    async function createWorkspace(workspaceData) {
        const result = await client.callTool({
            name: 'create-workspace',
            arguments: {
                workspace: workspaceData,
            },
        });
        if (result.isError) {
            throw new Error(result.content[0].text);
        }
        expect(WorkspaceDataFactory.validateResponse(result)).toBe(true);
        const workspaceId = WorkspaceDataFactory.extractIdFromResponse(result);
        if (!workspaceId) {
            throw new Error(`Workspace ID not found in response: ${JSON.stringify(result)}`);
        }
        return workspaceId;
    }
    async function createEnvironment(environmentData) {
        const result = await client.callTool({
            name: 'create-environment',
            arguments: {
                environment: environmentData,
            },
        });
        if (result.isError) {
            throw new Error(result.content[0].text);
        }
        expect(EnvironmentDataFactory.validateResponse(result)).toBe(true);
        const environmentId = EnvironmentDataFactory.extractIdFromResponse(result);
        if (!environmentId) {
            throw new Error(`Environment ID not found in response: ${JSON.stringify(result)}`);
        }
        return environmentId;
    }
    async function cleanupTestWorkspaces(workspaceIds) {
        for (const workspaceId of workspaceIds) {
            try {
                await client.callTool({
                    name: 'delete-workspace',
                    arguments: {
                        workspaceId,
                    },
                });
            }
            catch (error) {
                console.warn(`Failed to cleanup workspace ${workspaceId}:`, String(error));
            }
        }
    }
    async function cleanupTestEnvironments(environmentIds) {
        for (const environmentId of environmentIds) {
            try {
                await client.callTool({
                    name: 'delete-environment',
                    arguments: {
                        environmentId,
                    },
                });
            }
            catch (error) {
                console.warn(`Failed to cleanup environment ${environmentId}:`, String(error));
            }
        }
    }
    async function cleanupAllTestResources() {
        console.log('Cleaning up all test resources...');
        await cleanupTestWorkspaces(createdWorkspaceIds);
        await cleanupTestEnvironments(createdEnvironmentIds);
    }
});
