# @rut-toolkit/tsdown

Shared [tsdown](https://tsdown.dev) build presets for the `rut-toolkit` monorepo.

These presets are designed to provide zero-config, highly optimized builds for our internal packages, ensuring strict type generation and fully compliant `package.json` exports.

## ✨ Features

- 📦 **Dual Output:** Generates modern `ESM` and legacy `CJS` simultaneously.
- 🧩 **Tree-shaking Ready:** Uses `unbundle: true` to preserve the original file structure, allowing modern bundlers (Next.js, Vite) to drop unused code efficiently.
- 🛡️ **Package Validation:** Built-in `publint` checks to guarantee that your `exports`, `main`, and `types` fields are perfectly aligned with the generated files.
- ⚛️ **React Ready:** Smart externalization of `react` and `react-dom` to prevent multiple-instance errors in consumer apps.

## 🛠️ Presets

| Preset | Output | Description |
| :--- | :--- | :--- |
| `libraryPreset` | ESM + CJS | Standard pure TypeScript packages (e.g., core logic, Zod schemas). |
| `reactLibraryPreset` | ESM + CJS | React component libraries with JSX support. Automatically externalizes React dependencies. |

## 🚀 Usage

Create a `tsdown.config.ts` file in the root of your target package.

### Core & Logic Packages

```ts
import { defineConfig } from "tsdown";
import { libraryPreset } from "@rut-toolkit/tsdown";

export default defineConfig(libraryPreset());
```

### React Packages

```ts
import { defineConfig } from "tsdown";
import { reactLibraryPreset } from "@rut-toolkit/tsdown";

export default defineConfig(reactLibraryPreset());
```

## ⚙️ Overriding Defaults

You can easily extend or override the default configuration by passing a partial `UserConfig` object. The presets are designed to perform safe merges (e.g., appending to `neverBundle` arrays without destroying the defaults).

```ts
import { defineConfig } from "tsdown";
import { libraryPreset } from "@rut-toolkit/tsdown";

export default defineConfig(
  libraryPreset({
    // Add multiple entry points
    entry: ["src/index.ts", "src/cli.ts"],
    // Disable sourcemaps for this specific package
    sourcemap: false,
    // Add extra dependencies to externalize
    deps: {
      neverBundle: ["some-heavy-dependency"],
    },
  })
);
```