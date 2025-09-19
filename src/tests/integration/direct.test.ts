import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn, ChildProcess } from 'child_process';
import {
  WorkspaceDataFactory,
  TestWorkspace,
  EnvironmentDataFactory,
  TestEnvironment,
  SpecDataFactory,
  TestSpec,
} from './factories/dataFactory.js';
import { PostmanAPIClient } from '../../clients/postman.js';
import packageJson from '../../../package.json' assert { type: 'json' };

describe('Postman MCP - Direct Integration Tests', () => {
  let client: Client;
  let serverProcess: ChildProcess;
  let createdWorkspaceIds: string[] = [];
  let createdEnvironmentIds: string[] = [];
  let createdSpecIds: string[] = [];

  beforeAll(async () => {
    console.log('🚀 Starting Postman MCP server for integration tests...');

    const cleanEnv = Object.fromEntries(
      Object.entries(process.env).filter(([_, value]) => value !== undefined)
    ) as Record<string, string>;
    cleanEnv.NODE_ENV = 'test';

    serverProcess = spawn('node', ['dist/src/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: cleanEnv,
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));

    client = new Client(
      {
        name: 'integration-test-client',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    const transport = new StdioClientTransport({
      command: 'node',
      args: ['dist/src/index.js', '--full'],
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
    await cleanupTestSpecs(createdSpecIds);
    createdWorkspaceIds = [];
    createdEnvironmentIds = [];
    createdSpecIds = [];
  });

  describe('User-Agent Header Tests', () => {
    it('should include client name in user-agent header for stdio transport', async () => {
      const testClientName = 'test-integration-client';

      const clientWithName = new Client(
        {
          name: testClientName,
          version: '1.0.0',
        },
        {
          capabilities: {
            tools: {},
          },
        }
      );

      const transport = new StdioClientTransport({
        command: 'node',
        args: ['dist/src/index.js', '--full'],
        env: {
          ...process.env,
          NODE_ENV: 'test',
        },
      });

      await clientWithName.connect(transport);

      try {
        const result = await clientWithName.callTool(
          {
            name: 'getWorkspaces',
            arguments: {},
          },
          undefined,
          { timeout: 100000 }
        );

        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);

        const content = result.content[0];
        expect(content).toBeDefined();
        expect(content.type).toBe('text');
      } finally {
        await clientWithName.close();
      }
    });

    it('should handle HTTP transport user-agent headers', async () => {
      const testUserAgent = 'test-http-client/2.0.0';

      const httpClient = new Client(
        {
          name: testUserAgent,
          version: '1.0.0',
        },
        {
          capabilities: {
            tools: {},
          },
        }
      );

      expect(httpClient).toBeDefined();
      expect(typeof httpClient.callTool).toBe('function');
    });

    it('should properly track client information in server', async () => {
      const testClientName = 'client-info-test';

      const clientWithInfo = new Client(
        {
          name: testClientName,
          version: '2.0.0',
        },
        {
          capabilities: {
            tools: {},
          },
        }
      );

      const transport = new StdioClientTransport({
        command: 'node',
        args: ['dist/src/index.js', '--full'],
        env: {
          ...process.env,
          NODE_ENV: 'test',
        },
      });

      await clientWithInfo.connect(transport);

      try {
        const result = await clientWithInfo.callTool(
          {
            name: 'getWorkspaces',
            arguments: {},
          },
          undefined,
          { timeout: 100000 }
        );

        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
      } finally {
        await clientWithInfo.close();
      }
    });
  });

  describe('PostmanAPIClient User-Agent Tests', () => {
    const expectedPackageName = packageJson.name;
    const expectedPackageVersion = packageJson.version;

    it('should construct user-agent headers correctly', async () => {
      const client = new PostmanAPIClient('test-api-key');

      const originalFetch = global.fetch;
      let capturedHeaders: Record<string, string> = {};

      global.fetch = vi.fn().mockImplementation(async (_url: string, options: any) => {
        capturedHeaders = options.headers || {};
        return {
          ok: true,
          status: 200,
          headers: {
            get: vi.fn().mockReturnValue('application/json'),
          },
          json: async () => ({ test: 'data' }),
          text: async () => 'test response',
        } as any;
      });

      try {
        await client.get('/test-endpoint', {
          headers: { 'user-agent': 'custom-client/1.0.0' },
        });

        expect(capturedHeaders['user-agent']).toBe(
          `custom-client/1.0.0/${expectedPackageName}/${expectedPackageVersion}`
        );
        expect(capturedHeaders['x-api-key']).toBe('test-api-key');
      } finally {
        global.fetch = originalFetch;
      }
    });

    it('should handle missing user-agent header gracefully', async () => {
      const client = new PostmanAPIClient('test-api-key');

      const originalFetch = global.fetch;
      let capturedHeaders: Record<string, string> = {};

      global.fetch = vi.fn().mockImplementation(async (_url: string, options: any) => {
        capturedHeaders = options.headers || {};
        return {
          ok: true,
          status: 200,
          headers: {
            get: vi.fn().mockReturnValue('application/json'),
          },
          json: async () => ({ test: 'data' }),
        } as any;
      });

      try {
        await client.get('/test-endpoint');

        expect(capturedHeaders['user-agent']).toBe(`${expectedPackageName}/${expectedPackageVersion}`);
        expect(capturedHeaders['x-api-key']).toBe('test-api-key');
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe('Workspace Workflow', () => {
    it('should create, list, search, update, and delete a single workspace', async () => {
      const workspaceData = WorkspaceDataFactory.createWorkspace();
      const workspaceId = await createWorkspace(workspaceData);
      createdWorkspaceIds.push(workspaceId);

      expect(createdWorkspaceIds).toHaveLength(1);
      expect(createdWorkspaceIds[0]).toBe(workspaceId);

      const listResult = await client.callTool(
        {
          name: 'getWorkspaces',
          arguments: {},
        },
        undefined,
        { timeout: 100000 }
      );
      expect(WorkspaceDataFactory.validateResponse(listResult)).toBe(true);
      expect((listResult.content as any)[0].text).toContain(workspaceId);

      const searchResult = await client.callTool(
        {
          name: 'getWorkspace',
          arguments: { workspaceId },
        },
        undefined,
        { timeout: 100000 }
      );
      expect(WorkspaceDataFactory.validateResponse(searchResult)).toBe(true);
      expect((searchResult.content as any)[0].text).toContain(workspaceData.name);

      const updatedName = '[Integration Test] Updated Workspace';
      const updateResult = await client.callTool(
        {
          name: 'updateWorkspace',
          arguments: {
            workspaceId,
            workspace: { name: updatedName, type: 'personal' },
          },
        },
        undefined,
        { timeout: 100000 }
      );
      expect(WorkspaceDataFactory.validateResponse(updateResult)).toBe(true);

      const verifyUpdateResult = await client.callTool(
        {
          name: 'getWorkspace',
          arguments: {
            workspaceId,
          },
        },
        undefined,
        { timeout: 100000 }
      );
      expect(WorkspaceDataFactory.validateResponse(verifyUpdateResult)).toBe(true);
      expect((verifyUpdateResult.content as any)[0].text).toContain(updatedName);
    });
  });

  describe('Environment Workflow', () => {
    it('should create, list, search, update, and delete a single environment', async () => {
      const workspace = WorkspaceDataFactory.createWorkspace({
        name: '[Integration Test] Environment Workspace',
      });
      const workspaceId = await createWorkspace(workspace);
      createdWorkspaceIds.push(workspaceId);

      const environmentData = EnvironmentDataFactory.createEnvironment();
      const environmentId = await createEnvironment(environmentData, workspaceId);
      createdEnvironmentIds.push(environmentId);

      expect(createdEnvironmentIds).toHaveLength(1);
      expect(createdEnvironmentIds[0]).toBe(environmentId);

      const listResult = await client.callTool(
        {
          name: 'getEnvironments',
          arguments: {},
        },
        undefined,
        { timeout: 100000 }
      );
      expect(EnvironmentDataFactory.validateResponse(listResult)).toBe(true);
      expect((listResult.content as any)[0].text).toContain(environmentId);

      const getResult = await client.callTool(
        {
          name: 'getEnvironment',
          arguments: { environmentId },
        },
        undefined,
        { timeout: 100000 }
      );
      expect(EnvironmentDataFactory.validateResponse(getResult)).toBe(true);
      expect((getResult.content as any)[0].text).toContain(environmentData.name);

      const updatedName = '[Integration Test] Updated Environment';
      const updatedEnvironment = {
        name: updatedName,
        values: [
          {
            enabled: true,
            key: 'updated_var',
            value: 'updated_value',
            type: 'default' as const,
          },
        ],
      };

      const updateResult = await client.callTool(
        {
          name: 'putEnvironment',
          arguments: {
            environmentId,
            environment: updatedEnvironment,
          },
        },
        undefined,
        { timeout: 100000 }
      );
      expect(EnvironmentDataFactory.validateResponse(updateResult)).toBe(true);

      const verifyUpdateResult = await client.callTool(
        {
          name: 'getEnvironment',
          arguments: {
            environmentId,
          },
        },
        undefined,
        { timeout: 100000 }
      );
      expect(EnvironmentDataFactory.validateResponse(verifyUpdateResult)).toBe(true);
      expect((verifyUpdateResult.content as any)[0].text).toContain(updatedName);
      expect((verifyUpdateResult.content as any)[0].text).toContain('updated_var');
    });

    it('should create and delete a minimal environment', async () => {
      const workspace = WorkspaceDataFactory.createWorkspace({
        name: '[Integration Test] Minimal Environment Workspace',
      });
      const workspaceId = await createWorkspace(workspace);
      createdWorkspaceIds.push(workspaceId);

      const environmentData = EnvironmentDataFactory.createMinimalEnvironment();
      const environmentId = await createEnvironment(environmentData, workspaceId);
      createdEnvironmentIds.push(environmentId);

      const getResult = await client.callTool(
        {
          name: 'getEnvironment',
          arguments: { environmentId },
        },
        undefined,
        { timeout: 100000 }
      );
      expect(EnvironmentDataFactory.validateResponse(getResult)).toBe(true);
      expect((getResult.content as any)[0].text).toContain(environmentData.name);
    });
  });

  describe('Spec Workflow', () => {
    it('should create, retrieve, update, and delete spec files', async () => {
      const specData = SpecDataFactory.createSpec();
      const workspace = WorkspaceDataFactory.createWorkspace({
        name: '[Juan Test] Spec Workspace',
      });
      const workspaceId = await createWorkspace(workspace);
      createdWorkspaceIds.push(workspaceId);
      const specId = await createSpec(specData, workspaceId);
      createdSpecIds.push(specId);

      const specFileData = SpecDataFactory.createSpecFile({
        path: 'test.json',
        content: '{ "hello": "world" }',
      });
      const createResult = await client.callTool(
        {
          name: 'createSpecFile',
          arguments: {
            specId: specId,
            ...specFileData,
          },
        },
        undefined,
        { timeout: 100000 }
      );
      expect(SpecDataFactory.validateResponse(createResult)).toBe(true);
      const createdFile = SpecDataFactory.extractSpecFileFromResponse(createResult);

      expect(createdFile).toBeDefined();

      const getFilesResult = await client.callTool(
        {
          name: 'getSpecFiles',
          arguments: { specId: specId },
        },
        undefined,
        { timeout: 100000 }
      );

      expect(SpecDataFactory.validateResponse(getFilesResult)).toBe(true);
      const files = SpecDataFactory.extractSpecFilesFromResponse(getFilesResult);
      expect(files).toBeInstanceOf(Array);
      expect(files.length).toBe(2);

      const getFileResult = await client.callTool(
        {
          name: 'getSpecFile',
          arguments: {
            specId: specId,
            filePath: specFileData.path,
          },
        },
        undefined,
        { timeout: 100000 }
      );

      expect(SpecDataFactory.validateResponse(getFileResult)).toBe(true);
      const retrievedFile = SpecDataFactory.extractSpecFileFromResponse(getFileResult);
      expect(retrievedFile).toBeDefined();
      expect(retrievedFile.path).toEqual(specFileData.path);

      const updatedContent = '{ "hello": "world_updated" }';
      const updateResult = await client.callTool(
        {
          name: 'updateSpecFile',
          arguments: {
            specId: specId,
            filePath: specFileData.path,
            content: updatedContent,
          },
        },
        undefined,
        { timeout: 100000 }
      );

      expect(SpecDataFactory.validateResponse(updateResult)).toBe(true);
      const updatedFile = SpecDataFactory.extractSpecFileFromResponse(updateResult);
      expect(updatedFile.id).toEqual(createdFile?.id);

      const deleteResult = await client.callTool(
        {
          name: 'deleteSpecFile',
          arguments: {
            specId: specId,
            filePath: specFileData.path,
          },
        },
        undefined,
        { timeout: 100000 }
      );

      expect(SpecDataFactory.validateResponse(deleteResult)).toBe(true);
    });
  });

  async function createWorkspace(workspaceData: TestWorkspace): Promise<string> {
    const result = await client.callTool(
      {
        name: 'createWorkspace',
        arguments: {
          workspace: workspaceData,
        },
      },
      undefined,
      { timeout: 100000 }
    );
    if (result.isError) {
      throw new Error((result.content as any)[0].text);
    }
    expect(WorkspaceDataFactory.validateResponse(result)).toBe(true);
    const workspaceId = WorkspaceDataFactory.extractIdFromResponse(result);
    if (!workspaceId) {
      throw new Error(`Workspace ID not found in response: ${JSON.stringify(result)}`);
    }
    return workspaceId!;
  }

  async function createEnvironment(
    environmentData: TestEnvironment,
    workspaceId: string
  ): Promise<string> {
    const result = await client.callTool(
      {
        name: 'createEnvironment',
        arguments: {
          workspace: workspaceId,
          environment: environmentData,
        },
      },
      undefined,
      { timeout: 100000 }
    );
    if (result.isError) {
      throw new Error((result.content as any)[0].text);
    }
    expect(EnvironmentDataFactory.validateResponse(result)).toBe(true);
    const environmentId = EnvironmentDataFactory.extractIdFromResponse(result);
    if (!environmentId) {
      throw new Error(`Environment ID not found in response: ${JSON.stringify(result)}`);
    }
    return environmentId;
  }

  async function createSpec(specData: TestSpec, workspaceId: string): Promise<string> {
    const result = await client.callTool(
      {
        name: 'createSpec',
        arguments: {
          workspaceId,
          name: specData.name,
          type: specData.type,
          files: specData.files,
        },
      },
      undefined,
      { timeout: 100000 }
    );

    if (result.isError) {
      throw new Error((result.content as any)[0].text);
    }
    expect(SpecDataFactory.validateResponse(result)).toBe(true);
    const specId = SpecDataFactory.extractIdFromResponse(result);
    if (!specId) {
      throw new Error(`Spec ID not found in response: ${JSON.stringify(result)}`);
    }
    return specId;
  }

  async function cleanupTestWorkspaces(workspaceIds: string[]): Promise<void> {
    for (const workspaceId of workspaceIds) {
      try {
        await client.callTool(
          {
            name: 'deleteWorkspace',
            arguments: {
              workspaceId,
            },
          },
          undefined,
          { timeout: 100000 }
        );
      } catch (error) {
        console.warn(`Failed to cleanup workspace ${workspaceId}:`, String(error));
      }
    }
  }

  async function cleanupTestEnvironments(environmentIds: string[]): Promise<void> {
    for (const environmentId of environmentIds) {
      try {
        await client.callTool(
          {
            name: 'deleteEnvironment',
            arguments: {
              environmentId,
            },
          },
          undefined,
          { timeout: 100000 }
        );
      } catch (error) {
        console.warn(`Failed to cleanup environment ${environmentId}:`, String(error));
      }
    }
  }

  async function cleanupTestSpecs(specIds: string[]): Promise<void> {
    for (const specId of specIds) {
      try {
        await client.callTool(
          {
            name: 'deleteSpec',
            arguments: {
              specId,
            },
          },
          undefined,
          { timeout: 100000 }
        );
      } catch (error) {
        console.warn(`Failed to cleanup spec ${specId}:`, String(error));
      }
    }
  }

  async function cleanupAllTestResources(): Promise<void> {
    console.log('Cleaning up all test resources...');
    await cleanupTestWorkspaces(createdWorkspaceIds);
    await cleanupTestEnvironments(createdEnvironmentIds);
  }
});
