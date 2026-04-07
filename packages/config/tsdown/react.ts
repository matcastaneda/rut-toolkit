import type { UserConfig } from "tsdown";
import { mergeConfig } from "tsdown";
import { libraryPreset } from "./library.ts";

/**
 * Shared tsdown preset for React library packages.
 *
 * Extends the standard library preset with JSX transform support
 * and externalizes `react` / `react-dom` automatically.
 */
export function reactLibraryPreset(overrides: UserConfig = {}): UserConfig {
  const reactBaseConfig: UserConfig = {
    platform: "neutral",
    deps: {
      neverBundle: [/^react/, /^react-dom/],
    },
  };

  const mergedReactConfig = mergeConfig(reactBaseConfig, overrides);

  return libraryPreset(mergedReactConfig);
}
