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
6. **Code-reveal toggle** — deferred; bespoke build once screens exist, not Storybook
7. **Roadmap stub** — light typed prop/mock-data scaffolding on complex pieces (e.g. the line chart) so there's a concrete jumping-off point for an engineering "what would it take to make this real" conversation — no real wiring built now
8. **Number formatting convention** — every dashboard number so far (`Stat`, `Legend`, table cells) is a hardcoded pre-formatted string, not computed. Needs a real decision: decimal precision, thousands-separator grouping, and large-number abbreviation thresholds (e.g. `3,400,000` vs `3.4M`), likely implemented via `Intl.NumberFormat`'s compact-notation mode (the browser-native implementation of Unicode CLDR's compact decimal format). Research references identified: IBM Carbon's data-viz guidelines, Shopify Polaris's Numbers content guidelines, `d3-format`. Not yet researched or decided — revisit once enough real numbers exist across screens to see the actual range of magnitudes in play.
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

    - **11a. Config-as-YAML view + "plugs into real systems" visual** — two presentation surfaces that expose the source model itself, not just its computed output: (a) a "show the file" panel rendering the `config` source table (org taxonomy) as YAML, evoking a real config-as-code export; (b) an architecture visual showing the five upstream systems (SAP Ariba, Okta/Entra, Workday, publisher consoles, config-as-code) feeding the dashboards through the data seam — the "plugs into real systems" story. Both live in the case-study page. Depends on #11 (done). Net-new UI: needs a Figma node or a propose-first design pass before building (user parked it into the plan, not building yet).
12. **Modularity demonstration ("Designing for Data Uncertainty")** — a section placed into the software-observability case-study page (via `/section-builder`) with a toggle that adds/removes data sources; every metric/column/card whose source-tags aren't all satisfied recomputes or gracefully disappears, reshaping the design *in place* to prove the modular-by-construction principle the case-study copy claims. Depends entirely on #11 (a hardcoded string can't reshape itself — the reshaping has to fall out of the source-tag dependency graph, or the demo fakes the very principle it argues). Downstream; not built until the source-tagged model exists.

## Status

See `.claude/projects/xops/progress.md` for current build state.
