# Uploads and application toasts

The owner authorized shared storage uploads, admin user creation, avatar editing and receipt submission. `src/services/utilService.ts` owns shared utility API requests. Existing profile/member requests stay in `userService.ts`; admin-specific creation stays in `adminService.ts`.

`POST /api/util/upload` requires bearer authentication and multipart `FormData` with one selected file under `files`. The browser supplies the multipart boundary; `apiClient.ts` supports multipart alongside its existing JSON requests. Uploads use a 120-second timeout and the same cancellation/envelope handling. The endpoint returns an array of `{fileUrl, bucket, key, mimeType, originalName}`. The service requires exactly one matching response, selects those fields, validates a usable HTTPS URL and checks filename/MIME identity.

Avatar selection accepts JPEG/PNG; receipts accept PDF/JPEG/PNG. Both use the guide's 10 MB client limit. An accepted file immediately starts its authenticated S3 upload from the selection handler, before any form save or review. Save/review actions wait for upload acknowledgement and send the returned URL only; they never trigger uploads. `useFileSelection` retains accepted files when an invalid replacement is selected or a request fails, and retains the acknowledged URL for the exact file/account/token. Failed uploads show an associated error and Retry upload; pending retries block duplicates. Retrying a failed profile, user or payment write reuses that acknowledged URL. Changing/removing the file invalidates its URL and aborts its pending request; account changes/unmount cancel pending work. Late responses for replaced/removed files are ignored. Previews never upload.

Profile and Add user use a centered, keyboard-accessible avatar circle as the native file chooser trigger, with persistent labels, file requirements and inline validation. Both dialogs are 720px wide on desktop, bounded by existing mobile margins/viewport height; bodies scroll while footer actions remain visible. Existing and newly acknowledged passport URLs appear in profile/top-bar avatars, with initials for missing/broken images. Selected previews use object URLs that are revoked on removal/unmount.

Uploads are a separate operation from saving a record. A completed upload does not imply a saved profile/user/payment. Every write requires a matching server acknowledgement; uploads and inputs remain available after errors. Profile/user writes validate returned personal/contact/avatar fields, and transactions validate the submitted receipt URL as well as exact amount, ownership and status. Member transactions remain pending until reviewed; admin entries are confirmed. No S3 credentials enter the frontend.

## Toasts

Sonner is installed. `components/shared/notifications/ToastNotifications.tsx` supplies one app-level toaster; `lib/notify.ts` provides reusable `notify.success(message)` and `notify.error(error, fallback)` calls. Backend `ApiError.message` and `AuthError.message` pass through unchanged. Fallback copy applies only when no backend error message exists. Read failures retain retry controls and stale-state explanations; mutation failures preserve inputs. Native field validation stays associated with its fields.

Login, profile, users, transactions/review, account notifications and feedback use these helpers for API errors, and acknowledged writes use success toasts. The stable toaster container moves into the active native dialog so notices remain visible and usable in the top layer. It returns to the page without remounting Sonner, preserving success messages after navigation/dialog closure. Styles use approved typography/status colours/targets, with reduced-motion and forced-colours support.

## Backend findings and verification

The owner corrected the new-phone lookup, added the profile contact-field writes and mounted AdminRoute during this frontend work. The frontend agent did not edit `server/`.

The upload middleware currently supplies no server file-size/type filter or scan acknowledgement. Client limits do not replace server validation. There is no supplied upload-delete endpoint; removing a selection does not delete an already uploaded object. Storage access, retention and any orphan-object cleanup are backend responsibilities.

Run `npm run test:uploads` for multipart, response identity, cancellation/timeouts, nullable DOB, request-field selection and write-acknowledgement contracts. `npm run test:browser -- --uploads-only` uses mocked APIs/storage images to check avatar fields, creation, member/admin receipts, unchanged backend error toasts, pending guards, upload reuse, modal/navigation behavior, mobile tables, keyboard and preview isolation. Build/lint and related regressions remain required. Mocked checks do not establish live API/S3 connectivity; actual browser zoom controls and screen readers remain unverified.
