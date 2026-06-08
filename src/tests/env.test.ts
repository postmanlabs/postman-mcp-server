import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { parameters as createRequestParameters } from '../tools/createCollectionRequest.js';
import { toJsonSchemaCompat } from '@modelcontextprotocol/sdk/server/zod-json-schema-compat.js';
import { objectFromShape } from '@modelcontextprotocol/sdk/server/zod-compat.js';

const envModuleUrl = new URL('../../dist/src/env.js', import.meta.url).href;

describe('env loading', () => {
  it('does not write dotenv info messages to stdout when .env is missing', () => {
    const dir = mkdtempSync(join(tmpdir(), 'postman-mcp-env-'));
    const result = spawnSync(process.execPath, ['-e', `import('${envModuleUrl}')`], {
      cwd: dir,
      encoding: 'utf8',
      env: { ...process.env, POSTMAN_API_KEY: 'test-key' },
    });
    rmSync(dir, { recursive: true, force: true });
    expect(result.status).toBe(0);
    expect(result.stdout).toBe('');
  });

  it('loads POSTMAN_API_KEY from a .env file in the working directory', () => {
    const dir = mkdtempSync(join(tmpdir(), 'postman-mcp-env-'));
    writeFileSync(join(dir, '.env'), 'POSTMAN_API_KEY=from-dotenv-file\n');
    const childEnv = { ...process.env };
    delete childEnv.POSTMAN_API_KEY;
    const result = spawnSync(
      process.execPath,
      ['-e', `import('${envModuleUrl}').then((m) => console.log(m.env.POSTMAN_API_KEY))`],
      {
        cwd: dir,
        encoding: 'utf8',
        env: childEnv,
      }
    );
    rmSync(dir, { recursive: true, force: true });
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe('from-dotenv-file');
  });
});

describe('createCollectionRequest schema', () => {
  it('exposes events as a top-level array type for MCP clients', () => {
    const json = toJsonSchemaCompat(objectFromShape(createRequestParameters.shape));
    expect(json.properties?.events).toMatchObject({ type: 'array' });
  });
});
