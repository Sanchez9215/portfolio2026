# XOPS Decision Log

The "behind the scenes" record for the XOPS design system + interactive flow effort — not a status tracker (`progress.md`) or a roadmap (`PLAN.md`), but the *why*, including dead ends and reversals. Intent: source material for eventually telling the story of how this was built.

## Format

A spine of sequential numbered decisions. Each has:
- **Spokes** — the factors, constraints, or prior mistakes that fed into it (the radiating lines in the sketch)
- **Decision** — what was actually chosen
- **Sub-decisions** — lettered branches (002a, 002b...) when one decision spawned smaller decisions underneath it, rather than continuing the main spine

## Logging workflow

Entries are drafted continuously while working — not only when explicitly requested. Drafts are presented for review before a session/build closes; nothing is finalized until confirmed. Reason: capturing the moment of decision (including the mistake or the discarded option) beats reconstructing it afterward.

---

## Decision 001: Interactive front-end instead of static images

**Spokes:**
- Existing case study shows prototypes/finals as static images
- Primary audience is recruiters/hiring managers evaluating senior IC/lead product design roles — need proof of front-end execution ability, not just visual design
- Figma files exist for both prototype and final versions of the XOPS work

**Decision:** Rebuild the key screens as real interactive components instead of screenshotting them.

**Leads to:** 002

---

## Decision 002: Separate, namespaced design system — not an extension of the portfolio's

**Spokes:**
- Portfolio already has its own token/component system (`design-system/tokens.json`, `styles/globals.css`, `components/`) built for Edgar's personal brand
- XOPS screens need to look like XOPS's product, not the portfolio's brand
- Intent to reuse this system for future XOPS-sourced case studies, not just this one — needs to outlive a single case study page

**Decision:** New system at `design-systems/xops/`, fully separate token file, `xops-` prefix on all CSS custom properties and component names, so the two systems never resolve against each other.

**Leads to:** 003

---

## Decision 003: File placement — root-level `design-systems/xops/`, not nested in the case study route

**Spokes:**
- If scoped inside `app/work/[case-study]/`, it dies with that page and can't be reused for a second XOPS case study later
- Portfolio's own `design-system/` already lives at root as a sibling — consistent pattern

**Decision:** `design-systems/xops/` at repo root; case study route imports from it, doesn't own it.

**Leads to:** 004

---

## Decision 004: Legacy → Modern transform mechanic

**Spokes:**
- Core "trick" requested: press a button, watch old UI organically become the redesigned UI
- GSAP already in stack (entrance/scroll animations elsewhere in the portfolio)
- Not all XOPS UI updates were the same kind of change — user confirmed the 3 target screens are a mix of visual-only and structural changes, varies per screen

**Decision:** Represent each screen's old/new state as one component with a `variant="legacy"|"modern"` prop, not two separate components swapped out. Animation technique branches per element: CSS-custom-property tween for visual-only changes (color/spacing/radius/type, same structure), FLIP transition for structural changes (moved/resized/relayout).

### Sub-decision 004a: Single component + variant prop, not swapped components

**Spokes:** A true "morph" only reads as organic if it's the same DOM interpolating, not one element replaced by another
**Decision:** `variant` prop pattern locked in as the baseline for every screen/component in this system.

### Sub-decision 004b: Per-screen classification deferred to Foundations Audit

**Spokes:** Don't yet know, screen by screen, which parts are visual-only vs. structural — needs the actual Figma files
**Decision:** Classification happens during Phase 1 (Foundations Audit), not guessed now.

**Leads to:** 005

---

## Decision 005: Code-reveal toggle — concept confirmed, build deferred

**Spokes:**
- User wants the "insides" (actual code) visible, not just the rendered UI — reinforces the front-end-execution story from 001
- Storybook 8 is already in the stack and solves live-render + source-panel out of the box via its Docs addon
- But the toggle needs to live inside the case-study narrative itself, not link out to a separate app — bespoke fits the presentation better than embedding Storybook
- User explicitly chose to skip Storybook for this and go step by step rather than solve it now

**Decision:** Bespoke code-reveal toggle, deferred to Phase 6 (after screens exist). Kept conceptually distinct from the transform toggle — one flips UI state, the other flips UI vs. source — so they don't collapse into the same control.

**Leads to:** 006

---

## Decision 006: Skill reuse vs. fork

**Spokes:**
- `component-builder` skill is hardcoded to portfolio-specific paths (`design-system/tokens.json`, `styles/globals.css`, `components/components.md`, `components/built-components.md`)
- `section-builder` skill operates on the case-study page's 12-col grid and doesn't reference token source at all — placement logic, not token logic
- Neither skill covers assembling a full product UI screen from primitives (buttons/dropdowns/tooltips → screen) — that's a new kind of build this system introduces

**Decision:** Fork `component-builder` → `xops-component-builder` (same rules, repointed paths). Reuse `section-builder` as-is for placing the whole module into the case-study narrative. Screen-assembly has no existing skill yet — will be defined once primitives exist (Phase 2/3 boundary).

**Leads to:** 007

---

## Decision 007: Decision log scoped to XOPS only, node-based structure

**Spokes:**
- User wants to eventually narrate "how I work," including mistakes — a flat status log doesn't capture that, needs to preserve *why*
- Considered a portfolio-wide journal in addition to an XOPS-scoped one — user chose to scratch the portfolio-wide version and focus on XOPS only, for now
- User sketched the intended structure by hand: a spine of decisions, each with radiating "spoke" factors, and occasional side-clusters of sub-decisions branching off one node — closer to a decision graph than a flat ADR list or chronological devlog

**Decision:** This file (`DECISIONS.md`), numbered spine + spokes + lettered sub-decisions, XOPS-scoped only.
