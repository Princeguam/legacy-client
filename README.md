# Legacy Wealth Cooperatives frontend

A React + TypeScript + Vite workspace for cooperative contributions, investments, spending, and member records, using the supplied Quiet Distinction design system and locally owned shadcn-style components.

Start with [PROJECT_SCOPE.md](PROJECT_SCOPE.md) for the complete product/agent handoff, including the full approved design guide, implemented pages, role rules, data boundaries, and deployment instructions. [AGENTS.md](AGENTS.md) contains the short working rules.

## Run

Use Node 20.19+ in the Node 20 series, or Node 22.12+ (matching Vite’s supported engine range).

```sh
npm ci
npm run dev
```

Open `/login` to sign in, `/preview` to explore member/admin layout previews, or `/design-system` to inspect the components. Transaction history/details, admin creation/review and the admin user directory/profile/scoped payments have API integrations. Admin user creation, profile avatars and member/admin receipt uploads are connected through shared utility requests. Home and other unconnected data pages show construction content; transaction summary figures are labelled zero placeholders. Bank-account listing/creation are connected; member entries submit pending payments after receipt upload/review. Preview drafts remain local.

Signed-in feedback submission is connected for both roles. Administrators review feedback at `/admin/feedback` and create their own at `/admin/feedback/new`. See [feedback integration](docs/feedback.md) for the endpoints, server sorting contract and remaining backend fixes.

Bank-account listing/creation and shared active-bank lookup are connected. Transaction forms select bank accounts; administrators select recipients by name from the minimal unpaginated user endpoint. Settings connects password changes for both roles, with danger-styled sign-out aligned right in the account card and sign-out in the top bar. File selection immediately uploads accepted avatars/receipts; form saves only send their acknowledged URLs. See [bank accounts](docs/bank-accounts.md) and [Settings](docs/settings.md) for exact contracts and remaining backend findings.

The existing login uses `/api/auth/login`. Vite’s development proxy targets `http://localhost:8080` by default; configure `API_PROXY_TARGET` using [.env.example](.env.example) if needed. No new product API integration is authorized without the owner’s explicit instruction.

## Verify

```sh
npm run build
npm run lint
npm run test:auth
npm run test:pages
npm run test:profile
npm run test:notifications
npm run test:feedback
npm run test:transactions
npm run test:admin-users
npm run test:uploads
npm run test:bank-accounts
npm run test:settings
npm run test:payment-options
```

Build checks the approved guide/tokens, nine type levels, 30 component specifications, generated-file freshness, and 22 contrast pairs before TypeScript and Vite bundling. After an approved token/source change, run `npm run design-system:generate` and keep the generated outputs with the source for the owner's version-control workflow.

## Repository and deployment

Repository source must include `scripts/`, `src/design-system/`, `docs/` (including the [approved guide](docs/design-system/agent-guide.md)), `public/`, source/configuration files, and `package-lock.json`. The original `Legacy Wealth Design System/` reference boards and `resources/` can stay ignored: the build uses the committed guide and runtime assets, not that archive. Preserve original reference files locally. The owner manages Git commits. Dependencies, build output, local secrets and agent/tool state remain ignored.

For static deployment, install with `npm ci`, build with `npm run build`, and publish `dist/`. Enable SPA history fallback for frontend routes and configure `/api/*` to reach the backend separately. The Vite development proxy does not run on a static production host. The current app assumes hosting at the domain root.

See [code organization](docs/code-organization.md), [authentication](docs/authentication.md), [UI conventions](docs/design-system.md), and [workspace behavior](docs/product-pages.md) for focused implementation notes. Browser checks use mocked API responses and do not establish live connectivity. Bank-account endpoints remain pending; see [transactions](docs/transactions.md) and [bank accounts](docs/bank-accounts.md).

For focused mocked Chrome interaction/reflow checks, run `npm run test:browser` with Node 22+ and Chrome installed (`LEGACY_WEALTH_CHROME` can select the binary). These checks do not exercise a live backend, screen readers or actual browser zoom controls.

Use `npm run test:browser -- --users-only` for focused admin-user browser checks. See [admin users](docs/admin-users.md) for the connected routes and creation/role/activity contracts. Run `npm run test:browser -- --uploads-only` for avatar, creation, receipts, toasts and mobile table checks; see [uploads](docs/uploads.md).
