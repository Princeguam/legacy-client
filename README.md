<<<<<<< HEAD

# Legacy Wealth Cooperatives frontend

React + TypeScript + Vite, with shared shadcn-style components following the supplied Quiet Distinction design system.

## Run

```sh
npm install
npm run dev
```

Open `/login` for the responsive sign-in page, or `/design-system` for the component preview. The login form calls the existing cooperative backend through a development proxy to `http://localhost:3000`. If that address differs, configure `API_PROXY_TARGET` using [.env.example](.env.example).

## Verify

```sh
npm run test:auth
npm run test:pages
npm run build
npm run lint
```

Build verifies the approved tokens, 30 component specifications, and 22 contrast pairs. Regenerate CSS/specifications with `npm run design-system:generate` after an approved source change.

Read [the login and API guide](docs/authentication.md) and [the design-system guide](docs/design-system.md) for structure, conventions and validation limits. The supplied [Agent Guide](Legacy%20Wealth%20Design%20System/Agent%20Guide.md) is the design authority.

# Open `/preview` to explore the illustrative member and admin workspaces. Member transactions can be recorded with a receipt as memory-only local drafts; they are reviewed before saving and never change the illustrative balances. Entries clear on reload, sign out, or workspace change. See [the product-page guide](docs/product-pages.md) for routes and behavior.

# legacy-client

Legacy Wealth Cooperative Client

> > > > > > > f0d7014efe57fc5d0d126728b73de2fd9c877f24
