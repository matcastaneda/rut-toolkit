import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    environment: "jsdom",
    clearMocks: true,
    restoreMocks: true,
    globals: true,
    testTimeout: 10_000,
    setupFiles: ["./vitest.setup.ts"],
  },
});
