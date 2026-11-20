# Settings and password changes

Member/admin Settings share `PUT /api/setting/password` in `userService.ts`. Send only `{oldPassword, newPassword}`, without trimming credentials. The new-password confirmation is validated locally and never sent. Persistent current/new/confirmation labels, password autocomplete and named visibility buttons preserve native keyboard behavior.

The backend checks the current password and active/deleted account state, hashes the new password and returns a standard success envelope with `data: null`. Reject any other acknowledgement. Clear credentials and show the shared success toast only after this response. Backend errors pass through unchanged; failed writes retain every field. A pending write blocks duplicates and makes inputs read-only. Leaving the page, signing out or changing account/token aborts the request and prevents late success. Passwords stay in screen memory and are never persisted.

The backend does not revoke sessions or return replacement tokens, so changing a password preserves the current session. No new password-length/composition policy was invented; confirmation, nonempty inputs and a different new password are validated. Password reset/access requests still require the cooperative administrator.

Sign-out now appears as a labelled icon target in the top bar and a danger-coloured text button aligned to the right in Settings, and clears existing/legacy session storage through AuthContext. It no longer appears in the footer. The Account and access Role value uses the shared person/shield badge, including a shield beside Administrator. Public previews make no password requests, disable the submit action and omit session sign-out controls.

Below 600px the repeated top-bar page label is hidden to keep navigation/account/sign-out targets within the sticky 64px bar; the main page heading retains the page name. Password visibility controls remain inside their associated fields with 44px targets.

Theme and notification delivery preferences retain their device-local behavior. Cooperative planning remains a screen-only draft.

Run `npm run test:settings` for exact body/route, acknowledgement, errors and cancellation; `npm run test:browser -- --bank-settings-only` covers real form validation/focus, password preservation/clearing, pending guards, session retention, sign-out, previews, responsive layouts and media modes using mocks. Live backend, real browser zoom controls and screen readers require separate verification.
