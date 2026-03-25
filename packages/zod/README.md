# @rut-toolkit/zod

> Strict Zod v4 schemas for Chilean RUT/RUN validation and formatting, powered by `@rut-toolkit/core`.

Built for modern TypeScript environments, `@rut-toolkit/zod` provides a strictly typed, high-performance engine to handle Chilean national identification numbers (RUT/RUN). Designed for performance and developer experience.

## ✨ Features

- **Ready-to-use Zod schemas:** for forms, APIs, and DTOs.
- **Safe transformation:** validate first, then return a normalized string.
- **Rich custom issue metadata:** (`rutErrorCode`, `rutErrorMeta`) in `issue.params`.
- **Built-in presets:** for compact, clean, and formatted output.
- **i18n defaults:** (`es`, `en`) with per-error message overrides.

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

rutCleanSchema.parse("12.345.678-5"); // "123456785" (DB/storage)
rutFormattedSchema.parse("123456785"); // "12.345.678-5" (UI/display)
```

### Custom Schema and Typed Error Params

```ts
import { createRutSchema } from "@rut-toolkit/zod";
import type { ZodRutIssueParams } from "@rut-toolkit/zod";

const strictRutSchema = createRutSchema({
  format: { withDots: true, withHyphen: true },
  rejectPlaceholders: true,
  locale: "en",
  messages: {
    RUT_EMPTY: "Please enter your RUT.",
    RUT_DV_MISMATCH: "The verification digit is incorrect.",
  },
});

const result = strictRutSchema.safeParse("12345678-0");

if (!result.success) {
  const issue = result.error.issues[0] as { params?: ZodRutIssueParams };

  if (issue.params?.rutErrorCode === "RUT_DV_MISMATCH") {
    console.log(result.error.issues[0].message);
  }
}
```

## 📦 Main Exports

<!-- - **Factory:** `createRutSchema(options?)`
- **Pre-configured Schemas:** `rutSchema` (compact), `rutCleanSchema` (raw/DB), `rutFormattedSchema` (UI/display)
- **Types & Interfaces:** `ZodRutSchemaOptions`, `ZodRutIssueParams` -->

## 📦 Main Exports

| Export | Type | Description |
| :--- | :--- | :--- |
| `createRutSchema` | Function | Factory to build customized schemas. |
| `rutSchema` | ZodSchema | Default schema (compact output: `12345678-5`). |
| `rutCleanSchema` | ZodSchema | DB schema (raw output: `123456785`). |
| `rutFormattedSchema` | ZodSchema | UI schema (dotted output: `12.345.678-5`). |
| `ZodRutSchemaOptions` | Interface | Configuration options for the factory. |
| `ZodRutIssueParams` | Interface | Shape of the custom Zod issue metadata. |

## 📝 Notes

- **Requires [Zod v4](https://zod.dev).**
- **`issue.params` is available at runtime** for custom issues; in TypeScript you may need a cast to access it safely from the union type.

## 📖 Documentation

Full API docs: [https://docs.rut-toolkit.dev](https://docs.rut-toolkit.dev)

## 📝 License

MIT © [Matías Castañeda](https://github.com/matcastaneda)