# rut-toolkit

<!-- [![license](https://img.shields.io/github/license/matcastaneda/rut-toolkit)](./LICENSE) -->

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

- [Node.js](https://nodejs.org/) >= 22.0.0
- [pnpm](https://pnpm.io/) >= 10

### Setup

```bash
git clone https://github.com/matcastaneda/rut-toolkit.git
cd rut-toolkit
pnpm install
```

### Commands

| Command | Description |
| :--- | :--- |
| `pnpm build` | Build all packages with tsdown |
| `pnpm test` | Run all tests (unit + type tests) |
| `pnpm test:coverage` | Run tests with V8 coverage |
| `pnpm typecheck` | Type-check all packages with tsc |
| `pnpm lint` | Lint with Biome |
| `pnpm format` | Format with Biome |
| `pnpm lint:packages` | Validate package.json with publint |
| `pnpm lint:types` | Check export types with attw |
| `pnpm lint:dependencies` | Detect unused deps with knip |
| `pnpm lint:spell` | Spell check with cspell |

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
4. Run `pnpm test && pnpm lint` to verify
5. Commit with a descriptive message
6. Open a Pull Request

> [!TIP]
> See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

This project uses [Changesets](https://github.com/changesets/changesets) for versioning. If your change affects the public API, run `pnpm changeset` and follow the prompts.

## 📝 License

MIT © [Matías Castañeda](https://github.com/matcastaneda)
