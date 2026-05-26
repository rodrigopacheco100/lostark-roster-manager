## 1. Toast Infrastructure

- [x] 1.1 Create `src/hooks/useToast.ts` — react-hot-toast wrapper with ToastContent component + useToast hook
- [x] 1.2 Create custom `ToastContent` component inside useToast.ts with Tailwind styling
- [x] 1.3 Add Toaster + ConfirmProvider in `src/app/providers.tsx`
- [x] 1.4 react-hot-toast added to package.json

## 2. Confirm Dialog Infrastructure

- [x] 2.1 Create `src/hooks/useConfirm.ts` — promise-based confirm with ConfirmProvider + useConfirm hook
- [x] 2.2 ConfirmDialog uses existing Modal component with confirm/cancel buttons and destructive variant
- [x] 2.3 ConfirmProvider wraps app in `src/app/providers.tsx`
- [x] 2.4 ConfirmProvider integrated — no separate export needed

## 3. Replace confirm/alert in Groups Detail Page

- [x] 3.1 Replace `confirm("Sair do grupo?")` — useConfirm for leave
- [x] 3.2 Replace `confirm("Tem certeza que deseja excluir...")` — useConfirm for delete
- [x] 3.3 Replace `confirm("Transferir liderança...")` — useConfirm for transfer
- [x] 3.4 Replace `confirm("Remover...")` — useConfirm for kick
- [x] 3.5 Replace `confirm("Banir...")` — useConfirm for ban
- [x] 3.6 Replace `alert(err.error)` — toast error on action failure

## 4. Replace confirm in Friends Page

- [x] 4.1 Replace `confirm("Remove this friend?")` — useConfirm for remove friend
- [x] 4.2 Add toast on successful friend request sent and friend removed

## 5. Replace confirm in Rosters Pages

- [x] 5.1 Replace `confirm("Delete this roster and all its characters?")` — useConfirm on rosters list page
- [x] 5.2 Replace `confirm("Delete this character?")` — useConfirm on roster detail page
- [x] 5.3 Add toast on roster/character deleted

## 6. Replace confirm in Raids Page

- [x] 6.1 Replace `confirm("Delete this raid?")` — useConfirm on raids page
- [x] 6.2 Add toast on raid deleted
