import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    clearMocks: true,
    restoreMocks: true,
    testTimeout: 10_000,
    typecheck: {
      enabled: true,
      include: ["src/**/*.test-d.ts"],
    },
  },
});
