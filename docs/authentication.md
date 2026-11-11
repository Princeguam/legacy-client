# Login page

The login route is `/login`; `/` redirects there without a valid session, or to the signed-in role’s home with a valid session. The existing component preview is available at `/design-system`. Member/admin workspaces are available under `/user` and `/admin`, with illustrative previews at `/preview`. See `docs/product-pages.md`.

The login fills the full viewport with a centered form on the white left side, brand lockup above, and copyright below. The teal right panel uses the Light semantic `action/default` role (`#005250`) and the supplied hand illustration, centered horizontally and vertically. `public/illustrations/login-hand.svg` preserves the geometry of the original `hand.svg`, matches its blue background to the panel, and blends its shading through approved teal, mint and inverse semantic roles. The original file is untouched. A faint repeated tree watermark along the lower white panel follows `temp.png`, Graphic Language 04. The watermark is decorative, ignores pointer input, and sits behind the form. Inter, type sizes, semantic colours, spacing and controls are shared with the design system. Below 960px, the decorative panel is hidden; below 600px, the form uses the full viewport with 16px outer margins. Nothing essential is removed, and the page scrolls when the viewport or on-screen keyboard reduces available height.

## API and session

`src/services/authService.ts` calls the existing `POST /api/auth/login` endpoint with `{ email, password }`. It consumes the server's `{ success, data }` envelope. Success requires an access token, future `expiresAt`, valid user identity, and an accepted server role. `User` is normalized to frontend `user`; `Admin` stays `Admin`. `isAdmin` never determines permissions. Both roles use the same form, with no role selector.

Vite proxies `/api` to `http://localhost:3000`, matching the existing backend configuration. Set `API_PROXY_TARGET` in a local environment file if the backend address differs. `.env.example` documents this setting. Production should proxy `/api` to the backend on the same origin, or configure `VITE_API_BASE_URL` and the backend's cross-origin policy.

Default sessions use session storage. Selecting Remember me uses local storage until the server-supplied access-token expiry; no arbitrary 30-day session is promised. Invalid/expired cached sessions are discarded, live sessions expire automatically, and Sign out clears client state. Refresh tokens and a server logout endpoint are not implemented in this batch.

The form validates email and password, focuses the first invalid field, retains values after errors, times out unavailable requests, and prevents duplicate submissions. Password visibility has a named button with the approved minimum touch target. Credential errors are announced, and successful sign-in routes to the role-appropriate workspace. No credentials are logged or hardcoded. A successful server response routes the valid session to its exact role’s home page.

Forgot password and Request access open accessible help dialogs directing users to their cooperative administrator. They do not pretend to send recovery mail or register an account. Google/OAuth login was not added because the existing authentication contract is email/password.

`ProtectedRoute.tsx` provides session and exact-role guards for the implemented `/user` and `/admin` route groups. Backend authorization must still protect each API endpoint.

## Checks

```sh
npm run test:auth
npm run build
npm run lint
```

Auth tests cover validation, response parsing, role normalization, rejected/expired sessions, network/server errors, storage selection, and sign-out. Additional DOM interaction checks cover field focus, password visibility, duplicate submission, failed-login value preservation, successful login, and Remember me. Development import analysis was also checked after the directory migration.

Real browser screenshots, mobile reflow, zoom, native dialog focus trapping and forced-colours checks require a browser-capable environment. This environment blocks Chrome startup, so those visual/runtime checks could not be completed here. Live login also requires the backend and a valid cooperative account.
