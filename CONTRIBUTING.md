# Contributing to @rut-toolkit 🇨🇱

Thank you for your interest in contributing to `@rut-toolkit`! This guide explains how to participate in the project, set up your local environment, and ensure our CI/CD pipelines stay green.

**Before contributing**, please read our [Code of Conduct](CODE_OF_CONDUCT.md). To report violations, email: **matcastaneda.oss@gmail.com**.

---

## 🏗️ Project Architecture (Monorepo)

This project is a monorepo managed by **pnpm workspaces** and **Turborepo**. We use **tsdown** for fast, single-format (ESM) bundling. Shared build and TypeScript settings live in internal config packages under `packages/config/`.

| Directory | Purpose |
|-----------|---------|
| `packages/core/` | The main library: validation, formatting, cleaning, masking, barcode parsing, business rules, and errors. Zero runtime dependencies. Subpath exports (e.g. `validate`, `format`, `barcode`) are built as separate entry points. |
| `packages/zod/` | **Zod v4** schema integrations depending on the core package. |
| `packages/config/tsconfig/` | Shared `tsconfig` preset (`@rut-toolkit/tsconfig`). |
| `packages/config/tsdown/` | Shared `tsdown` preset (`@rut-toolkit/tsdown`). |

When adding a new feature, you will likely be working inside the `src/` directory of `packages/core` or `packages/zod`.

API documentation for users is published at [rut-toolkit.dev](https://rut-toolkit.dev).

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
- ✅ Run `pnpm test` and `pnpm test:coverage` and ensure coverage does not drop.
- ❌ **Do not submit "vibe-coded" PRs.** Code that looks correct but fails to compile or breaks the ESM build will be rejected.

---

## 💻 Development Environment Setup

1. **Prerequisites:** [Node.js](https://nodejs.org/) **18+** (see `engines` in the root `package.json`). CI uses the version pinned in [`.node-version`](.node-version). [pnpm](https://pnpm.io/) **10+** (see `packageManager` in the root `package.json`).
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
   > This ensures all cross-package dependencies (for example zod depending on core) are properly linked and compiled.

---

## 🌿 Branches and workflow

- **Main branch:** `main` (trunk-based development). This is the source of truth.
- **Work branches:** `feat/feature-name`, `fix/bug-name`, `docs/update-readme`.
- **PR base:** Always branch off from `main` and open your PR against `main`.
- **Never** push directly to `main`; always use a Pull Request.

---

### 💡 Useful Commands

Run these from the root of the repository:

- `pnpm dev` — Starts development tasks via Turbo (per-package `dev` scripts).
- `pnpm build` — Builds all packages under `packages/*` with tsdown (via Turbo).
- `pnpm clean` / `pnpm clean:all` — Cleans build outputs; `clean:all` also removes `node_modules`.
- `pnpm test` — Runs Vitest for all packages (via Turbo).
- `pnpm test:coverage` — Runs tests with V8 coverage (matches CI).
- `pnpm typecheck` — Type-checks all packages with `tsc` (via Turbo).
- `pnpm format` — Formats the repo with Biome (`biome format --write`).
- `pnpm lint` — Runs Biome check (lint + format validation) with warnings as errors.
- `pnpm lint:fix` — Same as lint with auto-fix (`--fix --unsafe` where applicable).
- `pnpm lint:dependencies` — Runs Knip (strict) for unused dependencies and dead code.
- `pnpm lint:spell` — Runs CSpell.
- `pnpm lint:types` — Runs **ATTW** (`attw`) on built packages (depends on a successful build).
- `pnpm lint:packages` — Runs **Publint** on built packages (depends on a successful build).
- `pnpm size` — Runs **size-limit** per package (after build).
- `pnpm size:json` — Writes per-package `.size-report.json` (used in CI for the size report).

**Filtering (single package):**

```bash
pnpm test --filter=@rut-toolkit/core
pnpm build --filter=@rut-toolkit/zod
```

---

## 📝 Commits and Pull Request titles (Conventional Commits)

We follow **[Conventional Commits](https://www.conventionalcommits.org/)**:

- **Pull request titles** are validated in CI ([Semantic Pull Request](.github/workflows/semantic-pull-request.yml)). Use the same style as commit messages. Optional scopes include `core`, `zod`, `infra`, and `deps`. The subject must start with a lowercase letter.
- **Local Git hooks:** [Husky](https://typicode.github.io/husky/) runs **Biome** on staged files before each commit (see [`.husky/pre-commit`](.husky/pre-commit)); fix any reported issues before committing.

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

1. **Automated checks** (non-exhaustive):
   - **Code quality:** Biome, Knip, CSpell ([`ci.yml`](.github/workflows/ci.yml)).
   - **Types:** `pnpm typecheck`.
   - **Build & package checks:** `pnpm build`, then Publint and ATTW.
   - **Tests:** `pnpm test:coverage` and Codecov (on non-fork PRs).
   - **PR title:** Must satisfy Conventional Commits (see above).
   - **Bundle size:** When `packages/**` or size tooling changes, workflows run **size-limit** and may post a [sticky size summary](.github/workflows/size-report.yml) on the PR.
2. **Coverage:** We enforce strict test coverage. Add Vitest cases for any new logic.
3. **Exports & types:** Export new functions or types from the package entry points (and subpath `package.json` `exports` when adding a new entry).
4. **Changesets:** This repo uses [Changesets](https://github.com/changesets/changesets) for releases. If your change affects something users rely on (public API, behavior, or noteworthy fixes), run `pnpm changeset` locally and commit the generated changeset file so maintainers can version and publish correctly.
5. **Review:** A maintainer (see [.github/CODEOWNERS](.github/CODEOWNERS)) will review your PR. Address feedback by pushing new commits to your branch.

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
- **📝 Documentation** — Improve guides, README, comments, or the public docs site
- **🧪 Tests** — Increase coverage or improve tests
- **🔧 Developer Experience** — Improve tooling, setup, or workflows

---

## 📄 License

By contributing to @rut-toolkit, you agree that your contributions will be licensed under the same license as the project.

---

**Remember:** We prefer well-tested, thoughtful contributions over quick patches that may introduce issues. If you have questions, open an issue or contact the maintainers (see [.github/CODEOWNERS](.github/CODEOWNERS)).
