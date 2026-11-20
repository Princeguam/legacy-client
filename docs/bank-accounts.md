# Admin bank-account page

`/admin/bank-accounts` lists actual cooperative accounts and creates an account after review. Its public preview stays empty and disables submission. The owner authorized listing/creation and shared payment-bank lookup; update writes remain outside this request.

The record contract is `{id, bankName, accountName, accountNumber, isActive}`. Keep account numbers as strings, preserving leading zeros. Types live in `types/bank-account.ts`; response parsers select these fields and reject malformed/duplicate records. Domain validation and display helpers live in `lib/bank-accounts.ts`.

`adminService.ts` uses GET `/api/admin/bank/all?page=1&count=10&by=createdAt&order=desc&isActive=true`. The table uses server pagination, supports bank-name sorting and sends an explicit true/false activity filter because the backend boolean parser defaults missing values to false. Loading prevents repeated requests; failed refresh retains labelled stale results with retry. Account/token changes cancel reads and remount state. There are no seeded or localStorage records.

POST `/api/admin/bank` sends trimmed `{bankName, accountName, accountNumber}` only. The handler assigns `isActive: true`, so the form does not offer an ignored activity control. Review displays all account details; pending submission blocks duplicates/Escape. Require a matching active record before clearing/closing and refreshing the first active page. Errors preserve values and review, with unchanged backend messages. No automatic mutation retry or update request is made.

Shared GET `/api/bank/no` returns an unpaginated array of active bank records, currently including createdAt. `utilService.ts` selects the five public account fields, requires an actual session and sends its bearer token. Both member/admin transaction forms use this lookup through `useBankAccountOptions`; no role-specific paginated transaction history is used to derive bank options. Native selectors have persistent labels, loading/empty/error/retry states, and full selected bank/account details in their associated hint and review. Unknown, inactive or missing selections cannot submit. Preview selectors stay empty and never fetch.

## Backend findings reported without edits

- The owner corrected admin bank GET to select `$Types.bankAccount` and attached authentication middleware to the shared bank router during this integration. Frontend calls send bearer authorization.
- The bank sorting whitelist spells accountNumber as acountNumber. The UI uses only valid bankName/createdAt sorts.
- Current bank update reads bankId from the query instead of route params and is not integrated. Creation duplicate checks are separate from insertion; the unique accountNumber constraint is the final server guard.

No server file was edited. Run `test:bank-accounts`, `test:payment-options` and `test:browser -- --bank-settings-only`. Mocks do not establish live connectivity.
