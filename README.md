# Legacy Wealth Cooperatives frontend

A React + TypeScript + Vite workspace for cooperative contributions, investments, spending, and member records, using the supplied Quiet Distinction design system and locally owned shadcn-style components.

Start with [PROJECT_SCOPE.md](PROJECT_SCOPE.md) for the complete product/agent handoff, including the full approved design guide, implemented pages, role rules, data boundaries, and deployment instructions. [AGENTS.md](AGENTS.md) contains the short working rules.

## Run

Use Node 20.19+ in the Node 20 series, or Node 22.12+ (matching Vite’s supported engine range).

```sh
npm ci
npm run dev
```

Open `/login` to sign in, `/preview` to explore illustrative member/admin workspaces, or `/design-system` to inspect the components. Actual financial data is not connected; member transaction entries and receipts remain local drafts and clear on reload, sign out, or workspace change.

The existing login uses `/api/auth/login`. Vite’s development proxy targets `http://localhost:3000` by default; configure `API_PROXY_TARGET` using [.env.example](.env.example) if needed. No new product API integration is authorized without the owner’s explicit instruction.

## Verify

```sh
npm run build
npm run lint
npm run test:auth
npm run test:pages
```

Build checks the approved guide/tokens, nine type levels, 30 component specifications, generated-file freshness, and 22 contrast pairs before TypeScript and Vite bundling. After an approved token/source change, run `npm run design-system:generate` and commit the generated outputs with the source.

## Repository and deployment

Commit `scripts/`, `src/design-system/`, `docs/` (including the [approved guide](docs/design-system/agent-guide.md)), `public/`, source/configuration files, and `package-lock.json`. The original `Legacy Wealth Design System/` reference boards and `resources/` can stay ignored: the build uses the committed guide and runtime assets, not that archive. Preserve original reference files locally. Do not commit dependencies, build output, local secrets, or agent/tool state.

For static deployment, install with `npm ci`, build with `npm run build`, and publish `dist/`. Enable SPA history fallback for frontend routes and configure `/api/*` to reach the backend separately. The Vite development proxy does not run on a static production host. The current app assumes hosting at the domain root.

See [authentication](docs/authentication.md), [UI conventions](docs/design-system.md), and [workspace behavior](docs/product-pages.md) for focused implementation notes. Browser visual/keyboard/zoom checks still require a working browser environment; Chrome startup has been blocked here.
