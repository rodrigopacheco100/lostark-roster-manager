## 1. Hook — useRaidToggleQueue

- [x] 1.1 Create `src/hooks/useRaidToggleQueue.ts` with queue ref (Map for dedup), snapshot ref, and timer ref
- [x] 1.2 `enqueue`: on 1st item, cancel refetches + snapshot cache; add entry (dedup by `characterId:raidDifficultyId`); flip cache instantly; reset 1.5s timer
- [x] 1.3 `flush`: POST `/api/raids/batch` with all queued updates; on error, restore snapshot; on success, invalidate dashboard
- [x] 1.4 `beforeunload` handler: sendBeacon with current queue if page closes before timer fires
- [x] 1.5 Export `ToggleEntry` type for use in component props

## 2. Backend — Batch Endpoint

- [x] 2.1 Create `src/app/api/raids/batch/route.ts` with `POST` handler accepting `{ updates: [{ characterId, raidDifficultyId, completed }] }`
- [x] 2.2 Validate: auth, zod schema, all characters exist, user owns each character's roster
- [x] 2.3 Apply all updates in a single Drizzle transaction

## 3. Frontend — Shared Hook (bugfix)

- [x] 3.1 Move `useRaidToggleQueue` from `RaidCheckbox` to `DashboardPage`
- [x] 3.2 Pass `enqueue` down via props: `DashboardPage → OwnerSection → RosterSection → RaidCheckbox`
- [x] 3.3 Remove `onToggle` prop (old invalidation callback) from all intermediate components

## 4. RaidCheckbox Refactor

- [x] 4.1 Accept `enqueue` as a prop instead of calling hook internally
- [x] 4.2 Remove unused imports (`useRaidToggleQueue`, etc.)

## 5. Verification

- [x] 5.1 Toggle 1 raid → cache flips instantly, timer starts, flush after 1.5s, 1 POST /batch com 1 update
- [x] 5.2 Toggle 3 raids de chars diferentes rapidamente → 1 POST /batch com 3 updates após 1.5s (dedup incluso)
- [x] 5.3 Toggle mesma raid 2× (marca → desmarca) → dedup manda só o último valor
- [x] 5.4 Erro no batch → cache restaura snapshot pré-todos-os-cliques
- [x] 5.5 Fechar página durante o timer → sendBeacon dispara o batch
- [x] 5.6 Progress bar reage instantaneamente a cada toggle (cache flip)
- [x] 5.7 Toggle em um checkbox → chama `enqueue` da instância compartilhada do hook (não cria fila própria)
