# XOPS Design System — Build State

**Intent:** Status board only — what's built, what's not, what's next.

**When to use:** Read at the start of any XOPS session alongside `PLAN.md` (spec/phases) and `DECISIONS.md` (why); update at the end of any session that builds or changes state.

See `.claude/projects/xops/PLAN.md` for the full plan and rationale, `.claude/projects/xops/DECISIONS.md` for the why-behind-the-why decision log. Code and tokens live in `design-systems/xops/` — this doc set is separate from that, per the same pattern portfolio pages use (see CLAUDE.md's "Project Doc Sets").

## Session Workflow

1. Read this file + `.claude/guidelines.md` + `PLAN.md` + `design-systems/xops/components/built-components.md` + `design-systems/xops/tokens.css`
2. User provides a Figma node (legacy and/or modern version) + context
3. **Before building** — independently verify:
   - Read `design-systems/xops/components/built-components.md` — cross-reference every named component layer in the Figma against the registry
   - Read `design-systems/xops/tokens.json` and `tokens.css` — resolve all token bindings; if a token doesn't exist yet, flag it for the Foundations Audit rather than inventing one
   - Only the parent layer name is authoritative — treat it as the component reference. Ask before building if the mapping is unclear.
4. Branch on intent:
   - **New foundation token** → update `design-systems/xops/tokens.json` + `tokens.css` directly, confirm with user before locking in a value
   - **New primitive/pattern component** → build directly (no dedicated skill for this project — see `DECISIONS.md` 012), matching the token-resolution and layer→DOM rules from the portfolio's `component-builder` skill informally
   - **Structural gap or naming-pattern question** → run `/design-system-analysis` against a real reference; the anatomy-checklist dialogue happens live in conversation, nothing persists to a log. If a decision reached rises to strategic altitude, propose it for `DECISIONS.md`; if it's roadmap-worthy, graduate it to `PLAN.md`
   - **Placing the module into the case study page** → run `/section-builder` (portfolio skill, reused as-is)
5. **Every concrete token value requires explicit confirmation before being written — not just new categories.** Deciding *that* a dimension needs a token (e.g., "hover needs a color") is a structural conversation and has generally gone well. Deciding *which* value fills it (e.g., "hover = brand.600," "border-width = 1px," "disabled = 0.4 opacity") is an equally real decision, made twice unilaterally in this project already (border-width/icon-size, then the full `Semantic.state` color layer — see `DECISIONS.md` 017). No ramp step, px number, or opacity value gets written — even one that seems like an "obvious default" (one step darker on the ramp, matching a raw Figma number) — without being proposed with brief reasoning and confirmed first. This applies to every value in every token category, not just colors.
6. **Documentation (this file, `built-components.md`, `DECISIONS.md`) is batched at the end of a build session, not after each individual component.** Build as many components as possible uninterrupted; keep a running mental/todo note of what shipped and what real decisions were made along the way, then write it all up in one pass when the user is ready to close the session.
7. Draft decision log entries from what happened during the session (forks, naming choices, reversals, dead ends). Present drafted entries for confirmation before writing; only write confirmed entries into `DECISIONS.md`.

---

## Built (foundations, components, screens)

Format: plain numbered list, grouped by phase. Nothing built yet.

### Foundations
1. `color` — five 50–950 ramps (grey, brand, success, warning, danger) — `design-systems/xops/tokens.json`, `tokens.css` (see `DECISIONS.md` 010 for ramp-generation approach; `text.inverse` is a deliberate pure-white exception)
2. `typography` — Jost, 7-step scale — `design-systems/xops/tokens.json`, `tokens.css`
3. `spacing` — primitive-only scale — `design-systems/xops/tokens.json`, `tokens.css`
4. `radius` — primitive-only scale — `design-systems/xops/tokens.json`, `tokens.css`
5. `state` — cross-component semantic layer (hover, active, focus, disabled) — `design-systems/xops/tokens.json`, `tokens.css` (see `DECISIONS.md` 018)
6. `borderWidth`, `iconSize` (`20`, `16`) primitives — `design-systems/xops/tokens.json`, `tokens.css`
7. `radius.full` — added for fully-circular elements (notification badge, avatar) — `design-systems/xops/tokens.json`, `tokens.css`
8. `Grid` — top-level tier (sibling to `Primitives`/`Semantic`): columns, gutter, margin — `design-systems/xops/tokens.json`, `tokens.css` (see `DECISIONS.md` 027). Single fixed-width for now, no responsive breakpoints. Margin token itself unchanged, but ownership of *applying* it moved from the `Grid` component to the consuming page shell (see `DECISIONS.md`).
9. `radius.2` — added for small elements (Legend's color swatch); smallest step below the existing `radius.6` floor.
10. `legendSwatchSize` — new primitive tier (12px), dedicated rather than reusing `spacing.12`'s value for a size purpose.
11. `chart-1` through `chart-8` — new general-purpose data-viz color palette, primitive tier, no fixed category meaning (unlike `status.*`) — first colors used for chart/legend segments beyond what `status.*` covers.
12. `surface.stat` (grey.50) and `surface.page` (white) — new semantic surface tokens.

No general semantic layer over spacing/radius yet — component-scoped exceptions exist (`Semantic.button.*`, `Semantic.nav.background-active`, `Semantic.header.*`). Not yet established: elevation, motion.

### Primitives
- button — `Button.tsx`
- icon (shared masked-SVG primitive, token-colored) — `Icon.tsx`
- count — `Count.tsx`
- sidebar (nav shell) — `Sidebar.tsx`
- global header (top nav-bar) — `GlobalHeader.tsx`
- page header (title/count/meta, canonical final version) — `PageHeader.tsx`
- grid (`Grid` + `GridItem`, 12-col layout primitive) — `Grid.tsx` — not Figma-audited, built from the confirmed `Grid` token tier
- table — `Table.tsx`, data-driven (`columns` config + `data` array), semantic `<table>` — structure audited from Figma, content/columns/styling not yet final
- button `text` variant — clickable-cell-value style (e.g. drill-in table values) — `Button.tsx`
- control-height scale — `small`/`medium`/`large`, shared across Button/Dropdown/Input — `design-systems/xops/tokens.json`, `tokens.css`; `Button` gained a `size` prop wired to it
- menu — `Menu`/`MenuOption`, extracted as its own primitive since more than one consumer needs the same shape — `Menu.tsx` — **not Figma-audited, no open-menu-state reference existed; unconfirmed against any design source**
- dropdown — `Dropdown.tsx`, trigger + `Menu` panel, `size` prop off the shared control-height scale, click-outside/Escape-to-close
- pagination — `Pagination.tsx` — **still owed: meant to sit pinned/overlapping the table body (blur treatment is for this), not wired yet — deferred until real screen assembly (see Resume Context)**
- logo tile — `LogoTile.tsx`, bounded image container, one reusable component replacing two previously separate-looking instances (table cell, profile header) — new `logoTileSize` primitive tier, independent from `control-height`. Border revised this session from `border.divider` (grey.200) to `grey.100` directly — first component border to bypass the semantic divider token; flagged as a possible future `border.subtle` semantic candidate if the pattern recurs
- tag — `Tag.tsx`, single size, `status`: `success`/`warning`/`danger`/`neutral`. No icon slot (no icon-size token small enough yet — revisit if one is added), no removable/dismissible variant
- card — `Card.tsx`, single variant/size, title + content slot — `design-systems/xops/components/Card.tsx`
- table `chrome` prop — `Table.tsx` now supports `chrome={false}` (bare, no outer border/radius/bg) for embedding inside `Card`, vs. default `chrome={true}` for standalone full-page use
- table scroll-fade affordance — dual-edge gradient overlays signal hidden horizontally-overflowed columns, fade in/out on scroll — `Table.tsx`
- stat — chrome-optional label/value/meta tile, filled-only, splits its row evenly with sibling `Stat`s — `Stat.tsx`. Default size now 24px/14px regular (was 14px/12px) — new system-wide default, not a variant.
- legend — swatch/label/value/meta row stack, generic `color` prop — `Legend.tsx`
- donut chart — hand-built SVG ring, `segments: {value, color}[]`, live-data-ready (proportions computed from real values) — `DonutChart.tsx`
- filter tabs — `FilterTabs.tsx`, radiogroup of pill buttons, `size` scale (small/medium/large) off the shared control-height tokens. Gained a `variant` prop this session (`"default" | "large"`), a new axis orthogonal to `size` — `variant="large"` is the stat-card-shaped tab (label + info icon + big value, influenced by `Stat`'s shape), not a bigger pill. Selected state on the large variant uses `surface.selected` background + `brand.primary` border/text; disabled large tabs use `state.disabled-text` on both label and value. Info icon uses the new `iconSize.16` token via the existing `Icon` primitive (`InfoCircle.svg`) — currently decorative, no tooltip wired (deferred, see below)
- table fixed-width truncation — `Table.tsx`/`Table.module.css`: numeric-width (`data-width="fixed"`) columns now get `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` plus an inline `maxWidth` matching the column's px value, so long cell content truncates instead of wrapping — audited against Carbon's overflow-content pattern and Ant's Typography `ellipsis` via `/design-system-analysis`. Reveal/accessibility fallback is the native HTML `title` attribute (not a Tooltip component — still blocked on the elevation token)

(all in `design-systems/xops/components/`, matching Storybook story per component in `stories/xops/`)

### Patterns
- License Utilization card — `Card` + `Stat` pair + `DonutChart` + `Legend`, composed directly in `Card.stories.tsx` (`LicenseUtilization` story) and in the real Overview page. Figma 471:7567's warning banner deliberately excluded — deferred into the future notifications system, not built standalone.
- Security Compliance card — same composition shape as License Utilization (`Card` + `Stat` pair + `DonutChart` + `Legend`), 5 segments instead of 3, proving the pattern generalizes. Figma 595:2036. `Card.stories.tsx`'s `SecurityCompliance` story + real Overview page.
- Top Non-Compliant Software card — `Card` + `Table(chrome=false)`, no new pieces (confirmed pattern from earlier session), now also placed into the real Overview page alongside the two chart cards.
- Top Spend By License Model — one-off header (title+`FilterTabs` stacked, `Stat` beside it), not `Card`; `Table` with real Software/Total Spend/Utilization data, rest of columns pending real numbers. Height locked to the 3-card row via `ResizeObserver`.
- Lifecycle Stage — same one-off pattern, `FilterTabs variant="large"` switching 4 fully independent tables (In Evaluation/Rollout/Operational/Renewal), real mock data throughout.

### Screens
Dev-only Overview screen exists at `app/work/software-observability/xops-overview/` (`page.tsx` + a `layout.tsx` that imports `tokens.css` — Next.js requires global CSS imports to live in a layout, not a nested page). Deliberately **not** the live case study route yet — per `PLAN.md`'s phase sequencing, screen assembly happens before the module gets placed into `app/work/software-observability/page.tsx` via `/section-builder`. Shell + 5 dashboard sections wired: License Utilization, Top Non-Compliant Software, Security Compliance, Top Spend By License Model, Lifecycle Stage. Remaining Overview pieces (progress bar, pipeline/funnel stage strip) still unbuilt.

---

## Deferred

- **Code-reveal toggle** — bespoke live-UI ↔ source-code swap, deferred until screens exist
- **Roadmap stub / real-data wiring** — typed prop + mock-data scaffolding on complex pieces (e.g. line chart), for the "what would it take to make this real" conversation with engineering
- **Table CSV → real-fetch data wiring** — user maintains a CSV of real software rows (easy to author/edit outside code); a small script or Next.js API route converts it to JSON; `Table` does a real `fetch` against that route (loading/error states, async data) rather than a synchronous JSON import — demonstrates actual data-wiring depth, not just "props swapped for a different hardcoded source." Explicitly deferred until all three screens are built
- **Column drag-to-reorder** — drag handle in the reserved 24px left cell padding slot; requires drag-and-drop interaction, not yet built
- **Column-visibility toolbar** — gear icon in a toolbar above `Table` showing all current/available columns to show/hide; toolbar itself doesn't exist yet
- **Table selection column** — header "select all" + per-row checkbox; needs a `Checkbox` primitive that doesn't exist yet. Explicitly pushed to the next case study, not this one
- **Table empty state** — no-data placeholder row
- **Table loading state** — skeleton rows
- **Tooltip primitive** — needed for the optional info icon at header-cell level; deferred because it depends on the elevation token dimension, which is itself unresolved (see Foundations Audit below)
- **Pagination sticky/overlap-scroll positioning** — `Pagination` should sit pinned to the bottom of `Table`'s scroll area with rows scrolling behind it (the blurred glass background is specifically for this), not just stacked below in normal flow. Needs the real page layout to exist before this can be wired correctly — revisit during screen assembly
- **Dropdown open-menu visual confirmation** — `Menu`'s panel/option styling was built with no Figma reference for the open state (only the closed trigger was audited); token reuse only, needs a look before being treated as settled
- **Storybook canvas padding** — since `Grid` no longer supplies its own horizontal margin, stories that render `Grid` standalone (no page shell around it) now show edge-to-edge instead of margined. User's proposed fix: give Storybook's own canvas wrapper (`.sb-show-main.sb-main-padded`) padding matching `--xops-grid-margin` (32px), so standalone `Grid` stories look correct without `Grid` needing its own margin back. Not done yet.
- **Warning/notification banner** (License Utilization's Figma reference includes one) — deliberately excluded from both built cards; notifications are a whole system of their own, to be tackled as a dedicated unit later, not bolted onto individual cards ad hoc
- **DonutChart extensions** — center-overlay content (e.g. a big number in the ring's hole) and rounded segment caps (needs a small gap between segments to avoid the rounded tips overlapping at seams) were both discussed and deliberately deferred, not built. Both are straightforward additions later without restructuring the component.

---

## Resume Context

Active mid-build or about-to-build state, keyed by keyword. Remove an entry once complete and folded into `## Built`.

### `xops-component-builder` skill fork
Not yet created — deliberately deferred. User directed a lighter-weight approach for this project (no components exist yet; establishing primitives and system foundations first). Revisit forking the full pre-build-checklist skill once there's a real registry to check against.

### Foundations audit
Typography + color locked and written to `tokens.json`/`tokens.css` (see Built above). Spacing, radius, and elevation still open — resume this when there's enough layout data across screens to establish real scales rather than guessing from one or two data points.

### Per-screen transform classification
Not started for Overview or All Software (Software Profile already confirmed structural-dominant, see `DECISIONS.md`).

### Next up
Standing principle (applies to every screen): **build the final/real design system version first, always.** Legacy/prototype versions are separate, deferred, throwaway one-offs.

License Utilization (Figma 471:7567) and Security Compliance (Figma 595:2036) cards are both fully built and placed into the dev-only Overview screen (`app/work/software-observability/xops-overview/`) alongside Top Non-Compliant Software. The `Card` + `Stat` pair + `DonutChart` + `Legend` composition is now a proven, repeatable pattern for donut-chart-style dashboard cards — any future card matching this shape should reuse it directly rather than rebuilding.

Remaining Overview dashboard-body work: progress bar, pipeline/funnel stage strip — unbuilt. Then move to All Software (final design first) — not legacy.

**Next session starts here:** Top Spend By License Model only has real data for Enterprise Agreements — Open Source, Perpetual, and Consumption-based still need real rows/columns from the user.
