import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn, ChildProcess } from 'child_process';
import { TestWorkspace, WorkspaceDataFactory } from '../factories/workspaceDataFactory.js';
import * as fs from 'fs';
import * as path from 'path';

describe('Postman MCP - Direct Integration Tests', () => {
  let client: Client;
  let serverProcess: ChildProcess;
  let testFactory: WorkspaceDataFactory;
  let createdWorkspaceIds: string[] = [];

  beforeAll(async () => {
    console.log('🚀 Starting Postman MCP server...');

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

    testFactory = new WorkspaceDataFactory();
  }, 30000);

  afterAll(async () => {
    await cleanupAllTestWorkspaces();

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
  });

  afterEach(async () => {
    await cleanupTestWorkspaces(createdWorkspaceIds);
    createdWorkspaceIds = [];
  });

  describe('Tool Availability and Basic Functionality', () => {
    it('should list workspaces', async () => {
      const startTime = testFactory.startTimer();

      try {
        const result = await client.callTool({
          name: 'get-workspaces',
          arguments: {},
        });

        testFactory.endTimer('get-workspaces', startTime, true);

        expect(WorkspaceDataFactory.validateWorkspaceResponse(result)).toBe(true);
        expect((result.content as any)[0].type).equals('text');
        const text = (result.content as any)[0].text;
        expect(() => JSON.parse(text)).not.toThrow();
        expect(JSON.parse(text)).toBeInstanceOf(Object);
      } catch (error) {
        testFactory.endTimer('get-workspaces', startTime, false, String(error));
        throw error;
      }
    });
  });

  describe('Workspace Workflow', () => {
    describe('Single Workspace Operations', () => {
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
        expect(WorkspaceDataFactory.validateWorkspaceResponse(listResult)).toBe(true);
        expect((listResult.content as any)[0].text).toContain(workspaceId);

        const searchStartTime = testFactory.startTimer();
        const searchResult = await client.callTool({
          name: 'get-workspace',
          arguments: { workspaceId },
        });
        testFactory.endTimer('get-workspace', searchStartTime, !searchResult.isError);
        expect(WorkspaceDataFactory.validateWorkspaceResponse(searchResult)).toBe(true);
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
        expect(WorkspaceDataFactory.validateWorkspaceResponse(updateResult)).toBe(true);

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
        expect(WorkspaceDataFactory.validateWorkspaceResponse(verifyUpdateResult)).toBe(true);
        expect((verifyUpdateResult.content as any)[0].text).toContain(updatedName);
      });
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

      expect(WorkspaceDataFactory.validateWorkspaceResponse(result)).toBe(true);

      const workspaceId = WorkspaceDataFactory.extractWorkspaceIdFromResponse(result);

      if (!workspaceId) {
        throw new Error(`Workspace ID not found in response: ${JSON.stringify(result)}`);
      }

      return workspaceId!;
    } catch (error) {
      testFactory.endTimer('create-workspace', startTime, false, String(error));
      throw error;
    }
  }

  // Helper Functions
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
        const deleteStartTime = testFactory.startTimer();
        testFactory.endTimer('delete-workspace', deleteStartTime, false, String(error));
        console.warn(`Failed to cleanup workspace ${workspaceId}:`, String(error));
      }
    }
  }

  async function cleanupAllTestWorkspaces(): Promise<void> {
    const allWorkspaceIds = testFactory.getCreatedWorkspaceIds();
    await cleanupTestWorkspaces(allWorkspaceIds);
    testFactory.clearCreatedWorkspaceIds();
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
