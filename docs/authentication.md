# Login page

The login route is `/login`; `/` redirects there without a valid session, or to the signed-in role’s home with a valid session. The existing component preview is available at `/design-system`. Member/admin workspaces are available under `/user` and `/admin`, with illustrative previews at `/preview`. See `docs/product-pages.md`.

The login fills the full viewport with a centered form on the white left side, brand lockup above, and copyright below. The image-equivalent lockup keeps its approved 12px caption size when interface text resizes, preventing logo overflow at 320px. The teal right panel uses the Light semantic `action/default` role (`#005250`) and the supplied hand illustration, centered horizontally and vertically. `public/illustrations/login-hand.svg` preserves the geometry of the original `hand.svg`, matches its blue background to the panel, and blends its shading through approved teal, mint and inverse semantic roles. The original file is untouched. A faint repeated tree watermark along the lower white panel follows `temp.png`, Graphic Language 04. The watermark is decorative, ignores pointer input, and sits behind the form. Inter, type sizes, semantic colours, spacing and controls are shared with the design system. Below 960px, the decorative panel is hidden; below 600px, the form uses the full viewport with 16px outer margins. Nothing essential is removed, and the page scrolls when the viewport or on-screen keyboard reduces available height.

## API and session

Shared authentication/session types live in `src/types/Auth.ts`; callers import them directly with `import type`. Repeated auth messages, role values, route paths, and storage keys use `src/constants/strings.ts`. Request timeout and timer limits use `src/constants/values.ts`.

`src/services/authService.ts` calls the existing `POST /api/auth/login` endpoint with `{ email, password }`. It validates the shared `ApiResponse<LoginResponseData>` contract against the backend's `sendResponse` and login serializer. Success contains `{ success: true, message: string, data }`; `errorCode` is omitted/undefined. Failure contains `{ success: false, message: string, errorCode: number }`; `data` is omitted/undefined. Login data includes the selected user profile fields, `accessToken`, `refreshToken`, and future `expiresAt` in milliseconds. Malformed envelopes/data are rejected. Backend failure messages, error codes, and HTTP status remain available through `AuthError`. `User` is normalized to frontend `user`; `Admin` stays `Admin`. `isAdmin` never determines permissions. Both roles use the same form, with no role selector.

Vite proxies `/api` to `http://localhost:3000`, matching the existing backend configuration. Set `API_PROXY_TARGET` in a local environment file if the backend address differs. `.env.example` documents this setting. Production should proxy `/api` to the backend on the same origin, or configure `VITE_API_BASE_URL` and the backend's cross-origin policy.

Every successful login stores `{ user, accessToken, refreshToken, expiresAt }` as JSON under `localStorage["legacy-wealth-session"]`. `user` retains the returned selected profile fields and normalized role. The password and unexpected response fields are excluded. Remember me is removed because persistence is unconditional. Valid legacy session-storage sessions migrate to localStorage; storage failures retain an in-memory sign-in. Malformed, deleted-account and expired stored sessions are discarded. Live sessions expire automatically, and Sign out clears both current and legacy session keys. Storage events synchronize sign-in/sign-out across tabs. The refresh token is stored, but refresh-token exchange and server logout are not connected.

The form validates email and password, focuses the first invalid field, retains values after errors, times out unavailable requests, and prevents duplicate submissions. Password visibility has a named button with the approved minimum touch target. Credential errors are announced, and successful sign-in routes to the role-appropriate workspace. No credentials are logged or hardcoded. A successful server response routes the valid session to its exact role’s home page.

Forgot password and Request access open accessible help dialogs directing users to their cooperative administrator. They do not pretend to send recovery mail or register an account. Google/OAuth login was not added because the existing authentication contract is email/password.

`ProtectedRoute.tsx` provides session and exact-role guards for the implemented `/user` and `/admin` route groups. Backend authorization must still protect each API endpoint.

## Checks

```sh
npm run test:auth
npm run build
npm run lint
```

Auth tests cover validation, response parsing, role normalization, rejected/expired sessions, network/server errors, localStorage persistence/migration, corrupt storage cleanup, stale legacy-session removal, token/profile preservation, error codes, timeout, and sign-out. Development import analysis was also checked after the directory migration.

Focused headless Chrome checks passed outside the sandbox using backend-shaped mocked login responses: invalid-field focus, backend error announcements and preserved inputs, pending/duplicate submission, exact request body, both tokens and profile persistence, reload restore, member/admin redirects, cross-tab sign-in/sign-out, expired-storage cleanup, keyboard Tab, 320px reflow, 200% text, reduced motion and forced colours. Captured login layouts were visually reviewed. The 320px viewport checks reflow equivalent to a 1280px viewport at 400% zoom; actual browser zoom controls, screen readers and native help-dialog focus trapping remain unverified in this batch. Live login requires the running backend and valid account credentials; mocks do not establish production connectivity.

All HTTP calls stay in `src/services/`: shared login in `authService.ts`, own-profile GET/PUT and member endpoints in `userService.ts`, and admin-specific endpoints in `adminService.ts`. `apiClient.ts` centralizes fetch, envelope handling, timeouts and cancellation; `apiUser.ts` shares user validation/normalization. Response types stay in `src/types/api.ts` and their corresponding domain files. Profile reads and acknowledged updates refresh the stored session user while preserving tokens and expiry. See `docs/profile.md` for that integration and the backend issues reported without server edits.

The user-approved tagline “Rooted in trust. Growing together.” sits above the supplied hand illustration on the teal right panel, using inverse text and an existing typography level. The panel still hides below 960px. The copy lives in `APP_TAGLINE`; the standalone backend email templates retain their own portable copy.

Settings now connects own-password changes for both roles at `PUT /api/setting/password`; confirmation remains local, credentials are untrimmed and never persisted, and a null-data acknowledgement is required. Existing sessions are retained by this backend handler. Sign-out has moved from the workspace footer to the top bar and is also available in Settings. See `settings.md`.
