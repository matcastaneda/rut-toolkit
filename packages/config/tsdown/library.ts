import type { UserConfig } from "tsdown";
import { defineConfig, mergeConfig } from "tsdown";

/**
 * Shared tsdown preset for standard TypeScript library packages.
 *
 * Outputs ESM with declaration files, targeting ES2022.
 * Override any option by passing a partial config object.
 */
export function libraryPreset(overrides: UserConfig = {}): UserConfig {
  const baseConfig = defineConfig({
    format: ["esm"],
    dts: {
      build: true,
      incremental: true,
    },
    clean: true,
    target: "es2022",
    publint: true,
    unbundle: true,
    treeshake: true,
    sourcemap: false,
  });

  return mergeConfig(baseConfig, overrides);
}
