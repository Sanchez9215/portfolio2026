# XOPS Design System — Build State

**Intent:** Status board only — what's built, what's not, what's next.

**Format rule (hard limit):** every entry in this file is `**short title** — one line`. Never a second sentence. If an entry needs more, the "more" belongs in `DECISIONS.md` (why) or `built-components.md` (behavior detail) — or gets cut. This is a scan list, not a narrative.

**When to use:** read at the start of any XOPS session alongside `PLAN.md` (spec/phases) and `DECISIONS.md` (why); update at the end of any session that changes build state. Code + tokens live in `design-systems/xops/`; this doc set is separate (see CLAUDE.md "Project Doc Sets").

## Session Workflow

1. Read this file + `.claude/guidelines.md` + `PLAN.md` + `design-systems/xops/components/built-components.md` + `design-systems/xops/tokens.css`.
2. User provides a Figma node + context.
3. Before building — cross-check every named component layer against `built-components.md`; resolve every token binding against `tokens.json`/`tokens.css` (missing token → flag it, never invent it); parent layer name is authoritative — ask if the mapping is unclear.
4. Branch on intent — new token → edit `tokens.json` + `tokens.css`; new primitive/pattern → build directly (no skill fork, `DECISIONS.md` 012); structural/naming question → `/design-system-analysis`; placing the module into the case study page → `/section-builder`.
5. **Every concrete token value** (ramp step, px, opacity, duration — not just new categories) is proposed with brief reasoning and confirmed before being written; no "obvious defaults" (`DECISIONS.md` 017).
6. Documentation (this file, `built-components.md`, `DECISIONS.md`) is batched once at session end, not after each component.
7. `DECISIONS.md` entries only when the user explicitly flags one — never proactively at session end.
8. Entries written here obey the format rule above — title + one line, no exceptions.

---

## Built (foundations, components, screens)

### Foundations

All in `design-systems/xops/tokens.json` + `tokens.css`.

1. **color** — five 50–950 ramps (grey, brand, success, warning, danger); `text.inverse` is a deliberate pure-white exception (`DECISIONS.md` 010)
2. **typography** — Jost, 7-step scale
3. **spacing** — primitive-only scale
4. **radius** — primitive-only scale
5. **state** — cross-component semantic layer: hover/active/focus/disabled (`DECISIONS.md` 018)
6. **borderWidth, iconSize** — primitives (`20`, `16`)
7. **radius.full** — for fully-circular elements (notification badge, avatar)
8. **Grid** — top-level tier (columns/gutter/margin), single fixed width; margin applied by the consuming page shell, not the `Grid` component (`DECISIONS.md` 027)
9. **radius.2** — smallest radius step, for Legend's color swatch
10. **legendSwatchSize** — dedicated 12px primitive tier (not a `spacing` reuse)
11. **chart-1 – chart-8** — general-purpose data-viz palette, no fixed category meaning (unlike `status.*`)
12. **surface.stat, surface.page** — grey.50 and white semantic surfaces
13. **caution** — sixth ramp (anchor `#FF9500` @ 500) + `status.caution` solid/tint/text, fourth urgency tier for Renewal
14. **elevation.1** — first elevation value (5-layer soft shadow, from Tooltip Figma 666:2200)
15. **border.subtle** — grey.100, promoted after recurring in `LogoTile` and Tooltip
16. **surface.tooltip-section** — grey.50, Tooltip's Calculation/Legend section background
17. **elevation.1-left** — horizontal-offset variant of `elevation.1`, for `SidePanel`'s left-cast shadow
18. **motion.duration.default, motion.easing.default** — 300ms / ease-out, first motion values, from `SidePanel`'s slide
19. **accent** — decorative color tier (teal/light-purple/dark-purple/magenta) + `border.accent` alias, from Summary Card 1's background shapes
20. **motion.duration.slow** — 1500ms, first entrance-animation value
21. **spacing.2** — new smallest spacing step, for `Toggle`'s track padding
22. **barHeight** — `default`(24px)/`18`/`16`, first sizing tier for bar-chart primitives

No general semantic layer over spacing/radius yet (component-scoped exceptions: `Semantic.button.*`, `Semantic.nav.background-active`, `Semantic.header.*`); motion has two durations but no full scale.

### Primitives

All in `design-systems/xops/components/`, matching Storybook story per component in `stories/xops/`.

- **button** — `Button.tsx`
- **icon** — `Icon.tsx`, shared masked-SVG primitive, token-colored
- **count** — `Count.tsx`
- **sidebar** — `Sidebar.tsx`, nav shell
- **global header** — `GlobalHeader.tsx`, top nav-bar
- **page header** — `PageHeader.tsx`, title/count/meta, canonical final version
- **grid** — `Grid.tsx` (`Grid` + `GridItem`), built from the confirmed `Grid` token tier, not Figma-audited
- **table** — `Table.tsx`, data-driven (`columns` + `data`) semantic `<table>`; structure audited, content/columns/styling not final
- **button `text` variant** — clickable-cell-value style — `Button.tsx`
- **control-height scale** — `small`/`medium`/`large`, shared across Button/Dropdown/Input; `Button` has a `size` prop wired to it
- **menu** — `Menu.tsx` (`Menu`/`MenuOption`), extracted for multiple consumers — not Figma-audited, no open-state reference existed
- **dropdown** — `Dropdown.tsx`, trigger + `Menu` panel, `size` off control-height, click-outside/Escape close
- **pagination** — `Pagination.tsx`, pins inside `Table`'s scroll area via its `pagination` prop (height measured live, applied as bottom padding)
- **logo tile** — `LogoTile.tsx`, bounded image container with its own `logoTileSize` tier; grey.100 border; nullable `src` → `code_blocks` empty-state glyph for logo-less publishers
- **tag** — `Tag.tsx`, single size, `status` success/warning/danger/neutral; no icon slot or dismiss variant
- **card** — `Card.tsx`, single variant, title + content slot
- **table `chrome` prop** — `chrome={false}` bare variant for embedding inside `Card`
- **table scroll-fade** — dual-edge gradient overlays signal hidden overflowed columns — `Table.tsx`
- **stat** — `Stat.tsx`, chrome-optional label/value/meta tile, splits its row evenly with siblings; default 24px/14px
- **legend** — `Legend.tsx`, swatch/label/value/meta row stack, generic `color` prop
- **donut chart** — `DonutChart.tsx`, hand-built SVG ring, live-data-ready `segments: {value, color}[]`
- **filter tabs** — `FilterTabs.tsx`, pill radiogroup with `size` scale; `variant="large"` is the stat-card-shaped tab (div-radio + Enter/Space so its info icon can be a real `Tooltip` trigger); full ARIA radiogroup pattern deferred
- **table fixed-width truncation** — `data-width="fixed"` columns ellipsize instead of wrapping, native `title` as the reveal fallback — `Table.tsx`
- **tooltip** — `Tooltip.tsx` (Figma 666:2200), hover-triggered, portaled with viewport-aware flip positioning; wired into every Utilization column
- **table `Column.tooltip`** — optional info icon in headers; sortable headers split into label + sort-icon buttons, `aria-sort` on the `<th>`
- **button `link` variant** — `text` variant recolored to `brand.primary`; both got `padding-inline: spacing-12`
- **status tooltip copy** — Unassigned/Assigned/Active/Inactive/Opportunity copy confirmed and wired everywhere via `Column.tooltip`; "Unused License Waste" renamed to "Opportunity" throughout
- **side panel** — `SidePanel.tsx`, generic slide-out shell, right-anchored at 5-of-12 grid columns via `Grid`, `elevation.1-left`, slides at `motion.duration.default`; close wired, `expand_content` decorative (see Deferred)
- **stat extended** — optional `icon`, `tag` slot, `valueSize` axis (`medium`/`small`), `spaceBetween` — all additive
- **software profile** — `SoftwareProfile.tsx`, fully built end to end matching Figma 471:11491 (see Patterns)
- **Lifecycle Stage tab tooltips** — In Evaluation/Rollout/Operational/Renewal copy confirmed, wired via `FilterTabs`' `tooltip` prop
- **Assigned `Stat` tooltip** — License Utilization's Assigned stat carries the shared Assigned copy via `Stat`'s `tooltip` prop
- **stat `surface` prop** — `filled`/`white`; first use: Summary Card 1 waste tiles
- **bar chart** — `BarChart.tsx`, horizontal segmented bar, `segments` + optional `total` (leftover shows track color)
- **ranked bar chart** — `RankedBarChart.tsx`, horizontal ranked bar list, scroll-capped at 10.5 rows
- **toggle** — `Toggle.tsx`, segmented pill switcher with a measured sliding thumb
- **dropdown `openDirection` prop** — `up`(default)/`down`, for panels opening near a card's top
- **legend extended** — optional per-item `tooltip`; sizing untouched
- **card extended** — optional `headerValue` + `titleSize` (`subheading-16`/`body-14`); doc fix: radius was always `radius.12`, not the `radius.6` this file previously claimed
- **chart tooltip** — `ChartTooltip.tsx`, portaled hover panel (category + rows + optional divided `opportunity` row + secondary-button `action`); used by `DonutChart`/`RankedBarChart`
- **chart hover hook** — `useChartHover.ts`, shared 200ms show/hide-with-cancel-on-re-enter state machine, used by `DonutChart` and `RankedBarChart` instead of each hand-copying it
- **ranked bar chart hover** — `RankedBarChart.tsx` gained per-row `ChartTooltip` wiring + all-around hover outline (6px, 35% tint — same formula as `DonutChart`'s halo)
- **magic surface** — `MagicSurface.tsx`, shared blob-background primitive extracted from Summary Card 1; `scale` prop lays out a fixed reference canvas then shrinks it as a unit, for proportional smaller instances
- **stat `magic` surface** — `Stat.tsx` gained `surface="magic"` (built on `MagicSurface`) + `magicScale`
- **employee breakdown view** — `EmployeeBreakdownView.tsx`, drill-down screen (Back to Profile/Export CSV roadmap stub, Opportunity + metric `Stat` pair, sortable `Table`); inactive and terminated modes, opened from `ChartTooltip`'s action button
- **side panel resize** — `SidePanel.tsx` gained drag-to-widen via Pointer Events (min = default 580px, max 900px), replacing the old fixed Grid-colSpan width
- **global header border fix** — dropped redundant `border-left` that doubled against `Sidebar`'s own `border-right`

### Patterns

- **License Utilization card** — `Card` + `Stat` pair + `DonutChart` + `Legend` (Figma 471:7567, warning banner deferred); story + real Overview page
- **Security Compliance card** — same composition, 5 segments (Figma 595:2036); story + real Overview page
- **Top Non-Compliant Software card** — `Card` + `Table(chrome=false)`, placed on the Overview page
- **Top Spend By License Model** — one-off header (title + `FilterTabs` + `Stat`) over `Table`; real data for Enterprise Agreements only, height locked to the 3-card row
- **Top Spend non-Enterprise tabs** — Open Source (Component/Version/Users, no logo) and Perpetual (Software + Acquisition Cost/Annual Maintenance/Purchased/Unassigned/Assigned/Inactive/Active/Utilization, shared tooltips carried over) column sets + tab-switch wiring; both render empty pending the source-tagged dataset
- **Lifecycle Stage** — `FilterTabs variant="large"` switching 4 independent tables (In Evaluation/Rollout/Operational/Renewal), real mock data
- **All Software table** — standalone `chrome={true}` `Table` with row-select + real `Pagination`; Renewal cell combines date + urgency `Tag`, durations formatted via `formatRenewalDuration()`
- **Software Profile Summary Cards** — Card 1 (Opportunity + rotating-blob background), Card 2 (Licenses Purchased trio via `Stat`), Card 3 (Utilization Status via `BarChart`+`Legend`) — `SoftwareProfile.tsx`
- **Software Profile Detail Container** — View By `Dropdown` + Metric `Toggle` driving two `Card`+`RankedBarChart` blocks, header totals computed live from row data

### Screens

- **Overview (dev-only)** — `app/work/software-observability/xops-overview/`; all data tables (Top Spend enterprise/perpetual/OSS tabs, License Utilization card, 4 lifecycle-stage tables) now read live from `getDataset()` + `metrics.ts`; security/compliance cards stay decorative; progress bar + pipeline strip still unbuilt; not the live route yet
- **All Software (dev-only)** — `app/work/software-observability/xops-all-software/`; the `Table` renders all 88 `productSummaries` (consumption products show "—" in seat columns via `seatBased`); `Pagination` over the full set; profile panel + inactive/terminated drill-downs computed live per-product from the seam
- **Software Profile side panel** — opens on All Software row click, fully built (Figma 471:11491); now genuinely real for **every** product (counts + department/employee drill-downs are joins over the generated rows, not hand-authored samples)

---

## Deferred

- **Code-reveal toggle** — live-UI ↔ source-code swap, deferred until screens exist
- **Roadmap stub / real-data wiring** — typed prop + mock-data scaffolding on complex pieces for the "make this real" conversation
- **Source-tagged data model** — one synthetic dataset of raw values, each field source-tagged (`procurement`/`identity`/`publisher`/`hr`/`config`), populating all three built views; metrics computed from tagged fields; foundation for the modularity demo (`PLAN.md` 11, absorbs the old CSV→real-fetch item)
- **Modularity demonstration ("Designing for Data Uncertainty")** — case-study-page `<Section>` toggle that adds/removes data sources and reshapes the design via the source-tag dependency graph; depends on the source-tagged data model (`PLAN.md` 12)
- **Column drag-to-reorder** — drag handle in the reserved 24px left padding slot
- **Column-visibility toolbar** — gear icon above `Table` to show/hide columns; toolbar doesn't exist yet
- **Table selection column** — header select-all + row checkboxes; needs a `Checkbox` primitive, pushed to the next case study
- **Table empty state** — no-data placeholder row
- **Table loading state** — skeleton rows
- **Tooltip's "Learn More" link** — footer button exists, not wired
- **Employee Breakdown View Export CSV** — button/icon wired, no real CSV export yet
- **Employee Breakdown View employee links** — names render as `Button variant="link"`, `onClick` placeholder only, real employee navigation not wired
- **Unused Licenses / Over-Assigned tooltips** — copy drafted in conversation only; on hold per user
- **Dropdown open-menu visual confirmation** — `Menu` panel/option styling built with no open-state Figma reference; opens-above placement confirmed, visuals still unaudited
- **Storybook canvas padding** — give `.sb-show-main.sb-main-padded` padding matching `--xops-grid-margin` (32px) so standalone `Grid` stories show margins
- **Warning/notification banner** — excluded from both chart cards; notifications are a dedicated future system
- **DonutChart extensions** — center-overlay content + rounded segment caps, both straightforward later additions
- **Table row-selection transition** — `rowSelected` background/border should ease in, not snap
- **`expand_content` icon behavior** — decorative in `SidePanel`; roadmapped to expand the panel to full main-section width
- **Full ARIA radiogroup for `FilterTabs`** — roving tabindex + arrow keys per WAI-ARIA APG; large variant only got a minimal div + Enter/Space fix

---

## Resume Context

Active mid-build or about-to-build state, keyed by keyword. Remove an entry once complete and folded into `## Built`.

### `xops-component-builder` skill fork
Not created — deliberately deferred; revisit once there's a real registry worth a pre-build checklist.

### Foundations audit
Typography + color locked; spacing/radius/elevation full scales still open — resume when enough cross-screen layout data exists.

### Per-screen transform classification
Not started for Overview or All Software (Software Profile confirmed structural-dominant, see `DECISIONS.md`).

### Source-tagged data model (built + verified)
`design-systems/xops/data/` complete — `types.ts` / `catalog.ts` (105 products) / `generate.ts` (seeded, 3K employees) / `metrics.ts` (join-and-count seam via `getDataset()`). Three paths by license model: seat-based (enterprise/perpetual) → contracts+assignments+activity; consumption → spend-only (`seatBased:false`, no seats); open-source → separate Component/Version/Users list. Smoke-verified: 88 contracts + 15 evals + 2 OSS, ~48K assignments, totals reconcile, drill-downs real, 85% logo coverage. **Views rewired + verified** — Overview and All Software (incl. Software Profile + drill-downs) both read the seam; enterprise tab shows real seat counts, consumption shows "—"; efficiency rate = active÷purchased; `ProductSummary` extended with `acquisitionCost`/`annualMaintenance` for the Perpetual tab; the three metrics summary types are `type` (not `interface`) so they satisfy `Table`'s `Record` constraint. Next chunk: config-as-YAML view + "plugs into" visual (`PLAN.md` 11a) + `PLAN.md` 12 modularity toggle.

### Catalog logo work (roadmap)
16 new publishers wired to empty-state (`PUBLISHER_LOGOS` nulls in `catalog.ts`): Snowflake, Databricks, Datadog, MongoDB, Notion, Asana, Box, Miro, HubSpot, Palo Alto Networks, Fortinet, Coupa, Anaplan, Smartsheet, GitLab, Elastic. Empty-state is now live (`code_blocks` glyph via `LogoTile`). Source a subset for ~85% coverage — some stay empty-state on purpose (100% reads too clean); confirm source before fetching; wire added logos into the map as files land.

### Next up
Standing principle: **build the final/real design-system version first, always** — legacy/prototype versions are deferred throwaway one-offs.

**Next session starts here:** The source-tagged data model + the three-view rewire are done and verified — every table/card/drill-down across Overview, All Software, and Software Profile computes live from `getDataset()` + `metrics.ts`. Remaining, in order: (1) **config-as-YAML view + "plugs into real systems" visual** (`PLAN.md` 11a) — needs Figma nodes or a propose-first design pass (user parked it into the plan, not building yet); (2) **modularity toggle** (`PLAN.md` 12, "Designing for Data Uncertainty") — same, needs design direction; (3) **source a subset of the 16 logos** (`## Catalog logo work`) — confirm source first. Security/compliance cards stay decorative pending removal.
