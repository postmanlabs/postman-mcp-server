import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import {
  WorkspaceDataFactory,
  TestWorkspace,
  EnvironmentDataFactory,
  TestEnvironment,
  TestDataFactory,
} from './factories/dataFactory.js';

describe('Postman MCP - Direct Integration Tests', () => {
  let client: Client;
  let serverProcess: ChildProcess;
  let testFactory: TestDataFactory;
  let createdWorkspaceIds: string[] = [];
  let createdEnvironmentIds: string[] = [];

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
      args: ['dist/src/index.js'],
      env: cleanEnv,
    });

    await client.connect(transport);
    console.log('✅ Connected to MCP server');

    testFactory = new TestDataFactory();
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

    logPerformanceSummary();

    console.log('🧹 Integration test cleanup completed');
  }, 30000);

  beforeEach(() => {
    testFactory.clearPerformanceMetrics();
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

      const listStartTime = testFactory.startTimer();
      const listResult = await client.callTool({
        name: 'get-workspaces',
        arguments: {},
      });
      testFactory.endTimer('list-workspaces', listStartTime, !listResult.isError);
      expect(WorkspaceDataFactory.validateResponse(listResult)).toBe(true);
      expect((listResult.content as any)[0].text).toContain(workspaceId);

      const searchStartTime = testFactory.startTimer();
      const searchResult = await client.callTool({
        name: 'get-workspace',
        arguments: { workspaceId },
      });
      testFactory.endTimer('get-workspace', searchStartTime, !searchResult.isError);
      expect(WorkspaceDataFactory.validateResponse(searchResult)).toBe(true);
      expect((searchResult.content as any)[0].text).toContain(workspaceData.name);

      const updatedName = '[Integration Test] Updated Workspace';
      const updateStartTime = testFactory.startTimer();
      const updateResult = await client.callTool({
        name: 'update-workspace',
        arguments: {
          workspaceId,
          workspace: { name: updatedName, type: 'personal' },
        },
      });
      testFactory.endTimer('update-workspace', updateStartTime, !updateResult.isError);
      expect(WorkspaceDataFactory.validateResponse(updateResult)).toBe(true);

      const verifyUpdateStartTime = testFactory.startTimer();
      const verifyUpdateResult = await client.callTool({
        name: 'get-workspace',
        arguments: {
          workspaceId,
        },
      });
      testFactory.endTimer(
        'verify-update-workspace',
        verifyUpdateStartTime,
        !verifyUpdateResult.isError
      );
      expect(WorkspaceDataFactory.validateResponse(verifyUpdateResult)).toBe(true);
      expect((verifyUpdateResult.content as any)[0].text).toContain(updatedName);
    });
  });

  describe('Environment Workflow', () => {
    it('should create, list, search, update, and delete a single environment', async () => {
      const environmentData = EnvironmentDataFactory.createEnvironment();
      const environmentId = await createEnvironment(environmentData);
      createdEnvironmentIds.push(environmentId);

      expect(createdEnvironmentIds).toHaveLength(1);
      expect(createdEnvironmentIds[0]).toBe(environmentId);

      const listStartTime = testFactory.startTimer();
      const listResult = await client.callTool({
        name: 'get-environments',
        arguments: {},
      });
      testFactory.endTimer('list-environments', listStartTime, !listResult.isError);
      expect(EnvironmentDataFactory.validateResponse(listResult)).toBe(true);
      expect((listResult.content as any)[0].text).toContain(environmentId);

      const getStartTime = testFactory.startTimer();
      const getResult = await client.callTool({
        name: 'get-environment',
        arguments: { environmentId },
      });
      testFactory.endTimer('get-environment', getStartTime, !getResult.isError);
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

      const updateStartTime = testFactory.startTimer();
      const updateResult = await client.callTool({
        name: 'put-environment',
        arguments: {
          environmentId,
          environment: updatedEnvironment,
        },
      });
      testFactory.endTimer('put-environment', updateStartTime, !updateResult.isError);
      expect(EnvironmentDataFactory.validateResponse(updateResult)).toBe(true);

      const verifyUpdateStartTime = testFactory.startTimer();
      const verifyUpdateResult = await client.callTool({
        name: 'get-environment',
        arguments: {
          environmentId,
        },
      });
      testFactory.endTimer(
        'verify-update-environment',
        verifyUpdateStartTime,
        !verifyUpdateResult.isError
      );
      expect(EnvironmentDataFactory.validateResponse(verifyUpdateResult)).toBe(true);
      expect((verifyUpdateResult.content as any)[0].text).toContain(updatedName);
      expect((verifyUpdateResult.content as any)[0].text).toContain('updated_var');
    });

    it('should create and delete a minimal environment', async () => {
      const environmentData = EnvironmentDataFactory.createMinimalEnvironment();
      const environmentId = await createEnvironment(environmentData);
      createdEnvironmentIds.push(environmentId);

      const getStartTime = testFactory.startTimer();
      const getResult = await client.callTool({
        name: 'get-environment',
        arguments: { environmentId },
      });
      testFactory.endTimer('get-minimal-environment', getStartTime, !getResult.isError);
      expect(EnvironmentDataFactory.validateResponse(getResult)).toBe(true);
      expect((getResult.content as any)[0].text).toContain(environmentData.name);
    });
  });

  async function createWorkspace(workspaceData: TestWorkspace): Promise<string> {
    const startTime = testFactory.startTimer();
    try {
      const result = await client.callTool({
        name: 'create-workspace',
        arguments: {
          workspace: workspaceData,
        },
      });
      if (result.isError) {
        throw new Error((result.content as any)[0].text);
      }
      testFactory.endTimer('create-workspace', startTime, true);
      expect(WorkspaceDataFactory.validateResponse(result)).toBe(true);
      const workspaceId = WorkspaceDataFactory.extractIdFromResponse(result);
      if (!workspaceId) {
        throw new Error(`Workspace ID not found in response: ${JSON.stringify(result)}`);
      }
      return workspaceId!;
    } catch (error) {
      testFactory.endTimer('create-workspace', startTime, false, String(error));
      throw error;
    }
  }

  async function createEnvironment(environmentData: TestEnvironment): Promise<string> {
    const startTime = testFactory.startTimer();
    try {
      const result = await client.callTool({
        name: 'create-environment',
        arguments: {
          environment: environmentData,
        },
      });
      if (result.isError) {
        throw new Error((result.content as any)[0].text);
      }
      testFactory.endTimer('create-environment', startTime, true);
      expect(EnvironmentDataFactory.validateResponse(result)).toBe(true);
      const environmentId = EnvironmentDataFactory.extractIdFromResponse(result);
      if (!environmentId) {
        throw new Error(`Environment ID not found in response: ${JSON.stringify(result)}`);
      }
      return environmentId;
    } catch (error) {
      testFactory.endTimer('create-environment', startTime, false, String(error));
      throw error;
    }
  }

  async function cleanupTestWorkspaces(workspaceIds: string[]): Promise<void> {
    for (const workspaceId of workspaceIds) {
      try {
        const deleteStartTime = testFactory.startTimer();
        const result = await client.callTool({
          name: 'delete-workspace',
          arguments: {
            workspaceId,
          },
        });
        if (result.isError) {
          throw new Error((result.content as any)[0].text);
        }
        testFactory.endTimer('delete-workspace', deleteStartTime, true);
      } catch (error) {
        testFactory.endTimer('delete-workspace', testFactory.startTimer(), false, String(error));
        console.warn(`Failed to cleanup workspace ${workspaceId}:`, String(error));
      }
    }
  }

  async function cleanupTestEnvironments(environmentIds: string[]): Promise<void> {
    for (const environmentId of environmentIds) {
      try {
        const deleteStartTime = testFactory.startTimer();
        const result = await client.callTool({
          name: 'delete-environment',
          arguments: {
            environmentId,
          },
        });
        if (result.isError) {
          throw new Error((result.content as any)[0].text);
        }
        testFactory.endTimer('delete-environment', deleteStartTime, true);
      } catch (error) {
        testFactory.endTimer(
          'delete-environment',
          testFactory.startTimer(),
          false,
          String(error)
        );
        console.warn(`Failed to cleanup environment ${environmentId}:`, String(error));
      }
    }
  }

  async function cleanupAllTestResources(): Promise<void> {
    console.log('Cleaning up all test resources...');
    await cleanupTestWorkspaces(createdWorkspaceIds);
    await cleanupTestEnvironments(createdEnvironmentIds);
  }

  function logPerformanceSummary(): void {
    const metrics = testFactory.getPerformanceMetrics();
    if (metrics.length === 0) return;

    console.log('\n📈 Final Performance Summary:');

    const byOperation = metrics.reduce(
      (acc, metric) => {
        if (!acc[metric.operation]) {
          acc[metric.operation] = {
            count: 0,
            totalDuration: 0,
            successCount: 0,
            errors: [],
          };
        }
        acc[metric.operation].count++;
        acc[metric.operation].totalDuration += metric.duration;
        if (metric.success) {
          acc[metric.operation].successCount++;
        } else if (metric.error) {
          acc[metric.operation].errors.push(metric.error);
        }
        return acc;
      },
      {} as Record<
        string,
        { count: number; totalDuration: number; successCount: number; errors: string[] }
      >
    );

    const benchmarkData: { name: string; unit: string; value: number }[] = [];

    Object.entries(byOperation).forEach(([operation, stats]) => {
      const avgDuration = stats.count > 0 ? Math.round(stats.totalDuration / stats.count) : 0;
      const successRate =
        stats.count > 0 ? Math.round((stats.successCount / stats.count) * 100) : 0;

      console.log(`  ${operation}:`);
      console.log(`    Calls: ${stats.count}`);
      console.log(`    Avg Duration: ${avgDuration}ms`);
      console.log(`    Success Rate: ${successRate}%`);

      if (stats.errors.length > 0) {
        console.log(`    Errors: ${stats.errors.length}`);
      }

      benchmarkData.push({
        name: `${operation} - duration`,
        unit: 'ms',
        value: avgDuration,
      });

      benchmarkData.push({
        name: `${operation} - success rate`,
        unit: '%',
        value: successRate,
      });
    });

    try {
      const outputPath = path.resolve(process.cwd(), 'benchmark-results.json');
      fs.writeFileSync(outputPath, JSON.stringify(benchmarkData, null, 2));
      console.log(`\n📄 Benchmark data saved to ${outputPath}`);
    } catch (e) {
      console.error('Failed to write benchmark results', e);
    }
  }
});
