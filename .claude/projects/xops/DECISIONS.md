# XOPS Decision Log

**Scope:** DECISIONS.md is pure strategic narrative — Edgar's own systems-thinking story: trade-offs weighed, direction chosen, judgment calls, ideas that shaped the approach. It is never UI detail, never token/px/color values, never code-level reasoning, and never a change-log of implementation steps. Its dual purpose: (a) so Edgar doesn't need to re-derive his own past reasoning, and (b) it's raw material that could genuinely feed a future case study about building this system — demonstrating an end-to-end owner and systems thinker who metabolizes complexity, prototypes to think, and drives through ambiguity, not someone narrating how they set a CSS property. Every entry should clear that bar: a real trade-off, a real pivot, or a real judgment call with reasoning — not a build-order log or an implementation-detail record.

Not a status tracker (`progress.md`) or a roadmap (`PLAN.md`).

## Format

A spine of sequential numbered decisions. Each has:
- **Spokes** — the factors, constraints, or prior mistakes that fed into it (the radiating lines in the sketch)
- **Decision** — what was actually chosen
- **Sub-decisions** — lettered branches (002a, 002b...) when one decision spawned smaller decisions underneath it, rather than continuing the main spine

## Logging workflow

Entries are drafted **only when the user explicitly flags something as decision-worthy** — not proactively drafted during or at the end of a build session. Wait to be told.

**This log records Edgar's decisions, direction, and interventions — not the agent's internal execution process.** Tool mechanics, retries, and implementation missteps don't belong here even if they prompted a correction; only the resulting direction does (e.g. "user scoped the audit to X" — not "an early attempt did Y and hit an error, so...").

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
- `component-builder` is hardcoded to portfolio-specific token/component paths
- `section-builder` is placement logic only, doesn't reference token source
- Neither skill covers assembling a full product UI screen from primitives — a new kind of build this system introduces

**Decision:** Fork `component-builder` → `xops-component-builder` (same rules, repointed paths). Reuse `section-builder` as-is for placing the whole module into the case-study narrative. Screen-assembly has no existing skill yet — will be defined once primitives exist (Phase 2/3 boundary).

**Leads to:** 007

---

## Decision 007: Decision log scoped to XOPS only, node-based structure

**Spokes:**
- User wants to eventually narrate "how I work," including mistakes — a flat status log doesn't capture that, needs to preserve *why*
- Considered a portfolio-wide journal in addition to an XOPS-scoped one — user chose to scratch the portfolio-wide version and focus on XOPS only, for now
- User sketched the intended structure by hand: a spine of decisions, each with radiating "spoke" factors, and occasional side-clusters of sub-decisions branching off one node — closer to a decision graph than a flat ADR list or chronological devlog

**Decision:** This file (`DECISIONS.md`), numbered spine + spokes + lettered sub-decisions, XOPS-scoped only.

---

## Decision 008: Foundations audit scoped to representative nodes, fed incrementally

**Spokes:**
- User directed that only structural design data (Figma node variables) counts as accurate — screenshots are not a reliable source, with one exception: the single static legacy asset that has no corresponding Figma node at all
- User scoped the audit down deliberately: rather than surveying every screen up front, foundations get established from a small representative pair of nodes
- User set the ongoing workflow: additional screens get fed in one at a time as they're actually built, not gathered proactively in a batch sweep

**Decision:** Foundations are audited from node-level variable data only, and only for nodes the user hands over — no proactive multi-screen surveys.

### Sub-decision 008a: Foundation node selection

**Spokes:** Overview's legacy/final pairing looked unreliable as a before/after reference (didn't line up with the local screenshot), so user set it aside rather than resolving the ambiguity in the moment
**Decision:** User selected Software Profile's legacy/final pair as the two foundation-defining nodes, and separately called for All Software plus one legacy reference node to be brought in afterward specifically to cross-check and fill gaps in that base pair
**Leads to:** 009

---

## Decision 009: Typography and color foundations locked

**Spokes:**
- Software Profile's color palette held identical across legacy and final, which reframed the screen's redesign as structural rather than a repaint (ties back to [[004]]/[[004a]])
- All Software's data showed two parallel 14px type styles were both real, separate named styles rather than one inconsistent one — the system still needed a single canonical value going forward, which was user's call to make
- The legacy reference node confirmed a genuine color shift between generations and validated an inverse-text pattern already suspected from All Software final
- User directed that badge tint colors must derive from the solid semantic colors, using the same ramp logic already established in the portfolio's own token system, rather than carrying over the file's raw one-off values as-is — this caught and corrected an inconsistency where the design's Warning badge used an off-brand raw color instead of its own semantic Warning color
- User then directed badge text colors to derive from those same solid hues as well, and set the accessibility bar deliberately above what the design file actually shipped with

**Decision:** Type scale and color locked by user's explicit calls on each open item, written to `design-systems/xops/tokens.json`/`tokens.css`, mirroring the portfolio's own token structure but fully separate per [[002]]. Spacing, radius, and elevation intentionally left open — no direction given on these yet.

**Leads to:** 010

---

## Decision 010: Full numbered color ramps, anchor always at step 500, no one-off hex values

**Spokes:**
- User compared the audited color palette against the portfolio's own `tokens.json` and pointed out the mismatch: the portfolio uses full numbered ramps (`grey.50`→`grey.1100`, etc.) with `Semantic` aliasing specific steps, while XOPS only had discrete one-off hex values per role — user wanted the same structure adopted, not a simplified version
- First attempt anchored the Grey/Neutral ramp at whichever step the audited value happened to match in an external reference palette (Tailwind), landing it at step 400 while Success/Warning/Danger coincidentally landed at 500 — user called this out: the anchor should always sit at 500, consistently, regardless of what an external palette's own numbering happens to produce
- User then asked why Tailwind was being used at all if the ramps were meant to be custom, and directed that **all five ramps** (not just Grey) be fully custom-generated rather than borrowing any external palette's values — full consistency, nothing borrowed
- Separately, an early draft of `tokens.json` used descriptive primitive names (`ink`, `slate`, `mist`, `fog`, `sky`, `cloud`) instead of numbered steps — an assumption made unilaterally before ramps existed, never checked with the user, and left in place after the ramps were built instead of being reconciled. User flagged this explicitly as a mistake, not a style preference.
- User then directed that every remaining flat semantic value (`text.primary`, `text.secondary`, `border.divider`, `surface.table-header`, `surface.empty-state`, `surface.selected`) be resolved to its closest ramp step rather than staying as one-offs — "no 1-offs" was the explicit bar

**Decision:**
- All five color families are custom-generated 50–950 ramps, anchor value grafted in exactly at step 500 for every family — no external palette used as a source of values at all, only as a reference point during exploration
- Every `Semantic` role resolves to a named primitive step, with one deliberate exception: `text.inverse` stays an absolute pure-white primitive since snapping it to the nearest ramp step would undermine its purpose of maximum contrast on dark surfaces
- Badge tint/text pairing re-verified against the new custom values — passes cleanly this time, unlike the earlier Tailwind-based attempt

**Leads to:** 011

---

## Decision 011: Spacing and radius — primitive-only, no semantic layer yet

**Spokes:**
- User specified the scales directly rather than asking for an audit — deliberate, hand-picked values, not derived from Figma measurements this time
- User explicitly deferred elevation — no work wanted on it right now
- User asked whether a semantic layer was needed above these primitives, framing the whole system as something to "evolve as we go, build complexity as we need" rather than fully specify up front
- Precedent noted from the portfolio's own `tokens.json`: its semantic spacing layer is minimal, not a full wrapper over every primitive step — supported the case for skipping a semantic layer here too until an actual recurring named measurement shows up

**Decision:** `Primitives.spacing` and `Primitives.radius` only, `{px}`-keyed (`spacing-16`, `radius-12`, etc.), no semantic aliasing layer. A semantic entry gets added later, one at a time, only when a specific measurement recurs across real components — not pre-built speculatively. Elevation remains fully deferred, no scale, no direction given yet.

**Leads to:** 012

---

## Decision 012: No formal component-builder skill fork yet — build primitives directly

**Spokes:**
- Starting the Button primitive, the agent proposed forking `xops-component-builder` (mirroring the portfolio's `component-builder` skill, with its full pre-build-checklist gate) before writing any code
- User rejected this: no components exist yet in this system — the priority right now is establishing primitives and system foundations, not standing up a heavyweight build-and-registry process around zero prior art
- User's direction: "once we establish basic building blocks then we start establishing a doc of how to reference them" — the reference/registry doc comes *after* real components exist to document, not before

**Decision:** Build Button (and other early primitives) directly, without the full skill-gated process. A lighter reference doc for how to build/reference XOPS components gets written once there's a real registry to document — not scaffolded speculatively.

**Leads to:** 013

---

## Decision 013: External design-system references — structure only, never naming or values

**Spokes:**
- User shared external `DESIGN.md`-style analyses of other products' marketing sites (studied purely for how a reference document like that organizes itself), asking to understand structure and best practice before building the Button primitive's state checklist
- Early in this analysis the agent drifted into treating pattern *convergence* across two references as validation for specific XOPS naming choices (e.g. citing it as backing for a proposed token name) — user corrected this immediately and drew an absolute line
- User's rule: nothing from an external reference — no token name, value, naming pattern, or modeling choice — informs XOPS directly. XOPS's actual names, values, and structure come only from audited Figma data and user direction
- User then refined what *is* fair game to extract: not naming conventions either, but the **coverage skeleton** — the checklist of dimensions a complete system has to answer (does this component type need an icon-only variant? does text need a tertiary/disabled tier? does the button get its own typography role?) — the questions, never the answers

**Decision:** External references (marketing or product design systems) are studied only for (a) how a spec document organizes itself, and (b) the completeness-checklist categories/dimensions a system of that kind accounts for. Never token names, never values, never naming or modeling patterns. This is a strict, standing rule for all future reference material, not scoped to any one session.

### Sub-decision 013a: First four references were marketing sites — a scope mismatch for product-UI state coverage

**Spokes:** The four references gathered first (two dark/light SaaS marketing brands, one enterprise marketing site, one editorial marketing site) all cover a shallower interaction-state surface than product UI needs — marketing CTAs rarely need `disabled`, `loading`, or `selected` states, which are exactly the states a product button requires
**Decision:** User flagged this mismatch directly; a genuine product design system reference (not marketing) is needed to meaningfully extend the state-coverage checklist beyond what a CTA button demonstrates. Noted as an open ask — user to provide a product-system link when ready.

**Leads to:** 014

---

## Decision 014: `xops-design-system-analysis` skill — an accumulating coverage-checklist tool

**Spokes:**
- Per Decision 013's refined scope (skeleton/coverage extraction, never naming or values), user asked for this to become a standing, reusable skill rather than a one-off exercise — fed by successive reference analyses over time, getting sharper with each one
- The skill's job is to diff a reference's demonstrated coverage dimensions (color role tiers, typography roles, variant dimensions, state coverage, elevation model) against XOPS's current state and surface gaps as open questions — never to write to `tokens.json` directly

**Decision:** Create `xops-design-system-analysis`, name confirmed by user. Output feeds `progress.md`'s Resume Context and drafted `DECISIONS.md` entries; an accumulating findings log lives alongside the rest of the XOPS doc set. Not yet built — pending the doc-set relocation in Decision 015 so the skill and its log land in the right place from the start.

**Leads to:** 015

---

## Decision 015: Doc-set storage restructured — centralized under `.claude/projects/`, matching portfolio pages

**Spokes:**
- Portfolio-page projects store their doc set at `.claude/projects/<page-name>/`; XOPS, as the first non-portfolio project, had instead kept its doc set colocated with its code at `design-systems/xops/` — an inconsistency between the two project types
- This exact mismatch had already been flagged as a known gap in the `new-nonportfolio` skill ("scaffolds under `design-systems/<name>/` even when the project doesn't need its own design system... kept as-is for now... restructure this when it comes up again") — this was that moment
- User confirmed the direction: centralize doc sets for both project types under `.claude/projects/<name>/`; code, tokens, and components stay wherever they already lived (`design-systems/<name>/` for non-portfolio projects)

**Decision:** Moved `PLAN.md`, `xops-progress.md` (renamed `progress.md`, matching the portfolio-page naming convention), and `DECISIONS.md` from `design-systems/xops/` to `.claude/projects/xops/`. `design-systems/xops/` now holds code/tokens only (`tokens.json`, `tokens.css`, `components/`). Updated CLAUDE.md's Project Structure and Project Doc Sets sections, and the `new-nonportfolio` skill's scaffolding targets, to reflect the doc-set location as identical across both project types going forward.

**Leads to:** 016

---

## Decision 016: `design-system-analysis` skill — agnostic scope, per-project log, pattern-distillation step

**Spokes:**
- User redirected the skill's scope mid-build: it should be usable by any future design-system project, not tied to XOPS specifically — the working name `xops-design-system-analysis` was renamed accordingly
- User asked where the findings log should live given the agnostic skill — resolved as project-scoped (`.claude/projects/<name>/analysis-log.md`), separate from `PLAN.md`/`progress.md`/`DECISIONS.md`, since a gap analysis is always relative to one project's current state even though the *method* producing it isn't
- User specified the log be categorized (typography, spacing, components, colors, etc.), matching the tiered structure the first Carbon research pass already produced
- User then corrected the graduation model twice: first, that findings shouldn't just move to `PLAN.md` on a vague "user confirms" basis — there needed to be an actual distillation system; second, that distillation isn't a binary adopt/decline — it's recognizing *patterns* in how references architect a dimension (naming shape, modeling choice, layering strategy — never literal tokens) and then either selecting one observed approach or combining ideas from several into a new, fully original XOPS direction
- User chose to finish this skill before resuming the Button build, judging it would pay off across all future work, not just the current primitive

**Decision:** `design-system-analysis` skill built at `.claude/skills/design-system-analysis/SKILL.md` — agnostic across projects, targets whichever project's doc set is specified. Six-step process: identify target project → intake reference (index/nav first for docs sites, folder/file architecture for source repos; multi-page work delegated to a background research pass) → extract into seven categories (production-structure map, typography, color, spacing, radius, elevation, components), capturing both existence gaps and structural approaches observed → distill each item to a disposition (Select / Combine / Declined / Needs more data) → graduate only Select/Combine items to `PLAN.md` → write everything to the target project's `analysis-log.md`. First pass run against Carbon Design System; all findings currently dispositioned "Needs more data" pending cross-reference against the queued GitHub Primer, Blueprint.js, and Atlassian passes.

**Leads to:** 017

---

## Decision 017: Value-level confirmation gate — broken twice, now made explicit and non-negotiable

**Spokes:**
- While building Button, the agent tokenized `border-width` (1px) and `icon-size` (20px) by copying the raw numbers straight out of the Figma output and hardcoding them into `Button.module.css`, without proposing them as token values or asking — caught by the user, who asked directly why no design details had been surfaced for confirmation
- Shortly after, building the `Semantic.state` color layer (hover/active/focus/disabled), the agent picked specific ramp steps unilaterally — `brand.600` for hover-on-brand, `brand.700` for active-on-brand, `grey.100`/`grey.200` for hover/active-on-surface, `brand.500` reused for the focus ring, and an opacity-based (`0.4`) mechanism for disabled — and wrote all of it directly to `tokens.json`/`tokens.css` with zero confirmation
- Both failures happened despite an existing rule already covering this exact case (`progress.md`'s own Session Workflow: "New foundation token → confirm with user before locking in a value") — the rule existed but wasn't specific enough to actually stop the behavior; treating a single-ramp-step shift or a raw Figma number as an "obvious default" let the agent route around it both times
- User's direction: strengthen the documentation itself so this doesn't recur — not just apologize and self-correct in the moment

**Decision:** The value-confirmation rule is rewritten to be explicit about the exact failure mode (a ramp step, a px number, an opacity, "one step darker" reasoning — anything that feels like an obvious default is exactly what must be confirmed, not exempted) and added in three places: `progress.md`'s Session Workflow (the operational checklist actually followed during XOPS work), `CLAUDE.md`'s Agent Behaviour section (portfolio-wide, since the same failure mode applies to any design-system project), and here, so the failure itself — not just the corrected rule — is on permanent record. All six unconfirmed `Semantic.state` values are reopened pending the user's actual review.

**Leads to:** 018

---

## Decision 018: `Semantic.state` values confirmed — disabled goes color-based, not opacity-based

**Spokes:**
- Reviewing the reopened state values, user adjusted two of the agent's original proposals one ramp step darker: `hover.on-brand` → `brand.700`, `active.on-brand` → `brand.800`
- User rejected the opacity-based disabled mechanism outright: a single opacity multiplier reads inconsistently across variants with different base luminance — a saturated `brand.500` primary and a near-white secondary fade to very different perceived "disabled-ness" at the same value
- In its place: one uniform neutral treatment applied to every variant, rather than a distinct color set per variant — simpler, and it fully resolves the inconsistency since there's no longer a per-variant base color for an opacity multiplier to interact with
- For focus, user changed the mechanism as well as the value: a box-shadow ring rather than the border/outline the agent had assumed, at `#8FBEFF` — resolved to the already-existing `brand.300` (an exact match) rather than a new raw value, per Decision 010
- `text-on-secondary` reconfirmed at `grey.700` after being seen live in Storybook — the near-tie flagged earlier didn't change the call

**Decision:**
- Hover/active values adjusted one ramp step darker from the original proposal per user review
- Disabled goes uniform-neutral across every variant instead of opacity-based — no per-variant color set, no opacity token retained
- Focus mechanism changed to a box-shadow ring rather than border/outline, resolved to an existing ramp step rather than a new raw value, per [[010]]
- Button's full state checklist (default, hover, active/pressed, focus, disabled) is complete; `selected` intentionally excluded, not applicable to any of the 4 Figma variants

**Note:** This log is getting long — a cleanup/consolidation pass is warranted soon, flagged for a future session rather than done here.

**Leads to:** 019

---

## Decision 019: Overview is three designs, not two — v1 gets reconstructed, not audited

**Spokes:**
- Overview turns out not to follow the usual legacy/final pairing every other screen has used: there are three designs — **legacy v1** (screenshot only, no Figma node — the same asset-less exception already flagged generically in Decision 008), **legacy v2**, and **final** (both of the latter two have real Figma nodes)
- This resolves the open "Overview node mapping ambiguity" noted in Decision 008a (where the legacy/final pairing looked unreliable against a local screenshot and was set aside rather than resolved) — the ambiguity existed because there was a v1/v2 split nobody had named yet, not because the node data itself was wrong
- User's direction: v1 doesn't need its own audit — its elements can be reconstructed from v2 and final's actual node data, since no node exists to audit it against directly
- Separately, user reconfirmed the general approach going forward: build driven by actual screen requirements (pull the real Figma nodes, see what's net-new against what's already built) rather than pre-guessing the next primitive from `analysis-log.md`'s candidate list top-down

**Decision:** Overview build order: v2 and final are the two real sources; v1 is reconstructed from their elements, not independently audited. Next screen after Overview is All Software, legacy first. Next primitive/pattern selection is deferred until the actual Overview Figma nodes are pulled and checked against what Button already covers.

**Leads to:** 021

---

## Decision 021: Nav/header tokens resolved almost entirely through reuse, not new values

**Spokes:**
- The corrected screens came with real Figma style names that mapped closely onto ramps already established in earlier audits
- Several off-scale measurements showed up (values that don't land on an existing spacing/radius step)

**Decision:** Treated close matches as confirmation of the existing system rather than grounds to fork new anchors — new tokens were added only where a genuinely new role appeared (submenu-selected background, avatar placeholder background, and a general-purpose `full` radius step for circular elements with no fit in the stepped 6/8/12/16 scale). Off-scale measurements were rounded to the nearest existing step rather than growing the scale for one-off numbers.

**Leads to:** 023

---

## Decision 023: Sidebar and GlobalHeader built as the page shell

**Spokes:**
- Every XOPS screen nests inside the nav + header shell — building it first (rather than dashboard content) was the user's sequencing call
- Avatar has no photo asset available; search has no backing functionality yet

**Decision:** Built `Sidebar` and `GlobalHeader` as the first two components. Avatar and search were left as inert placeholders — deliberately out of scope for a shell build, not an oversight.

**Leads to:** 024

---

## Decision 024: Final version always built first; legacy is deferred, throwaway

**Spokes:**
- Building a page-header pattern reused across screens raised the question of build order between a screen's final and legacy Figma versions

**Decision:** Standing principle for every screen going forward: build the final/real design system version first. Legacy/prototype versions are separate one-offs, built later, not registered in the main system.

**Leads to:** 026

---

## Decision 026: Overview build order — grid established before cards/table; V2 confirmed as final-minus-cards

**Spokes:**
- Overview v2 is the final design with a couple of cards removed — treating it as legitimate final-design source, not a throwaway legacy version (extends [[019]]'s three-design framing)
- Before building any card, tab, or table component, user asked whether a dashboard/card grid pattern existed to build against — the analysis log's "Grid/layout-system tie-in" and "Layout primitives" items were still open/inconclusive

**Decision:** Build order revised to establish the grid system first, then cards/tabs/table. V2 (471:7000) confirmed usable as final-design source for Overview's dashboard body, excluding its sidebar/global-header/page-header (those come from the already-built shell, not this node).

**Leads to:** 027

---

## Decision 027: `Grid` — new top-level token tier, sibling to `Primitives`/`Semantic`

**Spokes:**
- Ran `/design-system-analysis` against Carbon 2x Grid, Fluent 2 Layout, and Ant Design Grid + Layout (Druids inaccessible — SPA gated behind auth)
- Carbon and Ant both place grid as its own top-level foundation, not nested under an alias/semantic tier
- Ant draws a hard distinction between "Layout" (page regions: header/sider/content/footer) and "Grid" (column system) — XOPS already has page-region components (Sidebar/GlobalHeader/PageHeader) separate from any column system, so reusing "Layout" as the new tier name would collide

**Decision:** Added `Grid` as a new top-level tier. Fixed 12-column model chosen as user's own call — not driven by reference convergence, which split between fixed/fluid/multi-mode approaches. Responsive breakpoints declined for now — Overview is single fixed-width; revisit once a second dashboard screen exists to inform real breakpoint bundling. (Concrete values in `design-systems/xops/tokens.json`.)

**Leads to:** 028

---

## Decision 028: Documentation workflow redefined — one job per doc, `analysis-log.md` retired

**Spokes:**
- Across a long build session, `progress.md` and `DECISIONS.md` had both drifted into holding full implementation detail — token names, exact px/color values, accessibility contrast math, Figma node IDs — alongside their actual jobs (status tracking, strategic narrative), making them expensive to write and expensive to read
- A separate `analysis-log.md` had been holding external-reference research findings as a permanent artifact, but that content only has value in the live moment of deciding — nobody re-reads "Ant does X, Carbon does Y" after the decision is made and built
- User pointed to `case-study-audit/SKILL.md`'s crisp persona/scope/deliverable definition as the model worth matching: every doc or skill should have exactly one job with a hard scope boundary — that discipline is what makes a doc actually get used instead of skimmed once and ignored
- User's real intent for this file clarified directly, correcting an earlier assumption: `DECISIONS.md` was never meant as practical bookkeeping to avoid re-litigating settled questions. Its sole purpose is capturing strategic systems-thinking narrative — direction, trade-offs, judgment — which doubles as raw material for a future case study demonstrating exactly the technical-systems-thinker persona `case-study-audit` screens for
- This whole doc set is read only by agents and by Edgar himself — no team or handoff audience — which shaped how far the redefinition needed to go; no reason to over-formalize for a reader who doesn't exist

**Decision:** Four-way scope split, one job per doc:
- `guidelines.md` — project-agnostic process rules (how to build, never what)
- `PLAN.md` — destination/spec (end-state architecture, phase sequencing, what "done" looks like)
- `progress.md` — status board only (what's built/not/next, one line per item, no implementation detail)
- `DECISIONS.md` (this file) — strategic narrative only, scope note now stated at the top of the file itself

`analysis-log.md` retired entirely — the `design-system-analysis` skill's research/checklist dialogue now resolves live in conversation and doesn't persist to a dedicated log by default; a decision only lands here if it genuinely clears the strategic bar. Existing entries in this file were re-audited against the new scope: trimmed where implementation detail was mixed in with real judgment (kept the trade-off, cut the token/px/hex specifics), removed outright where an entry was pure implementation log with no strategic content (former Decisions 020, 022, 025 — folded what little was worth keeping into adjacent entries, e.g. the `radius.full` addition into 021).

---

## Decision 029: `Stat` kept separate from `Card`; standardized to filled-only across all reference instances

**Spokes:**
- Pulling multiple Figma references for the same "labeled metric" shape (License Utilization's stat-pair, Zoom's Ownership tiles, Infrastructure Data Health's metric/summary tiles, Top Spend's floating stat box) surfaced that the source design itself is inconsistent — some instances plain/borderless, some filled with two different near-identical fill values — confirming Figma isn't the source of truth here and this shape needed active standardization, not transcription
- Considered folding `Stat` into `Card` as a chrome/background variant instead of a separate component, since both are "boxes with content." Rejected: `Card` is a generic arbitrary-content container while `Stat` has a fixed internal shape (label/value/optional meta); `Stat` tiles are routinely placed inside a `Card` (e.g. Data Health's Summary Card), which would force `Card` to also solve its own nested-chrome contradiction from within the same component
- License Utilization's Total Owned/Assigned pair was the one plain/borderless instance in Figma; user chose to override it to filled rather than carry the inconsistency forward, prioritizing one unified `Stat` look system-wide over exact fidelity to that one source frame

**Decision:** `Stat` built as its own filled-only content primitive, deliberately kept separate from `Card`. Reusability was the deciding factor — user flagged up front that this shape will recur across future dashboard panels beyond this one card, which argued for a chrome-optional primitive over a one-off layout baked into License Utilization specifically.

**Leads to:** License Utilization card build continues — legend row and hand-built SVG donut chart next; the card's warning banner is deferred into the future notifications system rather than built standalone.
