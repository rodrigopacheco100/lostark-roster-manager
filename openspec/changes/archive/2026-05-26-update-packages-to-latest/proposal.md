## Why

The project dependencies are pinned to specific minor/patch ranges and many are several versions behind latest. Running outdated packages misses bug fixes, security patches, performance improvements, and new features. Keeping dependencies current reduces technical debt and makes future upgrades easier.

## What Changes

- Update all `dependencies` and `devDependencies` in `package.json` to their latest published versions
- Handle any necessary code migrations for packages with breaking changes (e.g., Next.js, React, NextAuth)
- Replace ESLint with Biome for linting and formatting
- Update package.json scripts accordingly (`lint`, `format`)
- Verify the project builds (`npm run build`), types check (`npm run typecheck`), and lints (`npm run lint`) after updates

## Capabilities

### New Capabilities
- `dependency-audit`: Process and documentation of updating all project dependencies to latest versions, including migration steps for breaking changes
- `biome-lint`: Replace ESLint with Biome for fast, unified linting and formatting

### Modified Capabilities
- *(none — no existing specs describe dependency update requirements)*

## Impact

- `package.json` — all version ranges updated
- `pnpm-lock.yaml` — regenerated with new resolutions
- Potentially: Next.js config, React components, auth callbacks, Drizzle schema imports, ESLint config, TypeScript config — if major version bumps require migration
