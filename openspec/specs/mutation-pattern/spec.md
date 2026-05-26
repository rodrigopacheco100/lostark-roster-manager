## ADDED Requirements

### Requirement: All write operations SHALL use useMutation
Every create, update, delete, or action operation SHALL use @tanstack/react-query's `useMutation` hook.

#### Scenario: User performs a write action
- **WHEN** a user triggers a write operation (create, update, delete, kick, ban, etc.)
- **THEN** the operation SHALL use `useMutation` with a mutation function

### Requirement: Mutations SHALL wrap with toast.promise
Every mutation SHALL wrap `mutateAsync()` with `toast.promise()` to show loading, success, and error states.

#### Scenario: Mutation executes successfully
- **WHEN** `mutateAsync()` resolves successfully
- **THEN** `toast.promise` SHALL show a success toast with the mutation's success message

#### Scenario: Mutation fails
- **WHEN** `mutateAsync()` rejects with an error
- **THEN** `toast.promise` SHALL show an error toast with the error message from the API

### Requirement: Mutations SHALL invalidate related queries on success
Each mutation's `onSuccess` callback SHALL invalidate the relevant query keys to refresh cached data.

#### Scenario: Mutation completes
- **WHEN** a mutation succeeds
- **THEN** the `onSuccess` callback SHALL call `queryClient.invalidateQueries()` with the appropriate query keys
