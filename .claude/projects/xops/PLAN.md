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

## Status

See `.claude/projects/xops/progress.md` for current build state.
