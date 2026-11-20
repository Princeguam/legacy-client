# Shared constants and types

Put repeated application strings in `src/constants/strings.ts`: roles and statuses, routes and page labels, storage keys, currency/locale identifiers, shared labels, and shared error messages. Group related constants by domain and import the named export directly. Keep one-off screen copy close to its screen.

Put shared numeric values, validation limits and patterns in `src/constants/values.ts`. Use the same limit in a form and its validator. Approved design values remain owned by `src/design-system/tokens.json`; JavaScript that needs a design value reads that source rather than maintaining another copy. Seeded application records and `product-data.ts` have been removed. API fixtures belong only in verification scripts; public previews use empty records.

Shared types belong in domain files under `src/types/`: `api.ts`, `Auth.ts`, `user.ts`, `transaction.ts`, `bank-account.ts`, `workspace.ts`, `settings.ts`, `feedback.ts`, `navigation.ts`, `routing.ts`, and `ui.ts`. Use `import type` directly from the relevant file. Authentication services implement behavior; they do not own shared type declarations. Derive role/status unions from the corresponding constant vocabulary so runtime values and types agree.

Keep component-only props beside their component. Repeated behavior belongs in a focused helper, hook, or shared component, not in a constants file. Financial formatters and transaction validation remain in `src/lib`. Avoid dependency cycles: constants and shared types must not import pages, layouts, contexts, or services.

```ts
import { AUTH_MESSAGES, USER_ROLES } from '@/constants/strings'
import { AUTH_REQUEST_TIMEOUT_MS } from '@/constants/values'
import type { AuthSession } from '@/types/Auth'
```

This organization does not add endpoint integrations or change the authorized API/local-draft boundaries.

## Backend requests and response types

All backend requests belong in `src/services/`. Use `userService.ts` for member endpoints and the backend's shared own-profile/notification/feedback creation endpoints; use `adminService.ts` for administrator-specific endpoints, currently feedback reads, user list/details, and general/user-scoped transaction reads/creation/review. Shared authentication stays in `authService.ts`. Components and contexts call services; `apiClient.ts` owns HTTP, bearer-token headers, timeouts, cancellation and envelope errors. `apiUser.ts` shares validation, public-field selection and role normalization between login and profile. `notificationResponse.ts` validates notification records/pagination and read acknowledgements. `feedbackResponse.ts` validates feedback records, sender relationships, submission ownership and pagination; feedback types live in `types/feedback.ts`.

`src/types/api.ts` defines `ApiResponse<T>` as a discriminated union. A success has `success: true`, `message: string`, `data: T`, and an omitted/undefined `errorCode`. A failure has `success: false`, `message: string`, `errorCode: number`, and omitted/undefined `data`, matching the backend's `sendResponse` serializer. Use a concrete data type for each endpoint instead of `any`; no-data successes use `null`. Validate the envelope with `services/apiResponse.ts` and validate endpoint data before trusting it.

`ApiUser` in `types/user.ts` describes the backend-selected user fields. `LoginResponseData` and `LoginResponse` in `types/Auth.ts` describe login data and its envelope. JSON dates are strings; backend role `User` is normalized to frontend `user`, while `Admin` is unchanged. Passwords are never part of the response types or stored session.

`ProfileResponseData`, `ProfileResponse`, `UpdateProfileRequest`, `ProfileFormValues` and `ProfileFormErrors` in `types/user.ts` describe own-profile reads, the expanded personal/contact form and its errors. `lib/profile.ts` owns field validation, form initialization and profile-date formatting. `PROFILE_OPTIONAL_FIELDS` supplies the shared optional-field vocabulary; `userService.ts` selects and trims request fields, omitting blank optional values. GET and PUT responses must match the signed-in account ID and normalized role before they update the screen or localStorage. No backend files may be edited; report discovered server bugs instead.

`types/notification.ts` owns notification record, list and read-response types; `PaginatedApiData<T>` in `types/api.ts` is shared by paginated endpoints. `lib/notifications.ts` owns timestamp formatting and workspace-scoped navigation links. The unread total comes from `totalItems`; read actions require a null-data success before refreshing that total. Public preview notifications are empty and never call account APIs.

`transaction.ts` owns actual payment data/query/creation types. `transactionResponse.ts` validates exact amount strings, ownership, related user/bank identities and pagination; `transactionRequest.ts` selects allowed query/body fields. Transaction money uses `format-minor-currency.ts` and BigInt throughout, with accessible full currency names. `bank-account.ts` declares the planned account record and paginated envelopes; do not add requests until paths/contracts exist. Shared passport rendering belongs in `components/shared/account-avatar`.

Admin user query/list and preparation types live in `types/user.ts`; `adminUserResponse.ts` validates public fields and pagination. `lib/members.ts` owns directory queries, names and preparation validation. `components/shared/account-information` supplies personal fields, profile information and role badges for own profiles and selected users. Shared transaction filters/history/details take an explicit user scope instead of using the selected user as the authenticated session. See `admin-users.md`.

Shared utility requests live in `utilService.ts`, including authenticated multipart uploads. `types/upload.ts`, `lib/uploads.ts` and `useFileSelection` own file contracts, immediate authenticated selection uploads, cancellation/retry and acknowledged URL reuse. `UploadStatus` supplies shared status/retry controls; record-save handlers only read `uploadedUrl`. `profileRequest.ts` selects personal/contact/avatar requests and checks saved values. `lib/notify.ts` and `components/shared/notifications/ToastNotifications.tsx` provide reusable Sonner messages without rewriting backend errors. Avatar selection and wider editor styling belong in `components/shared/account-avatar`.

Bank listing/creation requests live in `adminService.ts`; shared active-bank options use `utilService.ts`. Bank records/queries/creation types live in `types/bank-account.ts`, validation/display in `lib/bank-accounts.ts` and response validation in `bankAccountResponse.ts`. Both payment forms reuse `useBankAccountOptions` and `BankAccountSelect`. `adminUserResponse.ts` validates the minimal unpaginated `MemberOption` records declared in `types/user.ts`; `MemberSelect` replaces raw recipient IDs.

Own-password writes for both roles live in `userService.ts`; `types/settings.ts` owns the request/form/error types and `lib/password.ts` validates the screen's confirmation. The shared PasswordForm preserves credentials in memory and requires acknowledgement before clearing them. Sign-out continues to use AuthContext from the top bar and Settings.
