import { describe, it, expect, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

describe('Docker MCP Gateway Compatibility', () => {
  afterAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  it('should connect successfully with default logging (validates the fix)', async () => {
    // Key test: Docker MCP Gateway needs clean JSON-RPC on stdio
    const client = new Client(
      { name: 'docker-mcp-test', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );

    const transport = new StdioClientTransport({
      command: 'node',
      args: ['dist/src/index.js'], // Default = error-level logging (minimal)
      env: { ...process.env, NODE_ENV: 'test' },
    });

    try {
      // Before fix: failed with "invalid character 'd'" due to log pollution
      // After fix: should succeed with clean stdio
      await client.connect(transport);

      const result = await client.callTool(
        { name: 'getAuthenticatedUser', arguments: {} },
        undefined,
        { timeout: 5000 }
      );

      expect(result.isError).toBe(false);
    } finally {
      await client.close();
    }
  }, 15000);
});