import type { UserConfig } from "tsdown";

/**
 * Shared tsdown preset for standard TypeScript library packages.
 *
 * Outputs ESM + CJS with declaration files, targeting ES2022.
 * Override any option by passing a partial config object.
 */
export function libraryPreset(overrides?: UserConfig): UserConfig {
  return {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    target: "es2022",
    sourcemap: true,
    publint: true,
    unbundle: true,
    tsconfig: overrides?.tsconfig || "./tsconfig.build.json",
    ...overrides,
  };
}
