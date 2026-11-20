# Feedback integration

Members submit feedback at `/user/feedback`. Administrators review the cooperative inbox at `/admin/feedback` and use `/admin/feedback/new` to submit their own feedback through the same creation endpoint. Public `/preview` equivalents are empty layout previews and make no account API requests.

## Contracts

- `POST /api/feedback` is shared by both roles. `userService.createFeedback` sends only `{ category, subject, message }` and the stored Bearer token. Categories are exactly `General`, `Bug`, and `Suggestion`. Subject/message are required and trimmed; the existing 120-character subject limit remains shared by the form and validator.
- `GET /api/admin/feedback/all?page=1&count=10&by=created&order=desc` retrieves an administrator-only page. `adminService.getFeedbacks` sends `by=created` or `by=category` and `order=asc` or `order=desc`. Newest/oldest and category A–Z/Z–A are server sorting requests. The frontend preserves server order and never sorts individual API pages locally. Changing sort resets to page one; sort/page live in the URL.
- `GET /api/admin/feedback/:feedbackId` loads fresh details when an administrator opens a record. The returned ID must match the requested ID. No update, response, delete or new member-list endpoint is integrated.

The feedback serializer supplies `id`, `userId`, nullable `subject`, `message`, `category`, `created`, `updated`, and `member` with the selected user fields. `src/types/feedback.ts` owns request/response/domain types; list responses use `PaginatedApiData<T>` from `types/api.ts`. `services/feedbackResponse.ts` validates records, dates, categories, sender relationships, unique IDs and pagination. Only the sender's ID, first/last names, email and role are retained; extra profile fields and unexpected/password fields are discarded. A submission response must match the signed-in account ID and role.

## Behaviour

Submission waits for a valid server acknowledgement before displaying a success notification and clearing the form. It does not show the submitted content or response record. Pending actions block repeated sends. Errors preserve category, subject and message and focus the error; field validation focuses the first invalid control. Feedback is not written to localStorage and no delivery is claimed from a preview draft. There are no automatic POST retries; the backend currently supplies no idempotency contract, so persistent duplicate prevention after an uncertain network response remains a server responsibility.

The administrator inbox displays server subjects/messages, categories, sender names/emails, UTC creation timestamps and the server's total record count, with ten-record pagination. Loading, error/retry and confirmed-empty states are distinct. A failed refresh retains and labels the last loaded page and disables page navigation until refresh succeeds. Refreshing a page beyond a reduced total returns to the last valid page. Details use the existing native dialog, with retry and Escape dismissal.

Authenticated pages no longer show an illustrative-finances banner. Seeded application records are removed; transaction summaries use the owner-approved zero placeholders. Account/token changes remount the feedback form/inbox; leaving the page aborts requests and ignores late results. Public preview inboxes contain no seeded feedback; user-entered preview drafts remain screen-local and never make authenticated requests.

## Backend findings for the owner

Backend source was inspected read-only; no files in `server/` were changed.

1. `server/src/routes/admin/feedback/index.ts` imports constants from `../..../../../../constants/index.js`, a malformed path. It needs to resolve the existing constants module.
2. `server/src/routes/index.ts` mounts the shared feedback route but does not import/mount `AdminRoute`. The frontend targets the intended `/api/admin/feedback` prefix; the admin router must be mounted at `/admin` under the API router, retaining its existing `auth()` and `userPermit()` middleware.
3. The admin list type declares `category`, but its `by` whitelist currently accepts only `subject` and `message`, defaulting everything else to `created`. The owner explicitly requested frontend category sorting as if the endpoint supports it and will fix the backend. The UI therefore sends `by=category` directly.
4. The unused category filter reads `status` and applies the entire category enum rather than `selectedCategory`. This integration does not add category filtering.
5. The list accepts `count=0` and can divide by zero when calculating pages. The frontend always requests ten records.

Current login and auth middleware now both use the token payload's `expiresIn`, and the notification router is now mounted; earlier profile/notification documentation records findings from a previous backend state. Live feedback verification still requires a running backend, valid credentials, and the admin routing/import/sorting corrections above. Mocked checks do not prove live connectivity.

## Verification

Run `npm run test:feedback`, `npm run test:pages`, `npm run test:auth`, `npm run test:profile`, `npm run test:notifications`, `npm run build`, and `npm run lint`.

The feedback regression script checks shared member/admin submission, exact request fields/categories, acknowledgement and account validation, sender/profile field selection, administrator authorization, list/detail URLs, all four server sorting requests, preserved response order, pagination, empty/error/cancellation handling and preview isolation.

Build, lint and all regression scripts passed. Focused headless Chrome checks also passed with backend-shaped mocked responses: member/admin submission, success notification without echoing the response, cleared fields after acknowledgement, error/input preservation, duplicate prevention, account validation, admin list/detail requests, category/date query parameters and server ordering, pagination/reset, refresh/retry/empty states, pending-request sign-out, and preview isolation. Trusted pointer/keyboard events exercised the native details dialog, Tab navigation, Escape dismissal and focus return. All three feedback routes passed desktop, 960/600/320px, 200% text, dark-theme, reduced-motion and forced-colours checks; screenshots were reviewed. The form page constrains its grid and allows its heading to wrap at enlarged text sizes. Actual browser zoom controls and screen readers were not tested; 320px reflow checks the viewport equivalent of 1280px at 400% zoom. These checks used mocks and do not establish live backend connectivity.

Submission/read errors and acknowledged submission successes use shared Sonner helpers with unchanged backend messages. Field validation stays inline; submissions clear only after acknowledgement. The admin inbox uses a native table at every viewport with contained horizontal scrolling and unbroken text; full content remains in fresh details.
