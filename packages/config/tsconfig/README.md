# tsconfig

Shared TypeScript configurations for the monorepo.

## Configs

| Config             | Extends | Use case              |
| ------------------ | ------- | --------------------- |
| `base.json`        | —       | Default strict config |
| `react-library.json` | base | React libraries (JSX) |
| `nextjs.json`      | base    | Next.js apps          |

## Usage

```json
{
  // ...
  "extends": "@rut-toolkit/config/tsconfig/base.json",
  // ...
}
```
