# rut-toolkit

[![GitHub License](https://img.shields.io/github/license/matcastaneda/rut-toolkit)](https://github.com/matcastaneda/rut-toolkit/blob/main/LICENSE)

> Zero-dependency, strictly typed Chilean RUT/RUN utilities for modern TypeScript.

Validate, format, clean, mask, and parse barcodes from Chilean national IDs — with branded types, structured errors, and i18n support.

## 📦 Packages

| Package | Version | Description |
| :--- | :--- | :--- |
| [`@rut-toolkit/core`](./packages/core) | [![npm](https://img.shields.io/npm/v/@rut-toolkit/core)](https://www.npmjs.com/package/@rut-toolkit/core) | Core utilities: validation, formatting, cleaning, masking, barcode parsing, business rules, and errors. |
| [`@rut-toolkit/zod`](./packages/zod) | [![npm](https://img.shields.io/npm/v/@rut-toolkit/zod)](https://www.npmjs.com/package/@rut-toolkit/zod) | Zod v4 schemas with automatic formatting, i18n error messages, and typed custom issues. |

## 🚀 Quick Start

```bash
# Core only
pnpm add @rut-toolkit/core

# With Zod integration
pnpm add @rut-toolkit/zod @rut-toolkit/core zod
```

```ts
import { isRut, formatRut, toValidRut } from "@rut-toolkit/core";

if (isRut("12.345.678-5")) {
  console.log(formatRut("12.345.678-5")); // "12.345.678-5"
}

const rut = toValidRut("12345678-5"); // ValidRut (branded string)
```

```ts
import { rutSchema } from "@rut-toolkit/zod";

const rut = rutSchema.parse(" 12.345.678-5 "); // "12345678-5"
```

## 🏗️ Monorepo Structure

```
rut-toolkit/
├── packages/
│   ├── core/          @rut-toolkit/core — validation, formatting, errors
│   ├── zod/           @rut-toolkit/zod — Zod v4 schema adapter
│   └── config/        Shared tsconfig and tsdown presets
├── turbo.json         Turborepo task pipeline
└── package.json       Root workspace (pnpm)
```

## 🛠️ Development

### Prerequisites

- [Node.js](https://nodejs.org/) **18+** (see `engines` in the root `package.json`). CI uses the version in [`.node-version`](.node-version).
- [pnpm](https://pnpm.io/) **10+** (see `packageManager` in the root `package.json`).

### Setup

```bash
git clone https://github.com/matcastaneda/rut-toolkit.git
cd rut-toolkit
pnpm install
```

### Commands

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Run package `dev` scripts via Turbo |
| `pnpm build` | Build all packages with tsdown (via Turbo) |
| `pnpm clean` / `pnpm clean:all` | Clean build outputs; `clean:all` also removes `node_modules` |
| `pnpm test` | Run Vitest for all packages (via Turbo) |
| `pnpm test:coverage` | Same as tests with V8 coverage (matches CI) |
| `pnpm typecheck` | Type-check all packages with `tsc` (via Turbo) |
| `pnpm lint` | Lint with Biome (warnings fail the run) |
| `pnpm lint:fix` | Lint with Biome and apply fixes |
| `pnpm format` | Format with Biome |
| `pnpm lint:packages` | Validate packages with Publint (after build) |
| `pnpm lint:types` | Check export types with ATTW (after build) |
| `pnpm lint:dependencies` | Detect unused deps with Knip |
| `pnpm lint:spell` | Spell check with CSpell |
| `pnpm size` | Run size-limit per package (after build) |
| `pnpm size:json` | Write per-package `.size-report.json` (used in CI) |

### Filtering

Run tasks for a specific package:

```bash
pnpm test --filter=@rut-toolkit/core
pnpm build --filter=@rut-toolkit/zod
```

## 📖 Documentation

Full API docs: [rut-toolkit.dev](https://rut-toolkit.dev)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Make your changes and add tests
4. Run `pnpm test`, `pnpm lint`, and `pnpm typecheck` (use `pnpm test:coverage` before opening a PR) to verify
5. Commit with a descriptive message
6. Open a Pull Request

> [!TIP]
> See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

This project uses [Changesets](https://github.com/changesets/changesets) for versioning. If your change affects the public API, run `pnpm changeset` and follow the prompts.

## 📝 License

MIT © [Matías Castañeda](https://github.com/matcastaneda)
