## ADDED Requirements

### Requirement: Biome replaces ESLint for linting
The project SHALL use Biome for all linting and formatting, replacing ESLint.

#### Scenario: ESLint dependencies removed
- **WHEN** Biome is set up
- **THEN** `eslint`, `eslint-config-next`, and any ESLint plugins are removed from `package.json`

#### Scenario: Biome installed
- **WHEN** `pnpm install` completes
- **THEN** `@biomejs/biome` is present in `devDependencies`

### Requirement: Biome is configured
The project SHALL include a `biome.json` configuration file at the project root.

#### Scenario: biome.json created
- **WHEN** the project is set up
- **THEN** a `biome.json` file exists with appropriate rules for a Next.js + TypeScript project

### Requirement: package.json scripts updated
The `package.json` scripts SHALL be updated to use Biome instead of ESLint.

#### Scenario: lint script uses biome check
- **WHEN** `pnpm run lint` is executed
- **THEN** Biome runs with `biome check` and exits with code 0 on clean code

#### Scenario: format script available
- **WHEN** `pnpm run format` is executed
- **THEN** Biome formats files with `biome format --write`

### Requirement: All existing code passes Biome lint
All source files SHALL pass Biome linting without errors after migration.

#### Scenario: Full lint passes
- **WHEN** `pnpm run lint` is executed on the full codebase
- **THEN** Biome reports no errors or warnings
