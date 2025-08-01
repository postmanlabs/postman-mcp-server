import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { EnvironmentDataFactory, TestEnvironment } from '../factories/environmentDataFactory.js';

describe('Postman MCP - Environment Direct Integration Tests', () => {
  let client: Client;
  let serverProcess: ChildProcess;
  let testFactory: EnvironmentDataFactory;
  let createdEnvironmentIds: string[] = [];

  beforeAll(async () => {
    console.log('🚀 Starting Postman MCP server for environment tests...');

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
        name: 'environment-integration-test-client',
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
    console.log('✅ Connected to MCP server for environment tests');

    testFactory = new EnvironmentDataFactory();
  }, 30000);

  afterAll(async () => {
    await cleanupAllTestEnvironments();

    if (client) {
      await client.close();
    }

    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    logPerformanceSummary();

    console.log('🧹 Environment integration test cleanup completed');
  }, 30000);

  beforeEach(() => {
    testFactory.clearPerformanceMetrics();
    createdEnvironmentIds = [];
  });

  afterEach(async () => {
    await cleanupTestEnvironments(createdEnvironmentIds);
    createdEnvironmentIds = [];
  });

  describe('Tool Availability and Basic Functionality', () => {
    it('should list environments', async () => {
      const startTime = testFactory.startTimer();

      try {
        const result = await client.callTool({
          name: 'get-environments',
          arguments: {},
        });

        testFactory.endTimer('get-environments', startTime, true);

        expect(EnvironmentDataFactory.validateEnvironmentResponse(result)).toBe(true);
        expect((result.content as any)[0].type).equals('text');
        const text = (result.content as any)[0].text;
        expect(() => JSON.parse(text)).not.toThrow();
        expect(JSON.parse(text)).toBeInstanceOf(Object);
      } catch (error) {
        testFactory.endTimer('get-environments', startTime, false, String(error));
        throw error;
      }
    });
  });

  describe('Environment Workflow', () => {
    describe('Single Environment Operations', () => {
      it('should create, list, search, update, and delete a single environment', async () => {
        const environmentData = EnvironmentDataFactory.createEnvironment();

        // Create environment
        const environmentId = await createEnvironment(environmentData);
        createdEnvironmentIds.push(environmentId);

        expect(createdEnvironmentIds).toHaveLength(1);
        expect(createdEnvironmentIds[0]).toBe(environmentId);

        // List environments - verify the created environment appears in the list
        const listStartTime = testFactory.startTimer();
        const listResult = await client.callTool({
          name: 'get-environments',
          arguments: {},
        });
        testFactory.endTimer('list-environments', listStartTime, !listResult.isError);
        expect(EnvironmentDataFactory.validateEnvironmentResponse(listResult)).toBe(true);
        expect((listResult.content as any)[0].text).toContain(environmentId);

        // Get specific environment
        const getStartTime = testFactory.startTimer();
        const getResult = await client.callTool({
          name: 'get-environment',
          arguments: { environmentId },
        });
        testFactory.endTimer('get-environment', getStartTime, !getResult.isError);
        expect(EnvironmentDataFactory.validateEnvironmentResponse(getResult)).toBe(true);
        expect((getResult.content as any)[0].text).toContain(environmentData.name);

        // Update environment using PUT (replace all contents)
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
        expect(EnvironmentDataFactory.validateEnvironmentResponse(updateResult)).toBe(true);

        // Verify the update
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
        expect(EnvironmentDataFactory.validateEnvironmentResponse(verifyUpdateResult)).toBe(true);
        expect((verifyUpdateResult.content as any)[0].text).toContain(updatedName);
        expect((verifyUpdateResult.content as any)[0].text).toContain('updated_var');
      });

      it('should create and delete a minimal environment', async () => {
        const environmentData = EnvironmentDataFactory.createMinimalEnvironment();

        // Create minimal environment
        const environmentId = await createEnvironment(environmentData);
        createdEnvironmentIds.push(environmentId);

        // Verify creation
        const getStartTime = testFactory.startTimer();
        const getResult = await client.callTool({
          name: 'get-environment',
          arguments: { environmentId },
        });
        testFactory.endTimer('get-minimal-environment', getStartTime, !getResult.isError);
        expect(EnvironmentDataFactory.validateEnvironmentResponse(getResult)).toBe(true);
        expect((getResult.content as any)[0].text).toContain(environmentData.name);

        // Delete will be handled by cleanup
      });
    });

    describe('Multiple Environment Operations', () => {
      it('should create, manage, and cleanup multiple environments', async () => {
        const environment1 = EnvironmentDataFactory.createEnvironment({
          name: '[Integration Test] Environment 1',
        });
        const environment2 = EnvironmentDataFactory.createEnvironment({
          name: '[Integration Test] Environment 2',
          values: [
            {
              enabled: true,
              key: 'env2_var',
              value: 'env2_value',
              type: 'default',
            },
          ],
        });

        // Create multiple environments
        const env1Id = await createEnvironment(environment1);
        const env2Id = await createEnvironment(environment2);

        createdEnvironmentIds.push(env1Id, env2Id);

        expect(createdEnvironmentIds).toHaveLength(2);

        // Verify both environments exist
        const listStartTime = testFactory.startTimer();
        const listResult = await client.callTool({
          name: 'get-environments',
          arguments: {},
        });
        testFactory.endTimer('list-multiple-environments', listStartTime, !listResult.isError);

        const listText = (listResult.content as any)[0].text;
        expect(listText).toContain(env1Id);
        expect(listText).toContain(env2Id);
        expect(listText).toContain(environment1.name);
        expect(listText).toContain(environment2.name);
      });
    });
  });

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

      expect(EnvironmentDataFactory.validateEnvironmentResponse(result)).toBe(true);

      const environmentId = EnvironmentDataFactory.extractEnvironmentIdFromResponse(result);

      if (!environmentId) {
        throw new Error(`Environment ID not found in response: ${JSON.stringify(result)}`);
      }

      return environmentId;
    } catch (error) {
      testFactory.endTimer('create-environment', startTime, false, String(error));
      throw error;
    }
  }

  // Helper Functions
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
        const deleteStartTime = testFactory.startTimer();
        testFactory.endTimer('delete-environment', deleteStartTime, false, String(error));
        console.warn(`Failed to cleanup environment ${environmentId}:`, String(error));
      }
    }
  }

  async function cleanupAllTestEnvironments(): Promise<void> {
    console.log('Cleaning up all test environments');
    const allEnvironmentIds = testFactory.getCreatedEnvironmentIds();
    await cleanupTestEnvironments(allEnvironmentIds);
    testFactory.clearCreatedEnvironmentIds();
  }

  function logPerformanceSummary(): void {
    const metrics = testFactory.getPerformanceMetrics();
    if (metrics.length === 0) return;

    console.log('\n📈 Environment Performance Summary:');

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
      const outputPath = path.resolve(process.cwd(), 'environment-benchmark-results.json');
      fs.writeFileSync(outputPath, JSON.stringify(benchmarkData, null, 2));
      console.log(`\n📄 Environment benchmark data saved to ${outputPath}`);
    } catch (e) {
      console.error('Failed to write environment benchmark results', e);
    }
  }
});
