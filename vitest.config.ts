import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/tests/**/*.test.ts'],
    globals: true,
    setupFiles: [],
    testTimeout: 180000, // 2 minutes
    hookTimeout: 180000, // 1 minute for hooks (beforeAll, afterAll)
    teardownTimeout: 180000, // 100 seconds for cleanup
  },
});
