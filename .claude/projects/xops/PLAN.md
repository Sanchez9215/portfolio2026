# XOPS Design System + Interactive Flow — Plan

**Intent:** Destination and spec — the end-state architecture, phase sequencing, and what "done" looks like for this system.

**When to use:** Read to know what phase this project is in and what to build next; consult alongside `progress.md` (current build state) and `DECISIONS.md` (why the direction is what it is).

## Goal

Replace static before/after screenshots in the Software Observability case study with a real, interactive 3-screen flow built from a small XOPS-specific design system. Two showcase mechanics on top:

1. **Legacy → Modern transform** — a button that animates the UI from its old form into its redesigned form, in place, organically. Per-element technique depends on what actually changed (see `## Transform mechanic` below).
2. **Code reveal** (later phase) — a toggle that swaps the live rendered UI for its own source, so the case study can show "insides," not just visuals. Bespoke to this project, not Storybook — deferred until the design system + screens exist.

This is scoped to be reusable for future XOPS-sourced case studies, not just this one.

---

## Why a separate system (not the portfolio's)

See `DECISIONS.md` 002 for the reasoning. Short version: everything here is namespaced (`xops-` prefix on CSS vars and component names) and lives in its own folder so the two systems never resolve against each other by accident.

## File placement

```
.claude/
  projects/
    xops/
      PLAN.md             # this file
      progress.md          # session workflow + build state, scoped to this system
      DECISIONS.md          # decision log — the why behind the why, including mistakes

design-systems/
  xops/
    tokens.json           # foundations audited from Figma: color, type scale, spacing, radius, elevation
    tokens.css             # --xops-* custom properties generated from tokens.json
    components/
      components.md         # layer structure + behavior spec per component (mirrors components/components.md pattern)
      built-components.md    # registry of built xops components (mirrors components/built-components.md pattern)
      XopsButton.tsx, XopsDropdown.tsx, XopsTooltip.tsx, XopsCard.tsx, etc.

app/
  work/
    software-observability/         # the live case study page (actual route, resolved from earlier TBD placeholder)
      xops-overview/                # dev-only staging route for screen assembly — NOT yet linked into the live
                                     #   case study; the whole module moves into software-observability/page.tsx
                                     #   via /section-builder only once all 3 screens + transform mechanic exist
```

Code/tokens and the doc set live in separate roots — same split every non-portfolio project follows now (see CLAUDE.md's "Project Doc Sets").

The whole interactive module still gets placed into the case study narrative as one `<Section>` via the existing `/section-builder` skill — that part of the pipeline is unchanged.

## Transform mechanic

Each screen's old/new state is expressed as **one component with a `variant="legacy" | "modern"` prop**, not two separate components — the transform button just flips the prop and the animation layer interpolates.

- **Visual-only changes** (color, spacing, radius, type — same structure) → tween the underlying `--xops-*` CSS custom properties directly with GSAP.
- **Structural changes** (moved/resized/relayout) → FLIP transition (capture old position/size, animate to new).
- **Net-new elements** introduced in the redesign → fade/scale in once the structural move settles.

Per-screen classification (visual-only vs. structural vs. mixed) happens during the Foundations Audit phase, screen by screen, once Figma files are reviewed.

## Skill reuse

| Skill | Status | Notes |
|---|---|---|
| `component-builder` | **Fork** → `xops-component-builder` | Same rules (token resolution chain, layer→DOM mapping, never-hardcode, pre-build checklist gate) — repointed at `design-systems/xops/tokens.json`, `tokens.css`, `components.md`, `built-components.md` instead of the portfolio's |
| `section-builder` | **Reuse as-is** | Still used to place the whole interactive module into the case-study page's 12-col grid |
| Screen assembly (buttons/dropdowns/tooltips → full screens) | **New** | Neither existing skill covers assembling a product UI screen; will define this once primitives exist |

## Phases

1. **Foundations audit** — pull type scale, spacing units, color, radius from both Figma files (legacy + modern) into `tokens.json`/`tokens.css`; classify each of the 3 screens as visual-only / structural / mixed
2. **Primitives** — buttons, inputs, tooltips, dropdowns; each built with `variant="legacy"|"modern"`. Shared control-size scale (`size: small | medium | large`, one scale reused across Button/Dropdown/Input) — Ant Design's shape selected (see `DECISIONS.md`). Actual px values not yet confirmed.
3. **Patterns** — composed pieces specific to the flow (chart chrome, table rows, nav)
4. **The 3 screens** — assembled from patterns; transform mechanic wired in
5. **Documentation surface** — visible "insides" showcase page for the design system itself
6. **Code-reveal toggle** — **superseded**, absorbed into `software-observability`'s "Layer Inspect" mechanic (see that project's `PLAN.md`) rather than built as a standalone toggle here
7. **Roadmap stub** — light typed prop/mock-data scaffolding on complex pieces (e.g. the line chart) so there's a concrete jumping-off point for an engineering "what would it take to make this real" conversation — no real wiring built now
8. **Number formatting convention** — **decided** (`DECISIONS.md` 034), not yet built. One shared `Intl.NumberFormat`-backed utility (`en-US` fixed), field-type presets (counts/currency/percent all 0 decimals, grouping on, IDs never grouped), and a `compact` flag set by surface — tables pass full digits, tiles/`Legend`/chart axes pass compact and abbreviate ≥10,000 (e.g. `$3.4M`, `48K`). Empty state: `—` for not-applicable, explicit words for a meaningful null (e.g. "Never signed in"). Build task: the utility itself, then wire it through every current call site — `Stat`, `Legend`, `Table` cells, `SoftwareProfile`'s efficiency stat (currently `.toFixed(1)`, must move to 0 decimals to match `utilization`), `BarChart`/`RankedBarChart`/`DonutChart` labels — plus right-align numeric `Table` columns (folded in as the same pass, was its own open anatomy gap). Pairs with #11 (formatting now happens at render, not in the data).
9. **Real table sort/reordering** — `Table`'s sortable columns currently only toggle visual sort state (icon direction, `aria-sort`) via a controlled `sortKey`/`sortDirection`/`onSortChange`; no consumer actually reorders its `data` array in response yet (true of every sortable table built so far, including Top Spend By License Model). Needs real comparator logic per column once a table's sort behavior is actually exercised end-to-end.
10. **[Low priority] Tabbed-table prop repetition** — the Overview page's lifecycle-stage table (`app/work/software-observability/xops-overview/page.tsx`) renders four `<Table>` calls, one per tab, each repeating the same `chrome={false}`, `rowKey`, `sortKey`, `sortDirection`, `onSortChange` props. Could factor into a tiny local wrapper to cut repetition. Not a correctness issue — cosmetic DRY cleanup only, do if convenient.
11. **Source-tagged data model (five source tables)** — the foundation for both realistic data and the modularity story (#12). Today every dashboard number is a hardcoded pre-formatted display string with no provenance. Replace them, across all three built views (Overview, All Software, Software Profile), with **five synthetic source tables modeled at their real-world grain**, joined by keys:
    - `config` — org taxonomy (departments / cost-centers / regions); the grouping axis itself
    - `procurement` — contracts/POs, one row per product (reseller, license model, seats purchased, cost, renewal terms)
    - `hr` — roster, one row per employee (department, employment status, termination date)
    - `publisher` — license assignments, one row per employee×software (assigned seat, edition/version)
    - `identity` — activity, one row per employee×software (last-activity date)

    **Every displayed metric is a join-and-count across these tables**, not a stored string — e.g. `assigned` = count of publisher rows; `active` = identity rows active within 90 days; `unassigned` = purchased − assigned; `utilization` = active ÷ assigned; waste/opportunity = counts × unit cost. Because counts are emergent from rows, the employee drill-downs become genuinely real for **every** product (not a single hand-authored sample), and the modularity toggle falls out of the join graph rather than being staged (see `DECISIONS.md` 033).

    **Generation:** a **seeded, deterministic in-repo generator** anchored on **~3,000 employees** (≈18–24K assignment rows) — org size is the tunable knob; the generator is committed as small code, not a giant data literal (see `DECISIONS.md` 033b). Fable 5 is the likely generator author once column shapes are set.

    **Column realism:** shaped by a **scoped field audit** of each real system's export/API (SAP Ariba analytical reporting, Okta / Entra activity, Workday HCM, publisher admin consoles, config-as-code) so the tables read authentically — the fields the views actually need plus a few authentic extras.

    **Delivery (client-first, backend deferred):** the live UI reads the generated tables **in-memory, behind a clean data-access seam**, so promoting them to a real Next.js Route Handler API — or a hosted DB — later is a small *additive* change, deliberately deferred until the screens exist rather than built up front (see `DECISIONS.md` 033a). The full-stack / integration story is carried meanwhile by the realistic source tables, a "plugs into real systems" architecture visual, and the code-reveal (#6) showing the join logic.

    Must be structured so the future Insights dashboard consumes the same tables. Security/compliance data (Overview's compliance card + non-compliant table) is excluded and stays decorative, pending its removal from the case study. Supersedes the old "Table CSV → real-fetch data wiring" item and pairs with #8 (number formatting), since formatting now happens at render, not in the data.

    **Status:** built + verified. The seam (`design-systems/xops/data/`: `types.ts`/`catalog.ts`/`generate.ts`/`metrics.ts`, `getDataset()`) is complete, and all three built views (Overview, All Software, Software Profile + drill-downs) are **rewired to read through it** — every displayed number is a live join-and-count. Consumption products (`seatBased:false`) render "—" in seat columns; the empty-state `LogoTile` glyph covers logo-less publishers. Remaining downstream work is 11a + 12 below.

    - **11a. Config-as-YAML view + "plugs into real systems" visual — superseded.** Absorbed into `software-observability`'s "Layer Inspect" mechanic instead of built as two standalone presentation surfaces here (config-as-YAML → its Data layer; the architecture visual → its Systems layer). See that project's `PLAN.md` for the live plan.
12. **Modularity demonstration ("Designing for Data Uncertainty")** — a section placed into the software-observability case-study page (via `/section-builder`) with a toggle that adds/removes data sources; every metric/column/card whose source-tags aren't all satisfied recomputes or gracefully disappears, reshaping the design *in place* to prove the modular-by-construction principle the case-study copy claims. Depends entirely on #11 (a hardcoded string can't reshape itself — the reshaping has to fall out of the source-tag dependency graph, or the demo fakes the very principle it argues). Downstream; not built until the source-tagged model exists.
13. **`Table` column-width best practices** — reconsider how `Column.width` (`fixed`/`auto`/`flex`) should behave by default. Surfaced while building Data Health Monitor's "Health by Domain" table: getting columns to hug left with the trailing `showChevron` cell pinned far right required manually designating one column as `"flex"` as a spacer, which works but isn't an obvious/documented convention. Worth a real pass once more tables exercise this shape.
14. **Collapse `GlobalHeader`'s bespoke icon button into `Button`'s `iconOnly` variant** — `GlobalHeader.module.css`'s `.iconButton` duplicates `Button iconOnly`'s exact hover/active/radius token recipe (`state-hover-on-surface`/`state-active-on-surface`/`radius-6`) independently, just hardcoded at 36px with no border, instead of reusing the component. `Button iconOnly` today is secondary-only (always bordered) — needs a borderless mode before `GlobalHeader` can consume it directly. `Table`'s row chevron (built for Data Health Monitor) already does a partial version of this via a `className` override rather than a real `Button` prop; a real pass should reconcile both consumers into one option on `Button` itself.
15. **Establish design-system-only documentation** — a place to log structural/token findings (color drift between a source file and audited tokens, missing size tiers, component-recipe duplication like #14) that isn't tied to any one page or case study. Today these surface mid-session on whatever project happens to trigger them (e.g. Data Health Monitor) and get logged into that project's own doc set or `xops`'s `PLAN.md` by default, even when the finding is really about the shared `xops` system itself. Needs its own home.
16. **Add Configuration Item (asset record) data to the shared data model** — Data Health Monitor's real-world basis is a ServiceNow-style CMDB: Configuration Items (one per asset/record, per domain — Employee/Infrastructure/Worksite/Software), each with domain-specific Asset Profile Fields (attributes), validated for Completeness (required fields populated), Quality (populated fields that pass validation), and Recency (synced within 24h). A single CI can carry multiple simultaneous validation failures across categories — the model must support that, not assume one failure per record. This is **in addition to** the existing `hr`/`publisher`/`procurement`/`discovery` tables, not a replacement — part of the same overall ecosystem (Employee CIs relate to `hr` rows, Software CIs relate to `catalog`/`procurement`, etc.), but not yet scoped into `design-systems/xops/data/`. Downstream; not started.

17. **All Requests — parent request status rollup** — a request (REQ) is a parent of items (ITM); parent status is derived from its items, not stored. Item statuses: open, in-progress, warning, exception, complete. Parent statuses: Open, In-Progress, Suspended, Closed-Complete, Closed-Incomplete, Closed-Canceled. Rules (provisional, pressure-test later): all items open → Open; any item started → In-Progress; **exception** with no item still active (open/in-progress) → Suspended; the system can also set Suspended directly (SLA nearing breach, employee confirmation outstanding); all items complete → Closed-Complete (a parent cannot close complete while any item holds an unresolved exception or warning); Closed-Incomplete / Closed-Canceled are explicit terminal outcomes passed in, not derived. Warnings do not move the parent to Suspended. Exception/warning badge on the progress bar (for the collapsed list) is the next piece. ServiceNow's official RITM→request mapping only covers open/WIP/pending → In Progress and the three closed states → Closed; how a child problem affects an open parent is not documented there — this rule is our own design.

18. **All Requests — portfolio showpiece (goal + build order)** — a front-end rebuild of a screen Edgar designed at a former employer; it will never ship, so it's shown as a playable concept with the reasoning behind it (no NDA constraint, nothing added to the original design). Thesis: ServiceNow doesn't show cross-system orchestration — making automated fulfillment legible (what triggered what) was the value prop. Takeaway for hiring managers: Edgar designs orchestration visualizations and designs for AI/agents. Goal is *playable*, including a manager stepping in to unsuspend a request; no invented impact metrics. Build order: (1) events dataset — 4 runbooks (Device Deployment, Badge Access, Software Deployment, Mobile Line Assignment; remote roles skip Badge Access; offboarding ordered by risk, not strictly reversed), events with optional cross-lane `triggeredBy`, an exception scenario; (2) orchestration graph (main employee-event lane + one swim lane per item, data-driven SVG); (3) event log; (4) detail header + General Details (status-count chips moved to Revisit — the graph icons and the header status tag already carry per-item and parent status, so chips only earn a place if they filter or jump to a lane); (5) pagination bar + Filters; (6) playable scenario. Triggers are only for cross-lane/cross-system causality — in-lane order is implicit and origin events have none. Open modeling questions: gates/waits vs triggers, approvals, SLA clock, event outcomes (succeeded/failed/retried/resolved), exception ownership, scheduled vs actual events.

19. **All Requests — events data model (built)** — `design-systems/xops/data/requests/` (`types.ts`, `runbooks.ts` templates, `generate.ts` seeded, `metrics.ts` seam). 200 requests (REQ-232 scripted: VIP onboarding, device-lane Inventory Unavailable exception) from 3 templates — US VIP Onboarding (pace ×0.3, 48h SLA), Remote Knowledge Worker (no badge), US Employee Offboarding (ordered by risk: access → license reclaim → device recovery → mobile). Events carry `source` (itsm/hr/identity/screening/badge/device-management/software-distribution/telecom/logistics/procurement), `actor` (system/employee/manager/agent), `type`, `outcome` (complete/in-progress/planned/warning/exception) and optional cross-lane `triggeredBy`; a step also waits on its trigger. Item status derives from lane outcomes, parent status from items (item 17). Resolved exceptions/warnings stay as complete events (`type` keeps the history). Not yet modeled: approvals as gates, SLA clock pause, exception ownership/assignee, the AI agent proposing a resolution (playable scenario, later).

## All Requests orchestration graph — case-study material

**Intent:** the story and the decisions behind the All Requests graph, written to be lifted into the case study. Items marked *(pending review)* are built but not yet confirmed in the browser.

**Thesis:** ServiceNow shows a request as a flat list of events. The graph makes cross-system orchestration legible: which lane started because of which event, where lanes merge back, and where one is stuck. Hiring-manager takeaway: Edgar designs orchestration visualizations and designs for agents.

### How it got here (screenshots in `iterations/all-requests-graph/`)

1. **Original screen** (`01`) — a small legend-style graph beside a flat event list.
2. **Redesigned target** (`02`) — graph promoted to the hero, a request list with derived status, exception tint in the log.
3. **First build, all open** (`03`) — every lane grey, status chips above the graph.
4. **In-progress and complete** (`04`) — branches leave the trunk, lanes fill; chips counted statuses.
5. **Branch crossing** (`05`) — a branch ran straight through an unstarted lane's label.
6. **Merge to trunk** (`06`) — a finished lane rises back to the trunk and fills it.
7. **Exception head** (`07`) — a lane runs to a red head on the problem event.
8. **Lane-colored badges and merges** (`08`) — color moved onto the lane's check badge and merge dot.
9. **Chips removed** (`09`) — the icons and header tag already carried status, so the chips went (PLAN 18 Revisit).
10. **Annotated overlap** (`10`) — the red line marks branches crossing a lane's first dots; led to the shared-slope rule.
11. **Offboarding stress** (`11`) — a head label ran into the ITM code; the 14-lane pressure test (`?stress=1`) found the same.
12. **Final** (`12`) — eight items, hover tooltip, highlighter, guide line.

### Decisions (confirmed with the user unless marked)

**Data**
- Real prototype data had at most 4 items per request, so it could not stress the graph. Added an Executive Onboarding template (8 items: the existing four + Email Provisioning, VPN Access, Payroll Setup, Training Assignment) and three pinned requests that draw nothing from the rng: REQ-901 complete, REQ-902 mid-flight, REQ-903 exception + warning.
- The four new item types take existing chart tokens (chart-4/5/8, training shares chart-3).

**Graph logic**
- Every branch and merge runs at one shared slope with two elbows; branches from one dot are staggered deepest-first; merges onto the trunk are staggered one margin apart.
- A head label shrinks with an ellipsis instead of overrunning the ITM code.
- The trunk is "done" only when its own events and every item lane are complete; otherwise it stops at its last point and the grey remainder continues. This covers Closed-Incomplete and Canceled.
- Only a lane's first cross-lane trigger is drawn — drawing later mid-lane dependencies was declined as extra noise.

**Layout**
- Lanes are 32px (`control-height-medium`), compact, centered inside a 320px minimum height; the graph has 16px padding and a bottom divider, no card border or title. The request name moved back under the REQ id.
- The trunk reads **Start → End**: Start in a left gutter (brand once started, disabled before), End left-aligned with the ITM codes (disabled until done). A finished trunk's last point sits on the center of the check badges.
- The trunk uses `brand-primary`, the same blue as the request progress bar, so the line, the labels and the bar agree.
- Kept the in-progress half circle in status blue rather than lane color: it carries a status meaning shared with the list, and light lane colors have weak contrast at that stroke width.

**Hover interaction** *(pending review)*
- The lane is the row under the pointer; the point is the nearest dot or head by x, with no distance cutoff, so a tooltip always shows. Hovering focuses that lane and dims the rest, as before.
- Point highlighter: 12px disc, 1px ring and 8px dot in the lane color, 4px halo at 35% (the donut chart's recipe). A full-height guide line uses `border-divider`.
- Motion: highlighter scales in over 150ms, then glides between points; guide and tooltip glide and fade over 250ms; the tooltip never flies in from off-screen.
- The tooltip is an `event` variant of `ChartTooltip` (union-typed so the two variants cannot mix), built from existing tokens, not the older Figma hexes; opens below-right, flips at edges, ignores the pointer. The old per-dot mini tooltip was removed.
- Merge dots take their lane's color and hover as "Completed" at the lane's final event time, focusing that lane. This separates arrivals from true trunk events.

**Event log**
- Shows only what has happened plus each lane's next planned event, in disabled text; 16px gap under the controls; 16px container padding (also on the detail header).

### Process lessons worth telling
- The 14-lane stress view surfaced the head-label overrun and the lack of a lane for new item types before they reached the prototype.
- Several instructions reversed an earlier one (trunk end 16px before the badges, then flush, then centered on them); each was a deliberate trade between label spacing and alignment.
- Tokens and values were proposed and confirmed before being written; where Figma and the audited tokens disagreed, the tokens won.

### Open
- Hover-intent delay and point stickiness if lane dimming feels twitchy.
- Tooltip timestamp format ("4:06 PM" in data vs "4:06PM" in Figma).
- The remaining detail pane sections and the playable scenario (PLAN 18).

## Status

See `.claude/projects/xops/progress.md` for current build state.
