import { z } from 'zod';

/**
 * Public environment configuration for the Postman MCP Server (STDIO mode).
 * This file contains only the variables needed for the public open-source version.
 */

const envSchema = z.object({
  POSTMAN_API_KEY: z.string(),
  POSTMAN_API_BASE_URL: z.string().url().default('https://api.postman.com'),
  GIT_BRANCH: z.string().default('main'),

  // Remote MCP endpoint backing the `searchLearningCenter` tool. It proxies
  // `searchDocs` calls to the Postman Learning Center docs MCP server. Kept in
  // sync with the same key in `shared/env.ts`.
  POSTMAN_LEARNING_CENTER_MCP_URL: z
    .string()
    .url()
    .default('https://learning.postman.com/_mcp/server'),

  // Telemetry configuration. OFF by default for the open-source distribution;
  // users opt in explicitly with POSTMAN_MCP_TELEMETRY=true. The STDIO transport
  // honors only true/false; interpreted by parseTelemetryFlag at the call site,
  // so this is a lenient passthrough rather than a strict enum.
  POSTMAN_MCP_TELEMETRY: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables for Postman MCP server:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
