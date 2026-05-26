## 1. Snapshot & Update Versions

- [ ] 1.1 Commit current working state to git for safe rollback
- [ ] 1.2 Run `pnpm up --latest` to update all packages
- [ ] 1.3 Run `pnpm install` to regenerate lockfile
- [ ] 1.4 Run `pnpm run typecheck` and record initial errors

## 2. Fix TypeScript & Type Errors

- [ ] 2.1 Migrate code for TypeScript 6 breaking changes (new strictness)
- [ ] 2.2 Update `@types/node` imports/types for Node 25 compatibility
- [ ] 2.3 Update `@types/react` and `@types/react-dom` for React 19 types
- [ ] 2.4 Fix any Drizzle ORM type issues after v0.36→0.45 bump

## 3. Migrate Next.js 14 → 16

- [ ] 3.1 Update `next.config.js` for Next.js 15/16 changes
- [ ] 3.2 Fix any App Router API changes (params, searchParams, etc.)
- [ ] 3.3 Update middleware if affected by Next.js 16 changes
- [ ] 3.4 Update `eslint-config-next` usage for v16

## 4. Migrate React 18 → 19

- [ ] 4.1 Remove deprecated React 18 APIs (e.g., `ReactDOM.render`)
- [ ] 4.2 Check react-hook-form and react-hot-toast compatibility
- [ ] 4.3 Verify NextAuth v5 beta compatibility with React 19

## 5. Migrate Zod 3 → 4

- [ ] 5.1 Update all `z.object(...)` schema definitions to Zod 4 API
- [ ] 5.2 Update validation logic using Zod 4 parse/safeParse patterns
- [ ] 5.3 Update @hookform/resolvers usage for Zod 4

## 6. Replace ESLint with Biome

- [ ] 6.1 Add `@biomejs/biome` as devDependency
- [ ] 6.2 Create `biome.json` with rules for Next.js + TypeScript
- [ ] 6.3 Remove `eslint`, `eslint-config-next`, and any ESLint config files
- [ ] 6.4 Update `package.json` scripts: `lint` → `biome check`, add `format` → `biome format --write`
- [ ] 6.5 Run `pnpm run lint` and fix any Biome errors

## 7. Migrate Tailwind CSS 3 → 4

- [ ] 7.1 Remove `tailwind.config.ts` and `postcss.config.js`
- [ ] 7.2 Update `globals.css` to use `@import "tailwindcss"`
- [ ] 7.3 Update any Tailwind v3-specific class usage to v4
- [ ] 7.4 Verify styling renders correctly

## 8. Final Verification

- [ ] 8.1 Run `pnpm run typecheck` and fix any remaining errors
- [ ] 8.2 Run `pnpm run lint` and fix any remaining errors
- [ ] 8.3 Run `pnpm run format` and verify formatting works
- [ ] 8.4 Run `pnpm run build` and verify clean build
- [ ] 8.5 Run `pnpm run dev` and smoke-test the app
- [ ] 8.6 Commit final changes
