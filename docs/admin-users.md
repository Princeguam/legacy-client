# Admin users

The owner authorized the admin user directory, individual user details and that user's transactions, plus an add-user form. `/admin/members` and `/admin/members/:memberId` consume the existing read endpoints. The Add user form consumes the completed creation endpoint and shared avatar upload. Public `/preview/admin` equivalents use empty records without account requests.

| Action | API path | Behavior |
| --- | --- | --- |
| List users | `GET /api/admin/user/all` | Server pagination, search, activity and sorting |
| Create user | `POST /api/admin/user` | Personal/contact fields and uploaded passport; the server creates a Member |
| Open user | `GET /api/admin/user/:memberId` | Fresh public profile; validates the requested ID |
| User transactions | `GET /api/admin/user/:memberId/transaction/all` | Server pagination, status/search/period filters and sorting |
| Transaction details | `GET /api/admin/user/:memberId/transaction/:transactionId` | Fresh record; validates both user and transaction IDs |
| Review transaction | `PUT /api/admin/user/:memberId/transaction/:transactionId` | Boolean `isAccepted`, fresh preflight and matching acknowledgement |

All requests live in `adminService.ts` and require an actual unexpired session with role exactly `Admin`. Selected user data never replaces the signed-in administrator or changes localStorage. `adminUserResponse.ts` selects public fields, validates IDs and checks pagination totals/counts/duplicate records. It shares `apiUser.ts` with login/profile; nullable addresses and the newly selected occupation/next-of-kin/emergency-contact fields are supported. The new contact fields may be absent during the backend transition; invalid supplied values are rejected. No passwords, tokens or unexpected fields are retained from user responses.

The directory sends `page`, `count=10`, `by`, `order`, an explicit boolean `isActive` query string and trimmed `search` when present. Search follows backend name/email/phone/gender/address/state matching. UI sorts use `created`, `fullName` or `email`. Active is the default; Inactive is available. The backend's current `parseBoolean(undefined)` returns false, so omitting `isActive` cannot mean All. Individual profile responses do not contain `isActive`; the details screen does not infer it.

Directory/detail loaders cancel on account, route or query changes, offer retry on errors and preserve the last directory page during a failed refresh while disabling its actions. All widths use native tables with contained horizontal scrolling. Every column scrolls together, including avatars and names; cell text does not break. Profile passports share the existing avatar/initials fallback and role icons. Invalid IDs do not request data. Missing/deleted accounts are handled according to actual server responses; deleted accounts returned by the detail handler carry a visible label.

User transaction history reuses the ordinary history/filter/details components with an explicit user scope. Amounts remain exact integer kobo strings through BigInt/Intl. Review uses the scoped GET and PUT routes, checks the pending record immediately before each write, validates the resulting status/reviewer/timestamp and blocks duplicate pending submissions. No balances or financial summaries are inferred from a paginated user history.

## Creation

Add user shares the 720px responsive profile-editor width and centered clickable avatar picker. It captures personal/occupation/kin/emergency-contact fields and uploads a selected JPEG/PNG immediately. Review waits for that acknowledgement, then creation posts the saved `passport` URL without uploading again. The endpoint creates role User and assigns its server-configured temporary password; the frontend does not offer unsupported Admin creation or handle passwords. Returned fields, role and ID are checked before refreshing the directory and showing success. Backend errors appear unchanged in Sonner; inputs/files remain and retries reuse successful uploads. Preview submission stays disabled without uploads. See `uploads.md`.

## Backend findings for the owner

- The selected users serializer omits `isActive`, including from the deactivate mutation response. Add it if activity controls need verified read/write state.
- `PUT /:memberId/admin` currently sets `isActive` from `isAdmin` and always sets `role=Admin`, without updating `isAdmin`. It cannot demote. Role controls are not exposed as functional.
- The deactivate handler uses JavaScript truthiness, so a string `"false"` becomes true. An eventual client must send actual booleans.
- Scoped transaction sorting has the same `address` whitelist typo as the general admin handler; the frontend sends only `created`/`status`.
- Scoped transaction review lacks a server pending/version precondition. Frontend checks cannot prevent races from other clients.

The owner corrected creation’s phone lookup and mounted AdminRoute during this work. No server files were edited by the frontend agent. `npm run test:admin-users` verifies source contracts and account/record isolation with mocked responses; `npm run test:browser -- --users-only` runs focused browser coverage of the directory, scoped payments, form preparation and previews. These checks do not establish live backend connectivity.
