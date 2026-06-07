import { defineConfig } from 'vitest/config';

export default defineConfig({
  cacheDir: '/tmp/vitest-cache',
  test: {
    include: ['src/tests/**/*.test.ts'],
    globals: true,
    setupFiles: ['src/tests/setupEnv.ts'],
    testTimeout: 180000, // 2 minutes
    hookTimeout: 180000, // 1 minute for hooks (beforeAll, afterAll)
    teardownTimeout: 180000, // 100 seconds for cleanup
  },
});
