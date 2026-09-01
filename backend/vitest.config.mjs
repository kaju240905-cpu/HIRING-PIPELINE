import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globalTeardown: './src/__tests__/globalTeardown.ts',
  },
});
