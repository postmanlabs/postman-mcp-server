import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
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

  describe('Workspace Workflow',{ timeout: 30000 }, () => {
    it('should create, list, search, update, and delete a single workspace', async () => {
      const workspaceData = WorkspaceDataFactory.createWorkspace();
      const workspaceId = await createWorkspace(workspaceData);
      createdWorkspaceIds.push(workspaceId);

      expect(createdWorkspaceIds).toHaveLength(1);
      expect(createdWorkspaceIds[0]).toBe(workspaceId);

      const listResult = await client.callTool({
        name: 'getWorkspaces',
        arguments: {},
      });
      expect(WorkspaceDataFactory.validateResponse(listResult)).toBe(true);
      expect((listResult.content as any)[0].text).toContain(workspaceId);

      const searchResult = await client.callTool({
        name: 'getWorkspace',
        arguments: { workspaceId },
      });
      expect(WorkspaceDataFactory.validateResponse(searchResult)).toBe(true);
      expect((searchResult.content as any)[0].text).toContain(workspaceData.name);

      const updatedName = '[Integration Test] Updated Workspace';
      const updateResult = await client.callTool({
        name: 'updateWorkspace',
        arguments: {
          workspaceId,
          workspace: { name: updatedName, type: 'personal' },
        },
      });
      expect(WorkspaceDataFactory.validateResponse(updateResult)).toBe(true);

      const verifyUpdateResult = await client.callTool({
        name: 'getWorkspace',
        arguments: {
          workspaceId,
        },
      });
      expect(WorkspaceDataFactory.validateResponse(verifyUpdateResult)).toBe(true);
      expect((verifyUpdateResult.content as any)[0].text).toContain(updatedName);
    });
  }, );

  describe('Environment Workflow', () => {
    it('should create, list, search, update, and delete a single environment', async () => {
      const environmentData = EnvironmentDataFactory.createEnvironment();
      const environmentId = await createEnvironment(environmentData);
      createdEnvironmentIds.push(environmentId);

      expect(createdEnvironmentIds).toHaveLength(1);
      expect(createdEnvironmentIds[0]).toBe(environmentId);

      const listResult = await client.callTool({
        name: 'getEnvironments',
        arguments: {},
      });
      expect(EnvironmentDataFactory.validateResponse(listResult)).toBe(true);
      expect((listResult.content as any)[0].text).toContain(environmentId);

      const getResult = await client.callTool({
        name: 'getEnvironment',
        arguments: { environmentId },
      });
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

      const updateResult = await client.callTool({
        name: 'putEnvironment',
        arguments: {
          environmentId,
          environment: updatedEnvironment,
        },
      });
      expect(EnvironmentDataFactory.validateResponse(updateResult)).toBe(true);

      const verifyUpdateResult = await client.callTool({
        name: 'getEnvironment',
        arguments: {
          environmentId,
        },
      });
      expect(EnvironmentDataFactory.validateResponse(verifyUpdateResult)).toBe(true);
      expect((verifyUpdateResult.content as any)[0].text).toContain(updatedName);
      expect((verifyUpdateResult.content as any)[0].text).toContain('updated_var');
    });

    it('should create and delete a minimal environment', async () => {
      const environmentData = EnvironmentDataFactory.createMinimalEnvironment();
      const environmentId = await createEnvironment(environmentData);
      createdEnvironmentIds.push(environmentId);

      const getResult = await client.callTool({
        name: 'getEnvironment',
        arguments: { environmentId },
      });
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
      const createResult = await client.callTool({
        name: 'createSpecFile',
        arguments: {
          specId: specId,
          ...specFileData,
        },
      });
      expect(SpecDataFactory.validateResponse(createResult)).toBe(true);
      const createdFile = SpecDataFactory.extractSpecFileFromResponse(createResult);

      expect(createdFile).toBeDefined();

      const getFilesResult = await client.callTool({
        name: 'getSpecFiles',
        arguments: { specId: specId },
      });

      expect(SpecDataFactory.validateResponse(getFilesResult)).toBe(true);
      const files = SpecDataFactory.extractSpecFilesFromResponse(getFilesResult);
      expect(files).toBeInstanceOf(Array);
      expect(files.length).toBe(2);

      const getFileResult = await client.callTool({
        name: 'getSpecFile',
        arguments: {
          specId: specId,
          filePath: specFileData.path,
        },
      });

      expect(SpecDataFactory.validateResponse(getFileResult)).toBe(true);
      const retrievedFile = SpecDataFactory.extractSpecFileFromResponse(getFileResult);
      expect(retrievedFile).toBeDefined();
      expect(retrievedFile.path).toEqual(specFileData.path);

      const updatedContent = '{ "hello": "world_updated" }';
      const updateResult = await client.callTool({
        name: 'updateSpecFile',
        arguments: {
          specId: specId,
          filePath: specFileData.path,
          content: updatedContent,
        },
      });

      expect(SpecDataFactory.validateResponse(updateResult)).toBe(true);
      const updatedFile = SpecDataFactory.extractSpecFileFromResponse(updateResult);
      expect(updatedFile.id).toEqual(createdFile?.id);

      const deleteResult = await client.callTool({
        name: 'deleteSpecFile',
        arguments: {
          specId: specId,
          filePath: specFileData.path,
        },
      });

      expect(SpecDataFactory.validateResponse(deleteResult)).toBe(true);
    });
  });

  async function createWorkspace(workspaceData: TestWorkspace): Promise<string> {
    const result = await client.callTool({
      name: 'createWorkspace',
      arguments: {
        workspace: workspaceData,
      },
    });
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

  async function createEnvironment(environmentData: TestEnvironment): Promise<string> {
    const result = await client.callTool({
      name: 'createEnvironment',
      arguments: {
        environment: environmentData,
      },
    });
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
    const result = await client.callTool({
      name: 'createSpec',
      arguments: {
        workspaceId,
        name: specData.name,
        type: specData.type,
        files: specData.files,
      },
    });

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
        await client.callTool({
          name: 'deleteWorkspace',
          arguments: {
            workspaceId,
          },
        });
      } catch (error) {
        console.warn(`Failed to cleanup workspace ${workspaceId}:`, String(error));
      }
    }
  }

  async function cleanupTestEnvironments(environmentIds: string[]): Promise<void> {
    for (const environmentId of environmentIds) {
      try {
        await client.callTool({
          name: 'deleteEnvironment',
          arguments: {
            environmentId,
          },
        });
      } catch (error) {
        console.warn(`Failed to cleanup environment ${environmentId}:`, String(error));
      }
    }
  }

  async function cleanupTestSpecs(specIds: string[]): Promise<void> {
    for (const specId of specIds) {
      try {
        await client.callTool({
          name: 'deleteSpec',
          arguments: {
            specId,
          },
        });
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
