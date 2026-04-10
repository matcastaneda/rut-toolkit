# @rut-toolkit/zod

[![npm version](https://img.shields.io/npm/v/@rut-toolkit/zod.svg)](https://www.npmjs.com/package/@rut-toolkit/zod)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@rut-toolkit/zod.svg)](https://bundlephobia.com/package/@rut-toolkit/zod)
[![license](https://img.shields.io/npm/l/@rut-toolkit/zod.svg)](https://github.com/matcastaneda/rut-toolkit/blob/main/packages/zod/LICENSE)

> Zod v4 schemas for Chilean RUT/RUN validation with automatic formatting, i18n error messages, and typed custom issues.

Drop-in Zod schemas powered by [`@rut-toolkit/core`](https://www.npmjs.com/package/@rut-toolkit/core). Parse a raw string, get back a validated and formatted RUT — ready for forms, APIs, and DTOs.

## ✨ Features

- **Ready-to-use schemas** — `rutSchema`, `rutCleanSchema`, `rutFormattedSchema` for common output formats.
- **Validate-then-transform** — modulo-11 check runs first, then the output is normalized via `formatRut`.
- **Typed custom issues** — every Zod issue carries `rutErrorCode` and `rutErrorMeta` in `issue.params`.
- **i18n defaults** — error messages in Spanish and English, with per-code overrides.
- **Placeholder rejection** — optionally reject known fake RUTs (`11.111.111-1`, etc.).
- **Auto-trim** — leading/trailing whitespace is stripped by default (configurable).

## 📦 Installation

```bash
npm install @rut-toolkit/zod @rut-toolkit/core zod
# or
pnpm add @rut-toolkit/zod @rut-toolkit/core zod
# or
yarn add @rut-toolkit/zod @rut-toolkit/core zod
# or
bun add @rut-toolkit/zod @rut-toolkit/core zod
```

> [!IMPORTANT]
> **Requires [Zod v4](https://zod.dev)** and `@rut-toolkit/core` as peer/runtime dependencies.

## 🚀 Quick Start

### Basic Schema

```ts
import { z } from "zod";
import { rutSchema } from "@rut-toolkit/zod";

const UserSchema = z.object({
  name: z.string().min(1),
  rut: rutSchema,
});

const data = UserSchema.parse({ name: "Ana", rut: " 12.345.678-5 " });
console.log(data.rut); // "12345678-5"
```

### Presets

```ts
import { rutCleanSchema, rutFormattedSchema } from "@rut-toolkit/zod";

rutCleanSchema.parse("12.345.678-5");     // "123456785"    (DB/storage)
rutFormattedSchema.parse("123456785");     // "12.345.678-5" (UI/display)
```

### Custom Schema

```ts
import { createRutSchema } from "@rut-toolkit/zod";

const strictSchema = createRutSchema({
  format: { withDots: true, withHyphen: true },
  rejectPlaceholders: true,
  locale: "en",
  messages: {
    RUT_EMPTY: "Please enter your RUT.",
    RUT_DV_MISMATCH: "The check digit is wrong.",
  },
});

strictSchema.parse("12.345.678-5"); // "12.345.678-5"
```

### Typed Error Params

```ts
import { rutSchema } from "@rut-toolkit/zod";
import type { ZodRutIssueParams } from "@rut-toolkit/zod";

const result = rutSchema.safeParse("12345678-0");

if (!result.success) {
  const issue = result.error.issues[0] as { params?: ZodRutIssueParams };

  issue.params?.rutErrorCode; // "RUT_DV_MISMATCH"
  issue.params?.rutErrorMeta; // { category: "validation", severity: "error", httpStatus: 422 }
}
```

### Disable Trim

```ts
import { createRutSchema } from "@rut-toolkit/zod";

const noTrimSchema = createRutSchema({ trim: false });

noTrimSchema.safeParse(" 12.345.678-5 "); // fails — whitespace is not stripped
```

## 📦 Exports

| Export | Type | Description |
| :--- | :--- | :--- |
| `createRutSchema` | Function | Factory to build customized schemas with format, locale, and message overrides. |
| `rutSchema` | ZodSchema | Default schema — compact output: `"12345678-5"`. |
| `rutCleanSchema` | ZodSchema | Storage schema — raw digits only: `"123456785"`. |
| `rutFormattedSchema` | ZodSchema | Display schema — dotted format: `"12.345.678-5"`. |
| `ZodRutSchemaOptions` | Interface | Configuration for `createRutSchema` (format, locale, messages, trim, rejectPlaceholders). |
| `ZodRutIssueParams` | Interface | Shape of `issue.params` on custom Zod issues (`rutErrorCode`, `rutErrorMeta`). |

## 📖 Documentation

Full API docs: [rut-toolkit.dev](https://rut-toolkit.dev)

## 📝 License

MIT © [Matías Castañeda](https://github.com/matcastaneda)
