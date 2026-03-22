import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    projects: ["./packages/*"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["packages/*/src/**/*.ts"],
      exclude: [
        "node_modules",
        "dist",
        "**/*.test.{ts,tsx}",
        "**/*.config.{ts,js}",
        "**/index.ts",
        "packages/config/**",
      ],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
});
