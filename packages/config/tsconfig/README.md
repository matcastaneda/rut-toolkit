# @rut-toolkit/tsconfig

Shared TypeScript configurations for the `rut-toolkit` monorepo. 

These configs are strictly typed, ESM-first, and optimized for modern bundlers (like tsdown/tsup) and frameworks (Next.js).

## Configs

| Configuration | Extends | Use Case |
| :--- | :--- | :--- |
| `base.json` | — | Pure TypeScript packages / Core logic (No DOM). |
| `react.json` | `base.json` | React component libraries (e.g., UI packages). |
| `nextjs.json` | `base.json` | Next.js applications (App Router, Server Components). |

## Usage

To use a configuration in a workspace package, simply extend the relevant JSON file. 

You must also define your `include` and any package-specific compiler options.

### Example (Core or Zod Library)

```json
{
  "extends": "@rut-toolkit/tsconfig/base.json",
  "include": [
    "src/**/*",
    "vitest.config.ts",
    "tsdown.config.ts",
    "**/*.test.ts"
  ]
}
```

### Example (Next.js App)

```json
{
  "extends": "@rut-toolkit/tsconfig/nextjs.json",
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```