## 1. SWR → React Query Migration

- [x] 1.1 Migrate Groups list page from useSWR to useQuery
- [x] 1.2 Migrate Groups detail page from useSWR to useQuery with retry: false
- [x] 1.3 Migrate Friends page from useSWR to useQuery
- [x] 1.4 Migrate Rosters list page from useSWR to useQuery
- [x] 1.5 Migrate Roster detail page from useSWR to useQuery with retry: false
- [x] 1.6 Migrate Raids page from useSWR to useQuery
- [x] 1.7 Migrate Dashboard page from useSWR to useQuery
- [x] 1.8 Remove swr package from package.json

## 2. Shared API Client

- [x] 2.1 Create per-page fetcher functions with error handling
- [x] 2.2 Consolidate into shared fetcher<T> in src/lib/api.ts using axios
- [x] 2.3 Extract error messages from error.response.data.error
- [x] 2.4 Fix Portuguese error messages in api.ts ("Erro" → "Error", "Erro de conexão" → "Connection error")

## 3. Mutation Standardization

- [x] 3.1 Standardize Groups list mutations (create/join) with useMutation + toast.promise
- [x] 3.2 Standardize Groups detail 7 actions with useMutation + toast.promise
- [x] 3.3 Standardize Friends mutations (send/respond/remove) with useMutation + toast.promise
- [x] 3.4 Standardize Rosters list mutations (create/delete) with useMutation + toast.promise
- [x] 3.5 Standardize Roster detail mutations (add/update/delete character) with useMutation + toast.promise
- [x] 3.6 Standardize Raids mutations (create/delete) with useMutation + toast.promise

## 4. English Translation

- [x] 4.1 Translate Groups list page text to English
- [x] 4.2 Translate Groups detail page text to English
- [x] 4.3 Translate Groups join page text to English
- [x] 4.4 Translate Friends page text to English
- [x] 4.5 Translate Rosters list page text to English
- [x] 4.6 Translate Roster detail page text to English
- [x] 4.7 Translate Raids page text to English
- [x] 4.8 Translate Sidebar component text to English
- [x] 4.9 Translate useConfirm defaults to English ("Cancel"/"Confirm")
- [x] 4.10 Translate API route error messages to English
- [x] 4.11 Fix "Meus Rosters" → "My Rosters" in dashboard API route

## 5. Dashboard Layout Fix

- [x] 5.1 Set dashboard container to h-screen overflow-hidden
- [x] 5.2 Ensure sidebar is fixed with full height
- [x] 5.3 Set main content area to overflow-y-auto for independent scrolling
