**Agent guide / Markdown**

COPYABLE SOURCE · select this text and copy to your preferred editor. Adapter required for design-tool import.

---

# Legacy Wealth Cooperatives — Design System
Version 1.0.0. Source: approved 04 Quiet Distinction identity.

## Scope and authority
This guide governs member wealth dashboards, financial forms, data views and feedback. Preserve the supplied tree silhouette and horizontal tree/divider/three-line name lockup. Brand wordmark: Inter Light, 17% tracking; LEGACY / WEALTH / COOPERATIVES. Original reference font was not identified; Inter is the approved available interpretation. Latest company spelling is authoritative.

## Non-negotiables
- Master brand colour #005250. No recoloured alternative brand.
- ALL ordinary light-surface text #001414, including headings, labels, helper and secondary copy; differentiate by type hierarchy. Light text on dark surfaces and functional status text are explicit contrast exceptions.
- Financial figures in examples are illustrative, not verified balances or investment returns.
- UI states are design specifications, not live prototype behaviour.
- Native Light and Dark colour collections are separate because this document allows one mode per collection. Rebind by matching semantic names; this is not a single-collection mode toggle.
- Never alter unrelated original identity boards.

## Colour architecture
Primitives are raw values. Semantic collections alias primitives. Bind every surface/text/control to semantic roles. Decorative borders are not meaningful control boundaries.

### Brand primitives
- brand/50: #F3FDFD
- brand/100: #B1E7E7
- brand/200: #73D4D4
- brand/400: #319E9E
- brand/700: #005250
- brand/800: #003D3C
- brand/900: #002928
- brand/950: #001414

### light semantic colour roles
- background/canvas: #F3FDFD
- surface/default: #FFFFFF
- surface/raised: #F3FDFD
- text/primary: #001414
- text/secondary: #001414
- text/muted: #001414
- border/subtle: #C9DEDD
- border/control: #648683
- action/default: #005250
- action/hover: #003D3C
- action/pressed: #002928
- action/on: #F3FDFD
- secondary/default: #B1E7E7
- secondary/hover: #73D4D4
- secondary/pressed: #319E9E
- secondary/on: #001414
- selection/default: #B1E7E7
- focus/ring: #005250
- disabled/background: #E1ECEB
- disabled/text: #648683
- chart/primary: #005250
- chart/secondary: #426C6A
- status/success/background: #E5F5EC
- status/success/text: #176344
- status/success/border: #287952
- status/warning/background: #FFF4D6
- status/warning/text: #775000
- status/warning/border: #956300
- status/danger/background: #FDECEB
- status/danger/text: #A52B2B
- status/danger/border: #BE4444
- status/info/background: #EAF2FF
- status/info/text: #2454A4
- status/info/border: #4778BE

### dark semantic colour roles
- background/canvas: #001414
- surface/default: #002928
- surface/raised: #003D3C
- text/primary: #F3FDFD
- text/secondary: #B1E7E7
- text/muted: #89ADAA
- border/subtle: #194B49
- border/control: #5B8A86
- action/default: #73D4D4
- action/hover: #B1E7E7
- action/pressed: #319E9E
- action/on: #001414
- secondary/default: #003D3C
- secondary/hover: #005250
- secondary/pressed: #005250
- secondary/on: #B1E7E7
- selection/default: #003D3C
- focus/ring: #73D4D4
- disabled/background: #123431
- disabled/text: #6C8E89
- chart/primary: #73D4D4
- chart/secondary: #B1E7E7
- status/success/background: #0B3023
- status/success/text: #85D6AC
- status/success/border: #419B70
- status/warning/background: #352A0E
- status/warning/text: #F2CD70
- status/warning/border: #A88535
- status/danger/background: #381B1B
- status/danger/text: #FFB4AB
- status/danger/border: #CB736D
- status/info/background: #122C46
- status/info/text: #AACBFF
- status/info/border: #5B91CF

## Typography — exactly nine levels
Interface: Inter. Financial amounts/identifiers: IBM Plex Mono Regular, reusing the defined nine size levels, not an extra hierarchy. Label/Title/Section are preferred for dense data; Display/Hero are permitted for featured balances. Financial text right-aligns in tables; use locale-aware Intl.NumberFormat and full accessible currency names.
- Caption: 12px / 16px, Regular 400.
- Label: 14px / 20px, Medium 500.
- Body: 16px / 24px, Regular 400.
- Lead: 18px / 28px, Regular 400.
- Title: 20px / 28px, Medium 500.
- Heading: 24px / 32px, Medium 500.
- Section: 32px / 40px, Light 300.
- Display: 40px / 48px, Light 300.
- Hero: 48px / 56px, Light 300.
Hero48 becomes32/40 on mobile; body never below16. Keep brand tracking17% for wordmark only; no heavily tracked financial values. Text resize200%, zoom400%, no clipped labels.

## Spacing and dimensions
8px base: 0, 8, 16, 24, 32, 40, 48, 64, 80, 96, 128px. 4px optical microspacing only; 1px borders, 2px focus are exceptions. Radius0/4/8/12/16/999px; default card12, controls8. Padding24 cards,16 fields; gap24 desktop. Controls40 compact/48 default/56 large; compact hit-area must reach44. Sidebar240 (xl256), rail80, desktop bar80, mobilebar64. Table rows56; card figures32/40.

## Responsive rules
- xs 0-599px: 4 columns, 16px outer margin, 16px gap; 64px bottom nav; critical actions retained.
- sm 600-959px: 8 columns, 24px outer margin, 24px gap; 80px collapsible rail.
- md 960-1279px: 12 columns, 32px outer margin, 24px gap; 240px collapsible sidebar.
- lg 1280-1599px: 12 columns, 32px outer margin, 24px gap; 240px sidebar.
- xl 1600-unboundedpx: 12 columns, 48px outer margin, 32px gap; 256px sidebar; content max 1600px.
Use content max1600 centered at xl. At320px reflow to single column, charts with summaries, table internal horizontal scroll+sticky identifier or labelled rows. Never hide essential money/date/status or critical actions. Navigation labels remain accessible when visually collapsed. Breakpoints describe CSS viewport width, not device names.

## Motion principles
- instant: 0ms.
- fast: 100ms.
- standard: 180ms.
- enter: 240ms.
- exit: 160ms.
- complex: 320ms.
- standard easing: cubic-bezier(0.2,0,0,1).
- enter easing: cubic-bezier(0,0,0,1).
- exit easing: cubic-bezier(0.4,0,1,1).
- linear easing: cubic-bezier(0,0,1,1).
No overshoot, bouncing, flashing or rolling financial digits. Transition opacity or small position changes only when helpful. prefers-reduced-motion:0ms, no transforms, autoplay or animated chart drawing; retain labelled busy status. Loading does not invent progress values.

## Accessibility acceptance criteria — WCAG 2.2 AA target
Normal text>=4.5:1; large text>=3:1 (24px regular or18.66px bold); meaningful non-text UI>=3:1. Decorative borders exempt only when not sole control identification. 2px visible focus with2px surface gap, never obscured; 44px targets exceed AA24px minimum. Logical keyboard order; semantic landmarks/headings; names/roles/values; screen-reader-friendly error recovery and input hints. Labels persist. Do not use colour alone; status text+glyph, chart labels/dashes plus equivalent data table. Modal focus trap and return; nonmodal surfaces do not trap. Financial changes are announced politely, not at every market tick. Test forced colours, keyboard-only, screen reader, 200% text and 400% zoom/320px reflow. Token contrast is measured, not full-product certification.

### Measured colour-pair evidence
- light text/primary / surface: 18.92:1 (minimum 4.5:1).
- light text/secondary / surface: 18.92:1 (minimum 4.5:1).
- light text/muted / surface: 18.92:1 (minimum 4.5:1).
- light action/default: 8.73:1 (minimum 4.5:1).
- light action/hover: 11.70:1 (minimum 4.5:1).
- light action/pressed: 15.05:1 (minimum 4.5:1).
- light status/success: 6.40:1 (minimum 4.5:1).
- light status/warning: 6.54:1 (minimum 4.5:1).
- light status/danger: 6.17:1 (minimum 4.5:1).
- light status/info: 6.48:1 (minimum 4.5:1).
- light control border / surface: 3.98:1 (minimum 3:1).
- dark text/primary / surface: 15.05:1 (minimum 4.5:1).
- dark text/secondary / surface: 11.47:1 (minimum 4.5:1).
- dark text/muted / surface: 6.40:1 (minimum 4.5:1).
- dark action/default: 10.90:1 (minimum 4.5:1).
- dark action/hover: 13.92:1 (minimum 4.5:1).
- dark action/pressed: 5.87:1 (minimum 4.5:1).
- dark status/success: 8.36:1 (minimum 4.5:1).
- dark status/warning: 9.23:1 (minimum 4.5:1).
- dark status/danger: 9.23:1 (minimum 4.5:1).
- dark status/info: 8.61:1 (minimum 4.5:1).
- dark control border / surface: 4.02:1 (minimum 3:1).

## Global state model
Precedence disabled > busy > invalid > selected > pressed > hover > rest; focus remains additive where focusable. Disabled fields explain why. ReadOnly remains selectable/copyable. Never imply a completed financial action before server acknowledgement. Require review of amount/source/destination/fees and idempotent submit. Errors preserve input and provide recovery. Distinguish empty data from zero balance.

## Thirty component specifications

### 01. Button
Trigger one clearly named action.
- Anatomy: Label, optional leading/trailing 20px icon, busy indicator.
- Props/defaults: variant: primary|secondary|danger=primary; size:sm|md|lg=md; disabled:boolean=false; loading: boolean=false; label:string required.
- Measurements: 40/48/56px high; padding16/24; radius8; label14/20 medium.
- States: Default action/default; hover action/hover; pressed action/pressed; focus 2px focus/ring +2px surface gap; disabled disabled/background + disabled/text; loading locks width, shows labelled spinner, prevents repeat submit. Secondary uses secondary/*; danger uses status/danger; selected N/A (use toggle).
- Keyboard/ARIA: Native button; Enter/Space activate. aria-busy while loading; retain accessible name. Financial submissions require review, idempotent request and duplicate prevention.
- Responsive: Full width below600 where primary action; do not reverse confirm/cancel order.
- Theme: Bind named semantic roles from Light/Dark collections; no raw colour override. Light ordinary text #001414; inverse and status text are exceptions.

### 02. Icon button
Compact action with a mandatory accessible name.
- Anatomy: 20px glyph in a target; tooltip for discovery.
- Props/defaults: icon:string required; label:string required; variant:ghost|filled=ghost; size:sm|md=md; disabled: boolean=false.
- Measurements: 44px minimum target; md48; glyph20; radius8.
- States: Default transparent/text.primary; hover selection/default; pressed secondary/default; focus ring; disabled disabled/text; loading busy glyph. Selected only for explicit toggle with aria-pressed; no unlabeled decorative controls.
- Keyboard/ARIA: Native button; Enter/Space activate; aria-label describes action not shape. Tooltip appears on focus as well as hover.
- Responsive: Never shrink hit target to fit a tight toolbar; move overflow actions to labelled menu.
- Theme: Bind named semantic roles from Light/Dark collections; no raw colour override. Light ordinary text #001414; inverse and status text are exceptions.

### 03. Text link
Navigate to a destination, not submit an action.
- Anatomy: Descriptive text and optional external-link indicator.
- Props/defaults: href:string required; external: boolean=false; disabled unsupported.
- Measurements: Body16/24; inline links underlined; 44px block target where standalone.
- States: Default text.primary + underline; hover thicker underline; pressed same text + underline; focus ring; visited text unchanged for financial privacy. Loading/selected/disabled N/A: omit destination or use explanatory text.
- Keyboard/ARIA: Native a with valid href; Enter follows; external destinations identified in text. No javascript:void navigation.
- Responsive: Wrap naturally without truncating destination purpose; do not rely on icon alone.
- Theme: Bind named semantic roles from Light/Dark collections; no raw colour override. Light ordinary text #001414; inverse and status text are exceptions.

### 04. Text field
Collect a short single value with persistent label.
- Anatomy: Label, input, optional prefix/suffix, hint, error message.
- Props/defaults: label:string required; value:string=""; type:text|email|password|number=text; required=false; disabled=false; readOnly=false; invalid=false.
- Measurements: 48px control; padding16; 1px border/control; radius8; body16; label14.
- States: Empty placeholder is not a label; default surface/default; hover stronger focus border; focus ring; filled preserves label; invalid status/danger border + inline text; disabled disabled/*; readOnly focusable/copyable not editable; loading validates without erasing value.
- Keyboard/ARIA: Native input and label association; aria-describedby for hint/error; aria-invalid only after validation. Tab enters; browser text editing keys unchanged.
- Responsive: Full available width; labels above; never truncate helper/error text; localise decimals for money.
- Theme: Bind named semantic roles from Light/Dark collections; no raw colour override. Light ordinary text #001414; inverse and status text are exceptions.

### 05. Textarea
Collect multi-line instructions without losing context.
- Anatomy: Label, textarea, optional character count, hint/error.
- Props/defaults: value:string=""; rows:number=4; maxLength:number optional; required=false; disabled=false; readOnly=false; invalid=false.
- Measurements: Min120px high; padding16; body16/24; radius8; vertical resize allowed.
- States: Empty,filled,hover,focus,invalid,disabled,readOnly follow Text field. At limit show count and error without deleting typed content. Loading N/A except external form-level submission.
- Keyboard/ARIA: Native textarea; Enter adds newline, not submit; label and aria-describedby; spellcheck appropriate to content.
- Responsive: Grow vertically; preserve user resizing; scroll internally after agreed max320px; no fixed clipped error text.
- Theme: Bind named semantic roles from Light/Dark collections; no raw colour override. Light ordinary text #001414; inverse and status text are exceptions.

### 06. Select
Choose one item from a short stable list.
- Anatomy: Persistent label, selected value, chevron, option list, hint/error.
- Props/defaults: options:Array<{value,label,disabled?}> required; value:string= ; placeholder:string; disabled=false; invalid=false.
- Measurements: 48px high; padding16; chevron20; option44px min.
- States: Closed default/hover/focus; open options; selected explicit check; disabled option skipped; empty prompt; invalid inline error; loading disables open and labels fetching; readOnly render text not fake disabled select.
- Keyboard/ARIA: Prefer native select; Arrow keys select; Space/Alt+Down opens per platform; Esc closes. Associate label.
- Responsive: Native picker on touch; menu width at least control; long options wrap rather than clip meaning.
- Theme: Bind named semantic roles from Light/Dark collections; no raw colour override. Light ordinary text #001414; inverse and status text are exceptions.

### 07. Combobox
Search and choose from a large option set.
- Anatomy: Label, editable input, listbox, options, active indicator, results status.
- Props/defaults: options:Array required; value:string|null=null; query:string=""; async=false; disabled=false; invalid=false; multiple=false.
- Measurements: 48px input; options44px min; list max320px; padding16.
- States: Default,hover,focus,open,active,selected; loading labelled results; empty offers no-results guidance; error offers retry; invalid preserves query; disabled no edits. ReadOnly renders chosen value.
- Keyboard/ARIA: role combobox, aria-expanded, aria-controls, aria-autocomplete=list; active-descendant points to option. Up/Down active; Enter chooses; Esc closes; input keeps focus. Debounce async search180ms and cancel stale responses.
- Responsive: Touch list may use full-width sheet; keep input visible above keyboard; no inaccessible custom native-select imitation.
- Theme: Bind named semantic roles from Light/Dark collections; no raw colour override. Light ordinary text #001414; inverse and status text are exceptions.

### 08. Checkbox
Select independent options with an optional mixed parent.
- Anatomy: 20px box, check or minus glyph, label, optional hint/error.
- Props/defaults: checked:boolean=false; indeterminate:boolean=false; disabled=false; invalid=false; label:string required.
- Measurements: 20px visual in44px target; label16/24; optical gap8.
- States: Unchecked surface + border/control; hover selection; checked action/default + action/on check; mixed shows minus; focus ring; pressed immediate preview; disabled uses disabled/*; invalid adds labelled error not red-only box. Loading N/A.
- Keyboard/ARIA: Native checkbox; Space toggles; mixed maps aria-checked=mixed; label clickable; group in fieldset/legend.
- Responsive: Wrap label; box aligns to first line; do not shrink target inside tables.
- Theme: Bind named semantic roles from Light/Dark collections; no raw colour override. Light ordinary text #001414; inverse and status text are exceptions.

### 09. Radio group
Choose exactly one of mutually exclusive options.
- Anatomy: Legend, radio options, labels, optional group hint/error.
- Props/defaults: options:Array required; value:string|null=null; name:string required; orientation: vertical|horizontal=vertical; disabled=false; invalid=false.
- Measurements: 20px visual/44px target; gap16 between choices; label16/24.
- States: Unselected,hover,pressed,focus,selected,disabled; invalid message at group. Loading/readOnly N/A: show summary when locked rather than fake choice.
- Keyboard/ARIA: Native same-name radios in fieldset; Tab enters selected or first; arrows move/select; Space selects. Group legend describes decision.
- Responsive: Horizontal only when labels fit; vertical below600; never preselect consent or irreversible financial authorisation.
- Theme: Bind named semantic roles from Light/Dark collections; no raw colour override. Light ordinary text #001414; inverse and status text are exceptions.

### 10. Switch
Apply an immediate reversible setting.
- Anatomy: Track, thumb, persistent label and optional status text.
- Props/defaults: checked:boolean=false; disabled=false; loading=false; label:string required.
- Measurements: 40x24px visual inside48px row; thumb16; label16; target44 minimum.
- States: Off uses control border; on action/default; hover selection halo; pressed thumb feedback; focus ring; disabled disabled/*; pending shows busy without lying about saved state; failure reverts and explains. Invalid/indeterminate N/A.
- Keyboard/ARIA: Native checkbox role=switch; Space toggles; aria-checked; label must not change between states. Server preference update reports success/failure.
- Responsive: Label plus explanatory text wraps beside track; do not use for submit-required choices (use checkbox).
- Theme: Bind named semantic roles from Light/Dark collections; no raw colour override. Light ordinary text #001414; inverse and status text are exceptions.

### 11. Segmented control
Switch one view or filter without navigation.
- Anatomy: Group label, 2-5 equal buttons, selected background.
- Props/defaults: items:Array required; value:string required; disabled=false; size:sm|md=md.
- Measurements: 40/48px visual; target44; gap0; padding4 optical; label14/20.
- States: Rest,hover,pressed,focus,selected,disabled per segment; loading retains current selection. Selected uses selection/default + text.primary. Invalid/empty N/A; require at least two items.
- Keyboard/ARIA: Single-select filter uses radiogroup/radio; roving Tab; arrows/Home/End navigate and select. If changing panels use Tabs instead.
- Responsive: Wrap to vertical buttons or labelled Select when items cannot fit; never shrink labels below14.
- Theme: Bind named semantic roles from Light/Dark collections; no raw colour override. Light ordinary text #001414; inverse and status text are exceptions.

### 12. Tabs
Navigate related panels within the current page.
- Anatomy: Tablist, tabs, active indicator, associated tabpanels.
- Props/defaults: items:Array<{id,label,panel}> required; activeId:string; activation:manual|auto=manual; disabledIds:string[]=[].
- Measurements: 48px high; padding16; active underline2; label14/20; min target44.
- States: Default,hover,focus,selected,disabled; loading panel retains active label and aria-busy; error/empty in panel not tab. Pressed gives selection feedback. Invalid/readOnly N/A.
- Keyboard/ARIA: role tablist/tab/tabpanel; aria-selected, aria-controls; one tab in Tab order. Arrows/Home/End move; Enter/Space activates in manual mode.
- Responsive: Horizontal scroll within tablist if necessary with visible overflow controls; do not hide active tab; stack content.
- Theme: Bind named semantic roles from Light/Dark collections; no raw colour override. Light ordinary text #001414; inverse and status text are exceptions.

### 13. Sidebar navigation
Provide consistent product destinations.
- Anatomy: Brand lockup, labelled groups, icon+text links, current page, account/support links.
- Props/defaults: items:Array required; currentPath:string; collapsed=false; pendingCount:number=0.
- Measurements: 240px sidebar; 80px rail; nav item48px; padding16; 20px glyph.
- States: Default,hover,focus,current via selection/default + text.primary and indicator; pressed navigation; disabled destination includes reason or omitted; loading page uses progress, not dead links; error appears in destination.
- Keyboard/ARIA: Native nav landmark with links; aria-current=page; Tab through links; collapse button with aria-expanded. Do not trap arrows unless a true menu widget.
- Responsive: xs bottom nav64 + More sheet; sm rail80 with labels available; md collapsible240; xl256. Current destination retained across layouts.
- Theme: Bind named semantic roles from Light/Dark collections; no raw colour override. Light ordinary text #001414; inverse and status text are exceptions.

### 14. Top app bar
Orient the user and expose global account actions.
- Anatomy: Page title/breadcrumb, search, notifications, profile/account menu.
- Props/defaults: title:string required; searchEnabled=false; notificationCount:number=0; sticky=true.
- Measurements: 80px desktop; 64px mobile; padding24/16; actions44px min.
- States: Default surface/default; scrolled thin divider; action hover/pressed/focus; menu open; busy search; failed search accessible message; disabled individual action only. Bar selected/invalid N/A.
- Keyboard/ARIA: Header landmark; search labelled; notifications announce unread count without constant live updates; account button aria-expanded and restores focus when menu closes.
- Responsive: Keep page title and primary actions; collapse search to labelled icon opening field; safe area padding on mobile.
- Theme: Bind named semantic roles from Light/Dark collections; no raw colour override. Light ordinary text #001414; inverse and status text are exceptions.

### 15. Breadcrumbs
Show hierarchy above deep destinations.
- Anatomy: Ordered list, ancestor links, separators, current page text.
- Props/defaults: items:Array<{label,href?}> required; maxVisible:number=4.
- Measurements: 14/20 type; gap8; links have44px hit area; separator decorative.
- States: Ancestor default/hover/focus/pressed follows Text link; current plain text aria-current; collapsed overflow open. Disabled/loading/selected/error N/A for static trail.
- Keyboard/ARIA: nav aria-label=Breadcrumb; ordered list; separators aria-hidden; current not unnecessarily linked.
- Responsive: Collapse middle ancestors into labelled overflow; retain parent and current; wrap rather than clipping location.
- Theme: Bind named semantic roles from Light/Dark collections; no raw colour override. Light ordinary text #001414; inverse and status text are exceptions.

### 16. Card
Group one coherent piece of information.
- Anatomy: Optional heading/actions, body, optional footer separated by spacing.
- Props/defaults: title:string optional; interactive: boolean=false; selected: boolean=false; padding:16|24=24.
- Measurements: Radius12; padding24; gap16; decorative border/subtle1px; no default shadow.
- States: Static default only; hover/pressed/focus only when explicitly a single-action link/button card; then use control border and ring. Selected selection/default + labelled state. Loading uses stable skeleton; empty explains next step; error offers retry. Disabled N/A for passive content.
- Keyboard/ARIA: Use section/article with heading; interactive card uses one meaningful link and no nested interactive elements; do not add tabindex to passive card.
- Responsive: Full width on small viewports; body expands, never crop descriptions; footer actions wrap in reading order.
- Theme: Semantic Light/Dark roles; ordinary light-surface text #001414; inverse/status colours are exceptions. All actions obey global state precedence.

### 17. Metric card
Present a financial figure with context and timeframe.
- Anatomy: Label, localised value, comparison or note, optional trend glyph and action.
- Props/defaults: label:string required; value:number|null; currency:string=GBP; delta:number|null=null; period:string required; loading=false.
- Measurements: Padding24; value32/40 IBM Plex Mono; label14/20; note14/20; min height144.
- States: Default surface/default; loading skeleton preserves units; empty shows em dash + explanation not zero; error Retry; positive/negative labelled in words and symbols. Hover/focus only on optional link; disabled/checked N/A. Never imply a positive delta is always good.
- Keyboard/ARIA: Definition list or labelled group. Full currency accessible name; no live announcement for every market tick. Trend has text equivalent; currency display uses Intl.NumberFormat.
- Responsive: Wrap comparisons; at xs use one or two columns only when full amounts fit; no truncation of money.
- Theme: Semantic Light/Dark roles; ordinary light-surface text #001414; inverse/status colours are exceptions. All actions obey global state precedence.

### 18. Status badge
Label a compact state without implying a button.
- Anatomy: Optional status glyph, short text, tonal fill.
- Props/defaults: tone:neutral|success|warning|danger|info=neutral; label:string required; icon:boolean=true.
- Measurements: Min24px high; padding8; radius4; 12/16 caption; icon16.
- States: Static tonal background/text; no hover/pressed/focus/disabled/loading because noninteractive. A pending status may read Pending, but badge itself is not a spinner. Selected/error represented by explicit label and tone.
- Keyboard/ARIA: Plain text span; status glyph aria-hidden if label duplicates it; no unnecessary role=status on every table row.
- Responsive: Never truncate status meaning; allow wrapping if long; do not use colour alone.
- Theme: Semantic Light/Dark roles; ordinary light-surface text #001414; inverse/status colours are exceptions. All actions obey global state precedence.

### 19. Inline alert
Explain a persistent situation within task context.
- Anatomy: Status glyph, title, description, optional recovery action/dismiss.
- Props/defaults: tone:success|warning|danger|info=info; title:string required; message:string; dismissible=false.
- Measurements: Padding16; gap8; radius8; 20px glyph; 16/24 body; actions44px target.
- States: Default semantic status/*; hover/pressed/focus only on action/dismiss; submitting recovery busy; resolved success update; error persistence until recovery. Alert itself disabled/selected N/A.
- Keyboard/ARIA: role=alert for new urgent errors only; nonurgent role=status/polite or plain region. Do not steal focus. Associate form summary errors with field links.
- Responsive: Stack actions below body at xs; title remains readable; long details never clipped or auto-dismissed.
- Theme: Semantic Light/Dark roles; ordinary light-surface text #001414; inverse/status colours are exceptions. All actions obey global state precedence.

### 20. Toast
Confirm a reversible background result without interrupting.
- Anatomy: Status icon, short message, optional Undo and dismiss.
- Props/defaults: tone:success|danger|info=success; duration:number=6000; actionLabel:string optional; dismissible=true.
- Measurements: Max400px; padding16; min64px; radius8; target44 for actions.
- States: Entering240ms; visible; action hover/pressed/focus; paused on pointer/focus; dismissing160ms. Errors and actionable toasts persist until dismissed. Duplicate events coalesced. Disabled/selected N/A; busy action prevents repeat.
- Keyboard/ARIA: Polite live region for completion; assertive only truly urgent. Do not move focus; keep dismissed origin focus stable. Undo must have reliable outcome.
- Responsive: Bottom placement respecting safe areas; full width minus32 on phone; max3 stacked; persistent task error also appears inline.
- Theme: Semantic Light/Dark roles; ordinary light-surface text #001414; inverse/status colours are exceptions. All actions obey global state precedence.

### 21. Tooltip
Provide supplemental help, never required information.
- Anatomy: Anchor, brief text bubble, optional decorative pointer.
- Props/defaults: content:string required; placement:top|bottom|left|right=top; delay:number=500.
- Measurements: Max240px; padding8/16; radius4; 14/20 text.
- States: Hidden; hover after500ms; focus immediate; open; closed on Esc or pointer leave with100ms bridge. Disabled anchor may use focusable wrapper only if necessary. Loading/pressed/selected/invalid N/A.
- Keyboard/ARIA: role=tooltip; anchor aria-describedby; no interactive children; Escape dismisses; keep pointer hoverable and content persistent while hovered.
- Responsive: Reposition inside viewport; essential explanation must be visible text on touch not tooltip-only.
- Theme: Semantic Light/Dark roles; ordinary light-surface text #001414; inverse/status colours are exceptions. All actions obey global state precedence.

### 22. Popover
Show small contextual interactive content.
- Anatomy: Anchor, labelled surface, content, optional close/action.
- Props/defaults: open:boolean=false; placement:bottom-start|bottom-end=bottom-start; modal:boolean=false.
- Measurements: Min240/max400px; padding16; radius12; 1px control border; gap8.
- States: Closed; anchor hover/pressed/focus; open; loading content aria-busy; empty guidance; failure retry; disabled anchor cannot open. Selected belongs to internal control, not surface.
- Keyboard/ARIA: aria-expanded/controls on trigger; appropriate dialog/menu semantics to content, not role=tooltip. Esc and outside click close; return focus to trigger; nonmodal Tab proceeds logically without trap.
- Responsive: Clamp to viewport16px margins; become labelled sheet when content cannot fit; avoid anchor loss on scroll.
- Theme: Semantic Light/Dark roles; ordinary light-surface text #001414; inverse/status colours are exceptions. All actions obey global state precedence.

### 23. Dialog
Require a focused decision or review before consequential action.
- Anatomy: Overlay, title, description/body, close, primary/secondary actions.
- Props/defaults: open=false; title:string required; kind:standard|confirmation=standard; dismissible=true; busy=false.
- Measurements: Width560 desktop/max calc(100%-32px); padding32 desktop/24 mobile; radius16; max viewport height minus48.
- States: Closed; enter; open; action hover/pressed/focus; submitting busy locks confirm once; validation error inline retains input; success close only after acknowledgement. Danger confirmation summarises amount, source, recipient, fee. Background inert.
- Keyboard/ARIA: role=dialog aria-modal=true aria-labelledby; initial focus least destructive action for irreversible
confirmations; trap Tab/Shift+Tab; Esc closes unless busy with safe explanation; restore trigger focus.
- Responsive: At xs full-width with16px margins; internal body scroll with actions visible; never rely on coloured confirm button as sole warning.
- Theme: Semantic Light/Dark roles; ordinary light-surface text #001414; inverse/status colours are exceptions. All actions obey global state precedence.

### 24. Drawer
Expose a secondary task without discarding page context.
- Anatomy: Overlay for modal use, panel title, close, body, footer actions.
- Props/defaults: open=false; side:right|left=right; modal=true; title:string required; dirty=false.
- Measurements: Width480 desktop; padding24; header64; footer80; body flexible scroll.
- States: Closed/enter/open/exit; internal actions hover/pressed/focus; loading skeleton; error/retry; dirty close prompts save/discard; busy submit prevents duplication. Disabled/selected N/A on shell.
- Keyboard/ARIA: Modal role dialog traps focus, inert background and Esc handling; nonmodal complementary region does not trap. Initial focus heading or first task field; return focus on close.
- Responsive: Full-width sheet at xs; safe-area footer; preserve unsaved data on orientation change.
- Theme: Semantic Light/Dark roles; ordinary light-surface text #001414; inverse/status colours are exceptions. All actions obey global state precedence.

### 25. Data table
Present comparable financial records with reliable controls.
- Anatomy: Caption, headers/sort, optional selection, rows, cell actions, pagination, status.
- Props/defaults: columns:Array required; rows:Array=[]; sort:{id,direction}|null=null; selection:string[]=[]; loading=false; error:string|null=null.
- Measurements: Header48px; rows56px min; padding16; numeric IBM Plex Mono14/20 right-aligned; checkbox44 target; separator1px.
- States: Default rows; hover selection tint; focus interactive cell ring; selected labelled checkbox; header mixed selection; sort asc/desc aria-sort; loading stable skeletons; empty purpose+action; error retry; disabled row action explained. Bulk action busy.
- Keyboard/ARIA: Native table with caption, th scope; sort buttons aria-sort on header; Tab goes controls only unless explicit grid; Space checkbox. Do not make whole row focusable without action; visible full amount or accessible full value.
- Responsive: Contained horizontal scroll and sticky first identifying column; alternative labelled transaction cards on phone. No hidden currency/date/status. Provide row-count updates politely.
- Theme: Semantic Light/Dark roles; ordinary light-surface text #001414; inverse/status colours are exceptions. All actions obey global state precedence.

### 26. Pagination
Move across a stable paged result set.
- Anatomy: Previous/next, current page, optional number buttons, result count/size selector.
- Props/defaults: page:number=1; pageSize:10|25|50=25; total:number required; disabled=false; loading=false.
- Measurements: 44px controls; gap8; 14/20 labels; min result count16/24 when prose.
- States: Default/hover/pressed/focus; selected current aria-current; disabled previous at1 and next atlast; loading retains current content aria-busy and prevents repeated requests; error retry previous state; empty0results no page controls.
- Keyboard/ARIA: nav aria-label=Pagination; buttons named Go to page N; announce result range after completion, maintain control focus.
- Responsive: Compact Previous / Page X of Y / Next below600; retain result count; avoid long number strips.
- Theme: Semantic Light/Dark roles; ordinary light-surface text #001414; inverse/status colours are exceptions. All actions obey global state precedence.

### 27. Date range picker
Choose an inclusive reporting period unambiguously.
- Anatomy: Label, date fields or trigger, two-date calendar, presets, apply/cancel.
- Props/defaults: value:{start,end}|null=null; min:string optional; max:string optional; locale:string=en-GB; disabled=false; invalid=false.
- Measurements: 48px fields; day target44px; two months desktop/one mobile; padding16; 14/20 dates.
- States: Closed/hover/focus/open; start selected; in-range tint; end selected; today outline+label; unavailable disabled; invalid range message; partial retains start; Apply disabled until valid; loading data after apply not on every hover.
- Keyboard/ARIA: Input format hint; dialog + calendar grid; arrows day, Home/End week, PageUp/Down month; Enter/Space choose; Esc cancel; focus return. Manual date typing available.
- Responsive: One calendar on xs; native-friendly editable fields; locale formats explicit; inclusive timezone and date-only boundaries documented.
- Theme: Semantic Light/Dark roles; ordinary light-surface text #001414; inverse/status colours are exceptions. All actions obey global state precedence.

### 28. File upload
Collect verified documents with clear progress and recovery.
- Anatomy: Label, drop zone, browse button, requirements, file row, progress/status, remove/retry.
- Props/defaults: accept:string[] required; maxSizeMB:number=10; multiple=false; disabled=false; files:Array=[].
- Measurements: Drop area min160px; padding24; border/control dashed1px; file row64px; target44.
- States: Idle; hover/drag-over selection; focus; uploading determinate progress; success filename+check; invalid type/size inline error; failed retry; cancelled removable; disabled retains explanation. Virus-scan pending shown distinctly from complete.
- Keyboard/ARIA: Native file input with labelled Browse; drag-drop optional; aria-describedby requirements; live progress milestones not everypercent; keyboard remove/retry; never upload before consent where required.
- Responsive: Browse works on touch; full filename available; limits visible before selection. Financial docs private: server validation and scan required.
- Theme: Semantic Light/Dark roles; ordinary light-surface text #001414; inverse/status colours are exceptions. All actions obey global state precedence.

### 29. Progress indicator
Communicate ongoing work accurately.
- Anatomy: Track/fill or spinner, accessible label, value or indeterminate description.
- Props/defaults: value:number|null=null; max:number=100; label:string required; size:sm|md=md.
- Measurements: Linear height8; spinner20/24px; explanatory text14/20; no layout shift.
- States: Indeterminate busy; determinate0–100; complete confirmed text; error recoverable message; paused labelled state. Hover/pressed/focus/selected/disabled N/A: noninteractive. Reduced motion uses static busy glyph and text.
- Keyboard/ARIA: role=progressbar with aria-valuemin/max/now when known; aria-valuetext descriptive; mark affected region aria-busy; polite milestone announcement. No fake incrementing timers.
- Responsive: Always retain textual label; full available track width; task remains perceivable when animations off.
- Theme: Semantic Light/Dark roles; ordinary light-surface text #001414; inverse/status colours are exceptions. All actions obey global state precedence.

### 30. Chart
Explain trends and allocation without requiring vision or colour perception.
- Anatomy: Title, timeframe, units, plotted series, axes, labelled legend, optional tooltip and data table.
- Props/defaults: type:line|bar|allocation=line; series:Array required; currency:string=GBP; period:string required; loading=false; error:string|null=null.
- Measurements: Min240px plot desktop/200mobile; axis14/20; line2px; marker6px; 24px padding; chart/primary and secondary semantic roles.
- States: Default; focused/hovered datum tooltip; selected period; loading stable skeleton; empty no-data reason; error retry; disabled series explicit legend + pattern; zoom reset when supported. Pressed applies filter not falsified values.
- Keyboard/ARIA: Figure with meaningful text summary; labelled controls; accessible data table toggle gives equivalent values; keyboard reachable data points/legend or table alternative; distinguish series by dash and label as well as hue.
- Responsive: One chart per row below600; never shrink axis below12; prioritise fewer ticks with full data equivalent. Explain sample values; no misleading scales or guaranteed-growth claims.
- Theme: Semantic Light/Dark roles; ordinary light-surface text #001414; inverse/status colours are exceptions. All actions obey global state precedence.

## Implementation / design-tool handoff
Four copyable outputs are on canvas: token JSON, CSS custom properties, component specification JSON and this Markdown source. Select source text and copy into a UTF-8 document. Import adapter must map semantic names, dimensions, typography and state axes; there is no claimed universal native importer. CSS is a token/example layer, not a complete application. Load licensed fonts separately. Native variables are bound to canvas colours; nine interface typography styles plus financial variants exist. Shared dashboard example data must stay internally consistent.

## Agent checklist
1. Read this guide and preserve the brand tree and name.
2. Select Light or Dark semantic bindings; never mix ordinary dark text with dark surfaces.
3. Choose existing components, honor their states and 8px rhythm.
4. Use the defined viewport breakpoints; verify320px and zoom.
5. Verify contrast, keyboard, focus, announcements and chart/table equivalence.
6. Never claim sample figures, state illustrations or token checks prove production runtime accessibility.
