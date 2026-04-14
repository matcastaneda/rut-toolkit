# @rut-toolkit/tsdown

Shared [tsdown](https://tsdown.dev) build presets for the `rut-toolkit` monorepo.

These presets are designed to provide zero-config, highly optimized builds for our internal packages, ensuring strict type generation and fully compliant `package.json` exports.

## ✨ Features

- 📦 **Output:** Generates modern `ESM` with declaration files, targeting ES2022 (`target: "es2022"`).
- 🧩 **Tree-shaking Ready:** `unbundle: true` keeps the source layout for consumer bundlers; `treeshake: true` runs Rollup treeshaking on each entry.
- 🛡️ **Package validation:** `publint: true` runs [Publint](https://publint.dev) as part of the tsdown build.
- ⚛️ **React-oriented preset:** `reactLibraryPreset` sets `platform: "neutral"` and adds `react` / `react-dom` to `deps.neverBundle` (regex) so they are not bundled.

## 🛠️ Presets

| Preset | Output | Description |
| :--- | :--- | :--- |
| `libraryPreset` | ESM | Standard pure TypeScript packages (e.g., core logic, Zod schemas). |
| `reactLibraryPreset` | ESM | Extends `libraryPreset` with `platform: "neutral"` and externalized `react` / `react-dom` (for React-oriented libraries). |

## 🚀 Usage

Create a `tsdown.config.ts` file in the root of your target package.

### Core & Logic Packages

You can import from `@rut-toolkit/tsdown` or `@rut-toolkit/tsdown/library` (same preset).

```ts
import { libraryPreset } from "@rut-toolkit/tsdown";

export default libraryPreset();
```

### React Packages

```ts
import { reactLibraryPreset } from "@rut-toolkit/tsdown";

export default reactLibraryPreset();
```

## ⚙️ Overriding Defaults

You can easily extend or override the default configuration by passing a partial `UserConfig` object. The presets are designed to perform safe merges (e.g., appending to `neverBundle` arrays without destroying the defaults).

```ts
import { libraryPreset } from "@rut-toolkit/tsdown";

export default libraryPreset({
  // Add multiple entry points
  entry: ["src/index.ts", "src/cli.ts"],
  // Default preset already uses sourcemap: false; override if needed
  sourcemap: true,
  // Add extra dependencies to externalize (strings or RegExp, per tsdown)
  deps: {
    neverBundle: ["some-heavy-dependency"],
  },
});
```