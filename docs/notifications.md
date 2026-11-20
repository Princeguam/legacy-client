# Backend notifications

Signed-in member and administrator workspaces share the account's notification endpoints through `src/services/userService.ts`. Requests carry the stored access token using the existing `apiClient.ts` helper. The frontend targets `/api/notification`, matching the notification router's name; the main backend API router now mounts it at that prefix. No backend files were changed by the frontend agent.

## Contract and UI

- `GET /api/notification/all?page=1&count=10&unRead=true&by=created&order=desc` returns unread notifications with `page`, `count`, `totalPages`, `totalItems`, and `pageData` inside the shared success envelope. `totalItems` supplies the full unread count independently of the current page.
- `PUT /api/notification/:notificationId?isRead=true` marks one notification as read. It sends no JSON body and requires a success envelope with `data: null`.
- `PUT /api/notification/all` marks all notifications for the account as read, also acknowledging with `data: null`.

`src/types/notification.ts` declares the notification record and list/read response types. `PaginatedApiData<T>` in `src/types/api.ts` is reusable for later list endpoints. A notification contains numeric `id` and `userId`, type (`Deposit_Approved`, `Deposit_Rejected`, `Dues`, `Fine` or `General`), `title`, `body`, nullable `link`, nullable `readAt`, and `created`. Dates arrive as JSON strings. Services validate the envelope, pagination, notification shape, dates, unique IDs, unread state and ownership before rendering. Unexpected fields are excluded. Errors preserve backend messages, numeric codes and HTTP status.

The bell initially has an unknown unread count until a successful response; failures never substitute sample updates or a confirmed zero. The dialog shows server titles, bodies, types and timestamps, loading, empty and retry states, and ten-record pagination. A refresh failure retains the last loaded records/count and labels them as stale. Actions remain disabled until the list is refreshed successfully.

Marking one or all as read waits for server acknowledgement, then reloads the unread list/count. It never decrements the count optimistically. Duplicate actions are blocked and the modal stays busy during PUT. Errors retain the list and allow retry. Removing the last item from a page returns to a valid page. Data refreshes on shell entry, opening the dialog, explicit Refresh, window focus and successful read actions. There is no polling, socket or push-delivery integration.

Notification data remains in memory, scoped to the active account/token. Account changes and sign-out replace the inbox and abort outstanding requests; late responses cannot populate a different account. Server read status is restored by fetching on reload. Public `/preview` workspaces show an empty preview inbox without seeded notifications or account requests.

`lib/notifications.ts` formats timestamps and accepts links only to implemented routes in the same workspace. Unsupported transaction-detail URLs, external links and other-role paths are not used as navigation. The list already contains full notification bodies, so reviewing them needs no extra single-notification GET. The existing native dialog and approved semantic tokens remain in use; text wraps at enlarged sizes without clipping titles.

## Backend findings reported without edits

1. The previously missing NotificationRoute mount is resolved in the current source; it is mounted at `/api/notification`.
2. The list route parses `unRead` with `parseBoolean()` and then checks whether it is a boolean, instead of whether it is true. That parser always returns a boolean, including when input is omitted, so the route always adds `readAt: null`. `unRead=false` cannot retrieve read notifications. This integration deliberately requests the unread list.
3. The individual PUT uses the truthiness of `req.query.isRead`. The string `"false"` is truthy and still marks a notification read. This integration uses only `isRead=true`; a future mark-unread flow needs the backend boolean behavior corrected or the query omitted according to the current implementation.
4. List `count` can be zero, but total pages are computed by dividing by it. Positive totals can therefore serialize a non-finite page count as null. The frontend always requests ten items.
5. The previously reported authentication mismatch is resolved: current login and middleware both use `expiresIn`.

Live notification reads/writes must be verified with a running backend and a valid account. Frontend mocks do not establish live connectivity.

## Checks

`npm run build`, `npm run lint`, `npm run test:pages` and `npm run test:notifications` passed. The notification tests verify list counts/pagination, record and ownership validation, exact GET/PUT query/header/body contracts, null acknowledgements, malformed/server/network errors, cancellation and workspace links.

Focused headless Chrome checks passed with backend-shaped mocked responses: initial unknown counts, loading/error/retry, server records and unread totals independent of pagination, individual/all read actions, pending-state preservation, duplicate prevention, failed-write recovery, last-page correction, persisted read state on reload, confirmed zero, late-response/account isolation, wrong-owner rejection, admin/member scope and preview isolation. Trusted pointer and keyboard events checked busy Escape behavior, modal focus return and tab containment. Desktop/320px reflow, 200% text, reduced motion and forced colours passed; captured layouts were visually reviewed. The dialog layout wraps long titles and messages at enlarged sizes. The 320px viewport provides reflow equivalent to a 1280px viewport at 400% zoom; actual browser zoom controls and screen readers were not tested. No live backend request was claimed; the remaining query findings are reported for the owner.

Email/push preferences in Settings remain device-local because the notification router does not provide preference endpoints.

Account read errors and acknowledged read actions now use shared Sonner error/success helpers. Backend messages pass through unchanged; read recovery controls, stale counts and duplicate/pending guards remain. See `uploads.md` for the reusable toaster.
