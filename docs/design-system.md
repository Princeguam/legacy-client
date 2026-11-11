# Legacy Wealth design system implementation

The approved identity is **04 Quiet Distinction**, version 1.0.0. [agent-guide.md](design-system/agent-guide.md) is the exact repository copy of the supplied guide. [PROJECT_SCOPE.md](../PROJECT_SCOPE.md) includes the full guide plus the product scope and current owner-approved refinements; [AGENTS.md](../AGENTS.md) summarizes the working rules.

The optional original `Legacy Wealth Design System/` boards/exports remain preserved locally. Their malformed JSON, inconsistent variable names, and mistyped dimensions must not replace the guide’s approved values. The build does not read that ignored folder.

## Ownership and structure

- `src/design-system/tokens.json`: normalized token source, including the committed approved guide’s source path.
- `src/design-system/tokens.css`: generated semantic variables, typography, responsive grid values, and shadcn aliases.
- `src/design-system/components.json`: generated manifest of all 30 approved component specifications.
- `src/design-system/components.css`: owned component styling, not generated.
- `src/design-system/motion.css`: owned watermarks, motion, page loading, reduced-motion, and forced-colours treatments.
- `src/components/shared/ui`: locally owned primitives/native adapters, with shared Button/Modal/Table entry points.
- `src/components/shared/brand-logo`, `form-field`, `currency`, `metric-card`, `receipt`, `page-loader`, and `product`: brand and cooperative-specific components.

User/admin screens, navigation, role shells, and local transaction drafts are already implemented. See [product-pages.md](product-pages.md); these are no longer future placeholder directories.

## shadcn integration

Root `components.json` configures TypeScript, Tailwind v4, Lucide, and shared aliases. `cn` combines `clsx` and `tailwind-merge`. Components use locally owned shadcn composition/data-slot conventions with the approved semantic contract replacing stock appearance. The project does not currently install Radix or require the shadcn CLI. Native selects and modal dialogs are deliberate adapters, preserving platform keyboard/touch behavior and browser modal semantics.

Reuse the existing aliases and primitives when extending the UI. Tooling’s `baseColor` setting does not authorize stock neutral colours in the product. Avoid default gray helper text, default shadows, arbitrary spacing/type scales, and Tailwind’s stock breakpoints. The 30 specification entries do not imply that all 30 behaviors are implemented.

## Visual rules and current refinements

Master brand is `#005250`. All ordinary light text roles resolve to `#001414`, including helpers and secondary text. Inverse, functional status, and disabled roles follow their explicit tokens. Light/Dark semantic mappings use `data-theme`; the theme preference synchronizes on this device.

Exactly nine type classes are available: `type-caption`, `type-label`, `type-body`, `type-lead`, `type-title`, `type-heading`, `type-section`, `type-display`, and `type-hero`. Hero adapts from 48/56 to 32/40 below 600px. Inter is self-hosted in `public/fonts` with its licence. IBM Plex Mono Regular is used for financial values/identifiers and currently loads through Google Fonts; a fully offline font deployment would need a licensed local copy.

Preserve the original tree asset and tree/divider/three-line wordmark. Dark mode uses the inverse original silhouette on a transparent wrapper, with no backing cutout. The login’s centered supplied hand illustration remains on the teal right panel; selected stats cards and the white login panel use faint decorative tree watermarks.

Current owner-approved product refinements supersede the older source guide where they differ: sticky 64px top bar; 44px standard controls/targets; accent-only active navigation; collapsible 240/256px desktop sidebar and 80px rail; Settings/Feedback at the bottom; numbered unread notifications; borderless hamburger and left drawer below 960px, with no bottom navigation. Keep the current fonts. Approved spacing, radii, and 600/960/1280/1600px breakpoints remain in force.

## Component and financial behavior

Use `FormField` for persistent labels and hint/error associations. `Currency` supplies locale-aware visible amounts and full accessible currency names. `MetricCard` distinguishes unavailable data from confirmed zero. Finance examples remain labelled illustrative. Disabled is the highest-priority state; focus remains additive. Busy buttons retain their names/widths and block repeated activation. Errors preserve values and accepted receipts.

Native dialogs default to Cancel and use browser modal focus/inert behavior. Local transaction drafts require review and duplicate prevention, remain outside confirmed balances, and never imply server acknowledgement. Future production financial callers require authorized server integration and idempotent submission.

Motion uses approved duration/easing tokens. Exact financial values fade into place without invented intermediate digits; graphs have equivalent data tables. Loading shows the original tree fading to brand teal (inverse white in dark mode) without an artificial delay. Reduced motion removes animation/chart drawing while preserving static busy status. Forced colours hides decorative watermarks and uses system-colour control/loading treatments.

## Generation and verification

```sh
npm run design-system:generate
npm run design-system:check
npm run build
npm run lint
```

Only regenerate after an approved source/token change. Do not hand-edit generated CSS or the specification manifest. The checker reads `docs/design-system/agent-guide.md` and verifies guide/token consistency, generated output freshness, nine levels, spacing/radii/breakpoint/motion contracts, all 30 specifications, and 22 contrast pairs. Normal build retains this validation gate.

Commit the generator, approved guide, normalized tokens, and generated outputs together. Update the full-guide appendix in `PROJECT_SCOPE.md` when an approved guide change occurs; keep the original boards/exports intact.

Actual browser screenshots, keyboard/modal focus trapping, 320px reflow, 200% text resize, 400% zoom, reduced-motion, screen-reader, and forced-colours checks require a browser-capable environment. Chrome startup has been blocked here. Compilation, source/contrast checks, and DOM tests with mocked native dialog methods do not provide full runtime accessibility certification.
