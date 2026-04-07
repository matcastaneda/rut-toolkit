import type { UserConfig } from "tsdown";
import { libraryPreset } from "./library.ts";

/**
 * Shared tsdown preset for React library packages.
 *
 * Extends the standard library preset with JSX transform support
 * and externalizes `react` / `react-dom` automatically.
 */
export function reactLibraryPreset(overrides: UserConfig = {}): UserConfig {
  const { deps, ...restOverrides } = overrides;

  return libraryPreset({
    platform: "neutral",
    ...restOverrides,
    deps: {
      ...deps,
      neverBundle: [
        /^react/,
        /^react-dom/,
        ...(Array.isArray(deps?.neverBundle) ? deps.neverBundle : []),
      ],
    },
  });
}
