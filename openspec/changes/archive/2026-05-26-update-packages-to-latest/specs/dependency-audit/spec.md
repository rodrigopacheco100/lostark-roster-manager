## ADDED Requirements

### Requirement: Update all dependencies to latest
All packages in `dependencies` and `devDependencies` SHALL be updated to their latest published version.

#### Scenario: Run pnpm up --latest
- **WHEN** `pnpm up --latest` is executed
- **THEN** all version ranges in `package.json` reflect the latest versions

### Requirement: Project builds successfully after update
The project SHALL build, type-check, and lint without errors after the update.

#### Scenario: Build passes
- **WHEN** `pnpm run build` is executed
- **THEN** the build completes with exit code 0

#### Scenario: Type check passes
- **WHEN** `pnpm run typecheck` is executed
- **THEN** TypeScript compilation completes with exit code 0

#### Scenario: Lint passes
- **WHEN** `pnpm run lint` is executed
- **THEN** ESLint completes with exit code 0

### Requirement: Breaking changes are migrated
The system SHALL handle code migrations for packages with breaking changes.

#### Scenario: Next.js 14→16 migration
- **WHEN** Next.js is updated from v14 to v16
- **THEN** all App Router APIs, config, and middleware are migrated per the Next.js upgrade guide

#### Scenario: React 18→19 migration
- **WHEN** React is updated from v18 to v19
- **THEN** all component code is compatible with React 19 APIs

#### Scenario: ESLint removed, Biome installed
- **WHEN** dependencies are updated
- **THEN** `eslint`, `eslint-config-next`, and related ESLint packages are removed from package.json
- **AND** `@biomejs/biome` is added as a devDependency

#### Scenario: Zod 3→4 migration
- **WHEN** Zod is updated from v3 to v4
- **THEN** all schema definitions and validations use Zod v4 API
