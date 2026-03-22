# tsdown

Shared [tsdown](https://tsdown.dev) build presets for the monorepo.

## Presets

| Preset                | Output       | Description                                  |
| --------------------- | ------------ | -------------------------------------------- |
| `libraryPreset`       | ESM + CJS    | Standard TypeScript library with `.d.ts`     |
| `reactLibraryPreset`  | ESM + CJS    | React library with JSX + externalized `react`|

## Usage

```ts
// tsdown.config.ts
import { libraryPreset } from "@rut-toolkit/tsdown";

export default libraryPreset();
```

Override any option:

```ts
export default libraryPreset({
  entry: ["src/index.ts", "src/cli.ts"],
  sourcemap: false,
});
```
