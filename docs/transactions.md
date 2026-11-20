# Transaction integration

Member calls live in `userService.ts`; admin calls live in `adminService.ts`. `apiClient.ts` handles HTTP/envelopes. `transactionResponse.ts` validates records, related users/banks, exact amounts, ownership and pagination; `transactionRequest.ts` selects query/body fields. Types live in `types/transaction.ts` and `types/bank-account.ts`.

## Amounts and returned records

The owner confirmed that `amount` is integer NGN kobo. The backend BigInt serializer returns safe integer numbers and uses strings beyond the safe range. Normalize both to exact integer strings, reject unsafe numeric JSON values, and preserve the signed 64-bit range. `formatMinorCurrency` uses BigInt and Intl parts to display the complete amount and accessible currency name without rounding away cents. New payment input converts decimal NGN to a positive kobo string bounded by the database's signed 64-bit maximum.

Records contain ID, bankAccountId, userId, status, type, amount, currency, nullable note/attachment/review information, source, period/deposit/create/update dates, depositedBy, nullable reviewedBy and bankAccount. Select only needed sender/reviewer fields; reject wrong relationship IDs, malformed dates/statuses/amounts and duplicate page IDs. Member records must match the signed-in account ID.

## GET

- Member list: `/api/transaction/all?page=1&count=10&by=created&order=desc`.
- Admin list: `/api/admin/transaction/all` with the same pagination/sort and optional `search`, `status`, `from`, `to`.
- Fresh member details: `/api/transaction/:id`; fresh admin details: `/api/admin/transaction/:id`. Responses must match the requested ID.

Lists use the common `{ page, count, totalPages, totalItems, pageData }` envelope and preserve server order. Member list handlers only consume sort/pagination, so their UI shows sort without unsupported search/status/date controls. Admin dates filter `period` inclusively. API failures do not fall back to seeded records. Refresh failures retain and label the last loaded results; read actions/pagination lock during loading or errors. An out-of-range page offers navigation to the last valid page. Account/token/route changes abort requests and ignore late responses.

## Creation and review

Member POST `/api/transaction` accepts `{ bankAccountId, amount, period, attachmentUrl, note?, depositedAt? }`. Selecting the required receipt immediately uploads it through `utilService.ts`; review waits for upload acknowledgement and submission sends its returned URL without another upload. The response must match account, exact amount, bank, month, receipt URL, type and PENDING status. Failed uploads do not submit a payment; failed writes retain inputs/files and reuse successful uploads on retry. Preview forms remain memory-only drafts and never upload or POST.

Both creation forms now select an active bank from shared `GET /api/bank/no`, an unpaginated record array. Persistent labels and full selected bank/account/number hints replace bank-account ID entry; review displays the same details. Admin creation selects its recipient from `GET /api/admin/user/no`, which returns `{id, fullName, email, phoneNo}` without pagination. The selected memberId remains an internal POST field required by the admin handler; members never send it. Loading/errors/empty lists prevent bank submission and offer retry; invalid/inactive/unlisted banks cannot be submitted. Lookup requests are authenticated, cancelled on account/route changes, and excluded from public previews. No sample bank/user options are inserted in previews.

Admin POST `/api/admin/transaction` accepts the same fields plus `memberId`; attachmentUrl remains optional. Selecting an admin receipt immediately uploads it. It reviews the values and waits for a matching CONFIRMED response, receipt URL when supplied, and current reviewer identity/time. Inputs and review stay open on errors; pending submissions block duplicates and Escape.

Admin PUT `/api/admin/transaction/:id` sends exactly `{ isAccepted: boolean }`. Fresh pending details are reviewed before approval/rejection. Every confirmation re-fetches the record, including retries after uncertain writes, and blocks mutation if the payment has changed or has already been reviewed. Require a matching ID, owner, amount, currency, bank, period, confirmed/rejected status and administrator review identity/time before showing completion. No automatic mutation retries, deletes or member-edit integrations are added.

## Summary/preview boundaries

Home and Portfolio use construction content after seeded records were removed. Transaction summary amounts/annual target stay at the owner-requested zero placeholders, explicitly labelled as awaiting data; never compute complete balances from a paginated history response. No summary API is called. Public previews contain empty records and never make authenticated requests. UI component examples remain illustrative only in the design-system preview.

## Backend findings reported without edits

- Admin review overwrites status/reviewer without a pending-state/version precondition. The client only offers pending review and blocks duplicate clicks, but server authorization/concurrency must enforce this independently.
- Creation checks for an existing member/month before insert without an atomic uniqueness/idempotency contract. A network retry or simultaneous request can still duplicate server work.
- Member creation counts rejected records as existing; admin creation excludes REJECTED. The member period update handler incorrectly looks up its own ID when checking period duplicates. Those unused update/delete flows are not integrated.
- Bank-account lookup does not reject inactive banks; future utilities/picker and server validation must agree.
- The admin sort whitelist includes `address` instead of `created`; the requested created sorting still falls back to created. The UI uses only created/status.
- Lists accept count zero; the frontend always requests ten.

These are source findings, not live verification. No `server/` file was changed. Run `npm run test:transactions`, other regressions, build/lint and focused browser checks; actual backend behavior requires valid credentials and the remaining server corrections.

Focused Chrome checks passed with mocked API responses for both roles: list pagination/refresh recovery, fresh details, admin creation/approval acknowledgement, pending-write duplicate/Escape guards, exact large amounts, member receipt submission and preview drafts, accepted-receipt preservation after invalid replacement, passport/optional-field behavior, and unconnected bank forms with leading-zero account numbers. Native nested-dialog events are scoped so closing a confirmation preserves its parent details. Workspace tables now scroll every column together on mobile, with unbroken text and aligned avatars. Desktop/960/600/320px reflow, 200% text, dark theme, reduced motion and forced colours passed; screenshots were reviewed. The login tagline was checked above its illustration at desktop/960px and hidden with the existing right panel on mobile. `npm run test:browser` requires Node 22+ and Chrome; set `LEGACY_WEALTH_CHROME` for another binary path. Live APIs, actual browser zoom controls and screen readers remain unverified.

API errors and acknowledged writes use shared Sonner helpers; backend errors pass through unchanged. The owner mounted AdminRoute during this batch. See `uploads.md` for the shared upload contract and `npm run test:browser -- --uploads-only` for focused mocked upload checks.
