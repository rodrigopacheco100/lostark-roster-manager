## Context

The project currently pins 25 packages (14 dependencies, 11 devDependencies). Running `pnpm outdated` reveals 13 packages with available updates, many with major version bumps: Next.js 14→16, React 18→19, ESLint 8→10, Tailwind 3→4, Zod 3→4, TypeScript 5→6, Drizzle ORM 0.36→0.45, and others. Each major bump may require code migration.

## Goals / Non-Goals

**Goals:**
- Update all 25 packages to their latest published version
- Replace ESLint with Biome for linting and formatting
- Fix all code affected by breaking changes so the project builds, type-checks, and lints cleanly
- Verify all existing functionality still works

**Non-Goals:**
- Adding new packages or removing existing ones
- Refactoring code beyond what's required for compatibility
- Changing project architecture or build tooling

## Decisions

1. **Update all packages simultaneously, fix iteratively** — Rather than step through one major bump at a time via multiple branches, update all `package.json` ranges at once and fix compile/type/lint errors iteratively. This is faster and avoids intermediate broken states that block other work. Risk is manageable because the codebase is small.

2. **Use `pnpm up --latest`** — This updates every package to the latest tag, respecting `package.json` ranges. We'll then wide-open ranges (`^latest`) to stay current.

3. **Pin React and Next to specific majors if migration is too large** — If React 19 or Next.js 16 migration proves extensive, we can stay on React 18 and Next 14 as a fallback. Priority is a working project, not bleeding edge.

4. **Tailwind v4: evaluate migration effort** — Tailwind v4 uses a new CSS-first configuration model and drops the `tailwind.config.ts` file. If migration is large, defer to a follow-up change.

5. **Replace ESLint with Biome** — Instead of migrating ESLint to flat config (ESLint 9+), switch to Biome. Biome provides linting + formatting in one tool, is significantly faster, and requires minimal config. This avoids the ESLint 8→10 migration entirely.

6. **Remove ESLint and related dependencies** — `eslint`, `eslint-config-next` are removed. The `lint` script uses `biome check`, and a new `format` script uses `biome format --write`.

## Risks / Trade-offs

- **React 19 concurrent features** — Some third-party packages (react-hook-form, react-hot-toast) may have compatibility issues. Check peer dependency warnings.
- **Zod 4 API changes** — Zod 4 has significant API changes. May need to rewrite validations.
- **TypeScript 6 breaking changes** — TS 6 may introduce new strictness that breaks existing code.
- **NextAuth v5 beta compatibility** — next-auth@5.0.0-beta.25 may have issues with React 19 or Next.js 16. Consider if a stable auth alternative is needed.
- **ESLint→Biome migration** — Some ESLint rules (e.g., Next.js-specific rules from `eslint-config-next`) may not have direct Biome equivalents. Need to verify lint coverage.
- **Tailwind v4 CSS-first config** — Requires removing `tailwind.config.ts` and `postcss.config.js`, and switching to `@import "tailwindcss"`. Significant change.
- **Rollback strategy** — If migration fails, revert `package.json` and `pnpm-lock.yaml` via git. Each breaking fix is done as a separate commit for easy partial rollback.
