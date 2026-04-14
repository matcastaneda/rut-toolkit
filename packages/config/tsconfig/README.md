# @rut-toolkit/tsconfig

Shared TypeScript configurations for the `rut-toolkit` monorepo. 

These configs are strictly typed, ESM-first, and optimized for modern bundlers (for example **tsdown**) and frameworks (Next.js).

This package declares a **peer dependency** on **TypeScript `>=5.0.0`** (see `package.json`).

## Configs

| Configuration | Extends | Use Case |
| :--- | :--- | :--- |
| `base.json` | — | Pure TypeScript packages / Core logic (No DOM). |
| `react.json` | `base.json` | React component libraries (e.g., UI packages). |
| `nextjs.json` | `base.json` | Next.js applications (App Router, Server Components). |

## Usage

To use a configuration in a workspace package, simply extend the relevant JSON file. 

You must also define your `include` and any package-specific compiler options.

### Example (library package in this monorepo)

`@rut-toolkit/core` and `@rut-toolkit/zod` use a minimal `include`:

```json
{
  "extends": "@rut-toolkit/tsconfig/base.json",
  "include": ["src/**/*", "**/*.test.ts"]
}
```

Add paths such as `vitest.config.ts` or `tsdown.config.ts` to `include` if you want those files covered by `tsc` in that package.

### Example (Next.js App)

```json
{
  "extends": "@rut-toolkit/tsconfig/nextjs.json",
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```