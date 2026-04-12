# Contributing to @rut-toolkit 🇨🇱

Thank you for your interest in contributing to `@rut-toolkit`! This guide explains how to participate in the project, set up your local environment, and ensure our CI/CD pipelines stay green.

**Before contributing**, please read our [Code of Conduct](CODE_OF_CONDUCT.md). To report violations, email: **matcastaneda.oss@gmail.com**.

---

## 🏗️ Project Architecture (Monorepo)

This project is a monorepo managed by **pnpm workspaces** and **Turborepo**. We use **tsdown** for fast, single-format (ESM) bundling.

| Directory | Purpose |
|-----------|---------|
| `packages/core/` | The main library (Validation, formatting, generation). Zero dependencies. |
| `packages/zod/` | Zod schema integrations depending on the core package. |

When adding a new feature, you will likely be working inside the `src/` directory of one of these packages.

---

## 🚨 Issue Assignment (Required for code changes)

**Before opening a Pull Request**, unless it is a **minor fix**, **an issue must exist and you must be assigned to it**. 

This ensures:
- The change aligns with the library's API design goals.
- We avoid duplicate work or rejected PRs due to scope creep.

### What counts as a "minor fix"?
✅ **Allowed without a prior issue:**
- Fixing typos in documentation, JSDoc comments, or the README.
- Formatting fixes or small type definition corrections.

❌ **Requires an issue & discussion:**
- Adding a new validation rule or utility function.
- Creating a new package (e.g., `@rut-toolkit/valibot`).
- Changing the build system (`tsdown`, `turbo`) or CI/CD workflows.

---

## 🤖 AI / LLM Usage Policy

We welcome the use of AI tools to assist with development. However, **all code must be tested and executed locally** before submitting.

- ✅ Write unit tests for the AI-generated logic.
- ✅ Run `pnpm test:all` and ensure coverage does not drop.
- ❌ **Do not submit "vibe-coded" PRs.** Code that looks correct but fails to compile or breaks the ESM build will be rejected.

---

## 💻 Development Environment Setup

1. **Prerequisites:** Node.js 20+ and `pnpm` installed.
2. **Clone and install:**
   ```bash
   git clone https://github.com/matcastaneda/rut-toolkit.git
   cd rut-toolkit
   pnpm install
   ```
3. **Run the initial build:**
   ```bash
   pnpm build
   ```
   > This ensures all cross-package dependencies (like zod depending on core) are properly linked and compiled.

---

## 🌿 Branches and workflow

- **Main branch:** `main` (trunk-based development). This is the source of truth.
- **Work branches:** `feat/feature-name`, `fix/bug-name`, `docs/update-readme`.
- **PR base:** Always branch off from `main` and open your PR against `main`.
- **Never** push directly to `main`; always use a Pull Request.

---

### 💡 Useful Commands

Run these from the root of the repository:
- `pnpm dev` — Starts the development server with Turbo.
- `pnpm build` — Compiles TypeScript into ESM using tsdown.
- `pnpm test` — Runs Vitest in watch mode.
- `pnpm test:coverage` — Runs tests and checks coverage.
- `pnpm lint` — Runs Biome (linting) and TypeScript validation.
- `pnpm lint:fix` — Runs Biome (linting) and TypeScript validation and fixes the issues.
- `pnpm lint:dependencies` — Runs Knip (dependency checking).
- `pnpm lint:spell` — Runs CSpell (spell checking).
- `pnpm lint:types` — Runs ATTW (type checking).
- `pnpm lint:packages` — Runs Publint (package validation).
- `pnpm typecheck` — Runs TypeScript type checking.

---

## 📝 Commits (Conventional Commits)

The project uses **Conventional Commits**; messages are validated with **commitlint** in the `commit-msg` hook.

Format: `type(optional scope): imperative description`

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

Examples:

```bash
feat(core): add new validation rule for RUT
fix(zod): handle null values in validation schemas
docs: update CONTRIBUTING with branch strategy
```

---

## 🔍 Pull Request Process

1. **Automated Checks:** Your PR must pass all GitHub Actions (Biome, Typecheck, Publint, ATTW, and Vitest coverage).
2. **Coverage Threshold:** We enforce strict test coverage. Ensure you write Vitest cases for any new logic.
3. **Exports & Types:** Ensure you export any new functions or types in the package's `index.ts`.
4. **Review:** A maintainer (Code Owner) will review your PR. Address feedback by pushing new commits to your branch.

---

## 🚫 What we don’t accept

- PRs without an associated issue (except minor fixes as defined above)
- Code that has not been tested locally
- Changes that break existing functionality without prior discussion
- Code that does not follow the project’s style and conventions
- Contributions that significantly deviate from project goals without prior discussion
- Large refactors without prior discussion in an issue

---

## 🎯 Types of contributions

- **🐛 Bug fixes** — Fix existing bugs
- **✨ Features** — Add new functionality (discuss in an issue first)
- **📝 Documentation** — Improve guides, README, comments, or docs in `docs/`
- **🧪 Tests** — Increase coverage or improve tests
- **🔧 Developer Experience** — Improve tooling, setup, or workflows

---

## 📄 License

By contributing to @rut-toolkit, you agree that your contributions will be licensed under the same license as the project.

---

**Remember:** We prefer well-tested, thoughtful contributions over quick patches that may introduce issues. If you have questions, open an issue or contact the maintainers (see [.github/CODEOWNERS](.github/CODEOWNERS)).
