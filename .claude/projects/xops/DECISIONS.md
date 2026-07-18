# XOPS Decision Log

**Scope:** DECISIONS.md is pure strategic narrative — Edgar's systems-thinking story: trade-offs weighed, direction chosen, judgment calls and the reasoning behind them. Never UI detail, never token/px/color values, never code-level reasoning, never a change-log of implementation steps. Dual purpose: (a) Edgar doesn't re-derive his own past reasoning; (b) raw material for a future case study about building this system — demonstrating an end-to-end owner and systems thinker, not someone narrating how they set a CSS property. Every entry must clear that bar: a real trade-off, a real pivot, or a real judgment call with reasoning. Meta-decisions about the workflow and doc system itself clear the bar too — how the work gets structured is part of the story.

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

## Decision 002: Separate, namespaced design system at repo root — not an extension of the portfolio's

**Spokes:**
- Portfolio already has its own token/component system built for Edgar's personal brand; XOPS screens need to look like XOPS's product, not the portfolio's brand
- Intent to reuse this system for future XOPS-sourced case studies — it must outlive a single case study page, so it can't be scoped inside the case-study route where it would die with that page
- Portfolio's own `design-system/` already lives at repo root — consistent sibling pattern

**Decision:** New system at root-level `design-systems/xops/`, fully separate token file, `xops-` prefix on all CSS custom properties and component names, so the two systems never resolve against each other. The case study route imports from it, doesn't own it. (Absorbs former Decision 003 — file placement was the direct follow-through of the same isolation/reuse reasoning.)

**Leads to:** 004

---

## Decision 004: Legacy → Modern transform mechanic

**Spokes:**
- Core "trick" requested: press a button, watch old UI organically become the redesigned UI
- GSAP already in stack (entrance/scroll animations elsewhere in the portfolio)
- The 3 target screens are a mix of visual-only and structural changes, varying per screen

**Decision:** Represent each screen's old/new state as one component with a `variant="legacy"|"modern"` prop, not two separate components swapped out. Animation technique branches per element: CSS-custom-property tween for visual-only changes, FLIP transition for structural ones. Which parts of each screen are which is classified during the Foundations Audit against actual Figma files, not guessed up front (former sub-decision 004b).

### Sub-decision 004a: Single component + variant prop, not swapped components

**Spokes:** A true "morph" only reads as organic if it's the same DOM interpolating, not one element replaced by another
**Decision:** `variant` prop pattern locked in as the baseline for every screen/component in this system.

**Leads to:** 005

---

## Decision 005: Code-reveal toggle — concept confirmed, build deferred

**Spokes:**
- User wants the "insides" (actual code) visible, not just the rendered UI — reinforces the front-end-execution story from 001
- Storybook solves live-render + source-panel out of the box, but the toggle needs to live inside the case-study narrative itself, not link out to a separate app — bespoke fits the presentation better
- User explicitly chose to go step by step rather than solve it now

**Decision:** Bespoke code-reveal toggle, deferred to Phase 6 (after screens exist). Kept conceptually distinct from the transform toggle — one flips UI state, the other flips UI vs. source — so they don't collapse into the same control.

**Leads to:** 006

---

## Decision 006: Skill reuse vs. fork

**Spokes:**
- `component-builder` is hardcoded to portfolio-specific token/component paths
- `section-builder` is placement logic only, doesn't reference token source
- Neither skill covers assembling a full product UI screen from primitives — a new kind of build this system introduces

**Decision:** Fork `component-builder` → `xops-component-builder` (same rules, repointed paths). Reuse `section-builder` as-is for placing the whole module into the case-study narrative. Screen-assembly has no existing skill yet — will be defined once primitives exist.

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
- User directed that only structural design data (Figma node variables) counts as accurate — screenshots aren't a reliable source, with one exception: the single legacy asset that has no corresponding Figma node at all
- Rather than surveying every screen up front, foundations get established from a small representative pair of nodes; additional screens feed in one at a time as they're actually built, not gathered in a proactive batch sweep

**Decision:** Foundations are audited from node-level variable data only, and only for nodes the user hands over — no proactive multi-screen surveys.

### Sub-decision 008a: Foundation node selection

**Spokes:** Overview's legacy/final pairing looked unreliable as a before/after reference, so user set it aside rather than resolving the ambiguity in the moment
**Decision:** User selected Software Profile's legacy/final pair as the two foundation-defining nodes, with All Software plus one legacy reference node brought in afterward specifically to cross-check and fill gaps in that base pair
**Leads to:** 009

---

## Decision 009: Typography and color foundations locked

**Spokes:**
- Software Profile's color palette held identical across legacy and final, which reframed that screen's redesign as structural rather than a repaint (ties back to [[004]]/[[004a]])
- All Software surfaced two parallel same-size type styles that were both real, separately named styles — the system still needed a single canonical value going forward, which was the user's call to make
- The legacy reference node confirmed a genuine color shift between generations
- User directed that badge tint and text colors derive from the solid semantic colors, using the same ramp logic as the portfolio's token system, rather than transcribing the file's raw one-off values — and set the accessibility bar deliberately above what the design file actually shipped with. The file's own values can be wrong; derivation catches what transcription would carry forward.

**Decision:** Type scale and color locked by user's explicit calls on each open item, written to XOPS token files, mirroring the portfolio's token structure but fully separate per [[002]]. Spacing, radius, and elevation intentionally left open — no direction given yet.

**Leads to:** 010

---

## Decision 010: Full numbered color ramps, anchor always at step 500, no one-off hex values

**Spokes:**
- User compared the audited palette against the portfolio's own `tokens.json` and pointed out the mismatch: the portfolio uses full numbered ramps with `Semantic` aliasing specific steps, while XOPS only had discrete one-off values per role — user wanted the same structure adopted, not a simplified version
- A first ramp attempt borrowed an external palette's (Tailwind's) numbering, letting the anchor land wherever that palette's steps happened to put it — user's calls: the anchor sits at step 500, always, for every family; and all five ramps are fully custom-generated, nothing borrowed from any external palette's values
- An early draft had used descriptive primitive names invented unilaterally before the ramps existed, then left unreconciled after — user flagged this explicitly as a mistake, not a style preference
- "No 1-offs" set as the explicit bar: every remaining flat semantic value resolves to its closest ramp step

**Decision:** All five color families are custom-generated 50–950 ramps anchored at step 500. Every `Semantic` role resolves to a named primitive step, with one deliberate exception: `text.inverse` stays absolute pure white, since snapping it to a ramp step would undermine its purpose of maximum contrast on dark surfaces.

**Leads to:** 011

---

## Decision 011: Spacing and radius — primitive-only, no semantic layer yet

**Spokes:**
- User specified the scales directly rather than asking for an audit — deliberate, hand-picked values, not derived from Figma measurements this time
- User explicitly deferred elevation
- User framed the whole system as something to "evolve as we go, build complexity as we need" rather than fully specify up front; the portfolio's own minimal semantic-spacing layer supported skipping one here too

**Decision:** `Primitives.spacing` and `Primitives.radius` only, `{px}`-keyed, no semantic aliasing layer. A semantic entry gets added later, one at a time, only when a specific measurement recurs across real components — not pre-built speculatively. Elevation remains fully deferred.

**Leads to:** 012

---

## Decision 012: No formal component-builder skill fork yet — build primitives directly

**Spokes:**
- Starting the Button primitive, the agent proposed forking `xops-component-builder` (with its full pre-build-checklist gate) before writing any code
- User rejected this: no components exist yet — the priority is establishing primitives and foundations, not standing up a heavyweight build-and-registry process around zero prior art
- User's direction: the reference/registry doc comes *after* real components exist to document, not before

**Decision:** Build Button (and other early primitives) directly, without the skill-gated process. A lighter reference doc gets written once there's a real registry to document — not scaffolded speculatively.

**Leads to:** 013

---

## Decision 013: External design-system references — structure only, never naming or values

**Spokes:**
- User shared external `DESIGN.md`-style analyses of other products' sites, studied purely for how a reference document organizes itself, before building the Button primitive's state checklist
- The analysis drifted into treating pattern *convergence* across references as validation for specific XOPS naming choices — user corrected immediately and drew an absolute line: nothing from an external reference — no token name, value, naming pattern, or modeling choice — informs XOPS directly. XOPS's names, values, and structure come only from audited Figma data and user direction
- User then refined what *is* fair game to extract: the **coverage skeleton** — the checklist of dimensions a complete system has to answer (does this component type need an icon-only variant? does the button get its own typography role?) — the questions, never the answers

**Decision:** External references are studied only for (a) how a spec document organizes itself, and (b) the completeness-checklist dimensions a system of that kind accounts for. Never names, never values, never modeling patterns. A strict, standing rule for all future reference material.

### Sub-decision 013a: First four references were marketing sites — a scope mismatch for product-UI state coverage

**Spokes:** All four references gathered first were marketing sites, covering a shallower interaction-state surface than product UI needs — marketing CTAs rarely need `disabled`, `loading`, or `selected`, exactly the states a product button requires
**Decision:** A genuine product design system reference is needed to meaningfully extend the state-coverage checklist. Noted as an open ask — user to provide a product-system link when ready.

**Leads to:** 015

---

## Decision 015: Doc-set storage restructured — centralized under `.claude/projects/`, matching portfolio pages

**Spokes:**
- Portfolio-page projects store their doc set at `.claude/projects/<page-name>/`; XOPS, as the first non-portfolio project, had kept its doc set colocated with its code — an inconsistency between the two project types
- This exact mismatch had already been flagged as a known gap in the `new-nonportfolio` skill ("restructure this when it comes up again") — this was that moment
- User confirmed the direction: centralize doc sets for both project types; code, tokens, and components stay where they already lived

**Decision:** Doc set moved to `.claude/projects/xops/` (with `progress.md` renamed to match the portfolio-page convention); `design-systems/xops/` now holds code/tokens only. CLAUDE.md and the `new-nonportfolio` skill updated so the doc-set location is structurally identical across both project types going forward.

**Leads to:** 016

---

## Decision 016: `design-system-analysis` skill — agnostic scope, pattern-distillation over adopt/decline

**Spokes:**
- Grew out of [[013]]'s refined scope: user asked for the reference-analysis exercise to become a standing, reusable skill fed by successive analyses over time — surfacing coverage gaps as open questions, never writing to `tokens.json` directly (absorbs former Decision 014, whose XOPS-specific framing was superseded almost immediately)
- User redirected the scope mid-build: usable by any future design-system project, not tied to XOPS — renamed from `xops-design-system-analysis` accordingly
- Findings log resolved as project-scoped, since a gap analysis is always relative to one project's current state even though the *method* producing it isn't
- User corrected the graduation model twice: findings don't graduate to `PLAN.md` on a vague "user confirms" basis — there needed to be an actual distillation system; and distillation isn't a binary adopt/decline — it's recognizing *patterns* in how references architect a dimension (naming shape, modeling choice, layering strategy — never literal tokens), then either selecting one observed approach or combining ideas from several into a new, fully original XOPS direction
- User chose to finish this skill before resuming the Button build, judging it would pay off across all future work, not just the current primitive

**Decision:** `design-system-analysis` built agnostic across projects: intake a reference, extract coverage into structural categories, distill each finding to a disposition (Select / Combine / Declined / Needs more data), graduate only accepted items to the target project's `PLAN.md`. First pass run against Carbon. (The per-project `analysis-log.md` this created was later retired in [[028]].)

**Leads to:** 017

---

## Decision 017: Value-level confirmation gate — broken twice, now made explicit and non-negotiable

**Spokes:**
- Building Button, the agent twice wrote unconfirmed values straight into the system: first hardcoding raw Figma measurements as tokens without surfacing them, then choosing every `Semantic.state` ramp step and mechanism unilaterally and writing it all to the token files with zero confirmation
- Both failures happened despite an existing rule already covering this exact case — the rule wasn't specific enough to actually stop the behavior; anything that felt like an "obvious default" (a single ramp-step shift, a raw number from Figma) routed around it
- User's direction: strengthen the documentation itself so this doesn't recur — not just apologize and self-correct in the moment

**Decision:** The value-confirmation rule rewritten to name the exact failure mode — anything that feels like an obvious default is exactly what must be confirmed, not exempted — and added in three places: `progress.md`'s Session Workflow, `CLAUDE.md`'s Agent Behaviour (the same failure mode applies to any design-system project), and here, so the failure itself — not just the corrected rule — is on permanent record. All unconfirmed state values reopened pending the user's actual review.

**Leads to:** 018

---

## Decision 018: `Semantic.state` values confirmed — disabled goes color-based, not opacity-based

**Spokes:**
- Reviewing the reopened values, user adjusted the hover/active proposals one ramp step darker
- User rejected the opacity-based disabled mechanism outright: a single opacity multiplier reads inconsistently across variants with different base luminance — a saturated primary and a near-white secondary fade to very different perceived "disabled-ness" at the same value
- In its place: one uniform neutral treatment applied to every variant, rather than a distinct color set per variant — simpler, and it fully resolves the inconsistency since there's no longer a per-variant base color for an opacity multiplier to interact with
- For focus, user changed the mechanism as well as the value: a box-shadow ring rather than the border/outline the agent had assumed, resolved to an already-existing ramp step rather than a new raw value, per [[010]]

**Decision:** Disabled goes uniform-neutral across every variant — no per-variant color set, no opacity token retained. Focus is a box-shadow ring on an existing ramp step. Button's full state checklist (default, hover, active, focus, disabled) is complete; `selected` intentionally excluded — not applicable to any of the four Figma variants.

**Note:** First flag that this log was getting long — consolidation later done in [[028]] and [[030]].

**Leads to:** 019

---

## Decision 019: Overview is three designs, not two — v1 gets reconstructed, not audited

**Spokes:**
- Overview doesn't follow the usual legacy/final pairing: there are three designs — **legacy v1** (screenshot only, no Figma node — the asset-less exception already flagged in [[008]]), **legacy v2**, and **final** (both with real Figma nodes)
- This resolves [[008a]]'s open Overview ambiguity: the pairing looked unreliable because a v1/v2 split existed that nobody had named yet, not because the node data was wrong
- User's direction: v1 doesn't need its own audit — its elements can be reconstructed from v2 and final's actual node data
- User reconfirmed the general approach going forward: build driven by actual screen requirements (pull the real Figma nodes, see what's net-new against what's built) rather than pre-guessing the next primitive top-down

**Decision:** Overview build order: v2 and final are the two real sources; v1 is reconstructed from their elements. Next screen after Overview is All Software, legacy first. Next primitive selection deferred until the actual Overview nodes are pulled and checked against what Button already covers.

**Leads to:** 021

---

## Decision 021: Nav/header tokens resolved almost entirely through reuse, not new values

**Spokes:**
- The corrected screens came with real Figma style names that mapped closely onto ramps already established in earlier audits
- Several off-scale measurements showed up (values that don't land on an existing spacing/radius step)

**Decision:** Treated close matches as confirmation of the existing system rather than grounds to fork new anchors — new tokens added only where a genuinely new role appeared (two new surface roles, plus a general-purpose `full` radius step for circular elements that no stepped value fits). Off-scale measurements rounded to the nearest existing step rather than growing the scale for one-off numbers.

**Leads to:** 023

---

## Decision 023: Sidebar and GlobalHeader built as the page shell

**Spokes:**
- Every XOPS screen nests inside the nav + header shell — building it first (rather than dashboard content) was the user's sequencing call
- Avatar has no photo asset available; search has no backing functionality yet

**Decision:** Built `Sidebar` and `GlobalHeader` as the first two components. Avatar and search left as inert placeholders — deliberately out of scope for a shell build, not an oversight.

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
- Before building any card, tab, or table component, user asked whether a dashboard/card grid pattern existed to build against — the grid/layout question was still open

**Decision:** Build order revised to establish the grid system first, then cards/tabs/table. V2 confirmed usable as final-design source for Overview's dashboard body, excluding its shell regions (those come from the already-built shell, not this node).

**Leads to:** 027

---

## Decision 027: `Grid` — new top-level token tier, sibling to `Primitives`/`Semantic`

**Spokes:**
- Ran `/design-system-analysis` against Carbon 2x Grid, Fluent 2 Layout, and Ant Design Grid + Layout
- Carbon and Ant both place grid as its own top-level foundation, not nested under an alias/semantic tier
- Ant draws a hard distinction between "Layout" (page regions) and "Grid" (column system) — XOPS already has page-region components separate from any column system, so reusing "Layout" as the tier name would collide

**Decision:** Added `Grid` as a new top-level tier. Fixed 12-column model chosen as user's own call — not driven by reference convergence, which split between fixed/fluid/multi-mode approaches. Responsive breakpoints declined for now — Overview is single fixed-width; revisit once a second dashboard screen exists to inform real breakpoint bundling. (Concrete values in `design-systems/xops/tokens.json`.)

**Leads to:** 028

---

## Decision 028: Documentation workflow redefined — one job per doc, `analysis-log.md` retired

**Spokes:**
- Across a long build session, `progress.md` and `DECISIONS.md` had both drifted into holding full implementation detail — token names, exact values, node IDs — alongside their actual jobs, making them expensive to write and expensive to read
- `analysis-log.md` had been holding external-reference research as a permanent artifact, but that content only has value in the live moment of deciding — nobody re-reads "Ant does X, Carbon does Y" after the decision is made and built
- User pointed to `case-study-audit/SKILL.md`'s crisp persona/scope/deliverable definition as the model: every doc or skill should have exactly one job with a hard scope boundary — that discipline is what makes a doc actually get used instead of skimmed once and ignored
- User's real intent for this file clarified directly, correcting an earlier assumption: `DECISIONS.md` was never practical bookkeeping to avoid re-litigating settled questions. Its sole purpose is strategic systems-thinking narrative — direction, trade-offs, judgment — doubling as raw material for a future case study demonstrating exactly the technical-systems-thinker persona `case-study-audit` screens for
- This doc set is read only by agents and by Edgar himself — no team or handoff audience — so no reason to over-formalize for a reader who doesn't exist

**Decision:** Four-way scope split, one job per doc:
- `guidelines.md` — project-agnostic process rules (how to build, never what)
- `PLAN.md` — destination/spec (end-state architecture, phase sequencing, what "done" looks like)
- `progress.md` — status board only (what's built/not/next, one line per item, no implementation detail)
- `DECISIONS.md` (this file) — strategic narrative only, scope note stated at the top of the file itself

`analysis-log.md` retired entirely — the `design-system-analysis` skill's research dialogue now resolves live in conversation; a decision only lands here if it clears the strategic bar. Existing entries re-audited against the new scope: trimmed where implementation detail was mixed in with real judgment, removed outright where an entry was pure implementation log (former Decisions 020, 022, 025 — what little was worth keeping folded into adjacent entries, e.g. the `radius.full` addition into 021).

**Leads to:** 029, and later 030 when the log drifts heavy again

---

## Decision 029: `Stat` kept separate from `Card`; standardized to filled-only across all reference instances

**Spokes:**
- Pulling the same "labeled metric" shape from four different Figma frames surfaced that the source design itself is inconsistent — some instances plain/borderless, some filled with two near-identical fill values — confirming Figma isn't the source of truth here; this shape needed active standardization, not transcription
- Considered folding `Stat` into `Card` as a chrome/background variant, since both are "boxes with content." Rejected: `Card` is a generic arbitrary-content container while `Stat` has a fixed internal shape (label/value/optional meta); `Stat` tiles are routinely placed inside a `Card`, which would force `Card` to solve its own nested-chrome contradiction from within the same component
- The one plain/borderless instance in Figma was overridden to filled by user's call — one unified `Stat` look system-wide over exact fidelity to that one source frame

**Decision:** `Stat` built as its own filled-only content primitive, deliberately kept separate from `Card`. Reusability was the deciding factor — user flagged up front that this shape will recur across future dashboard panels, which argued for a chrome-optional primitive over a one-off layout baked into one card.

**Leads to:** License Utilization card build continues — legend row and hand-built SVG donut chart next; the card's warning banner is deferred into the future notifications system rather than built standalone. Also 030.

---

## Decision 030: Second consolidation pass — the log's case-study purpose enforced, meta-decisions made first-class

**Spokes:**
- Despite [[028]]'s cleanup, the log had re-accumulated value-level and procedural detail — spokes enumerating specific ramp steps and hex values, blow-by-blow sequencing of who proposed what when — burying the judgment calls the file exists to preserve
- User re-clarified the long-term purpose directly: this file is raw material for a future visual case-study artifact showing a hiring manager how Edgar navigates design work *with* AI — the workflow he set up, how documentation stayed accurate while building, how work got roadmapped, what judgment calls got made and why. Today's only readers are Edgar and agent sessions; the future reader is the one the writing has to serve
- Explicitly *not* the fix: `progress.md`'s one-line-per-entry format. This file's job is narrative reasoning; over-compressing it would destroy the case-study material the same way bloat does — the bar is strategic altitude, not brevity
- Decisions about the doc system and workflow itself (scope splits, consolidation passes, efficiency corrections) are part of the story this log tells — they demonstrate the AI-assisted working method as much as any token decision does, so they get logged as decisions, not performed as silent edits

**Decision:** Every entry re-audited against the scope bar; value-level and procedural detail cut where it had re-accumulated (heaviest in 009, 010, 016–018); former Decisions 003 and 014 absorbed into 002 and 016 as direct continuations of the same threads with no independent judgment call. Standing principle going forward: periodic consolidation is part of the workflow, and each pass is itself recorded here as a meta-decision.

## Decision 031: "Designing for Data Uncertainty" — modularity is the data-model work, not a feature bolted onto it

**Spokes:**
- The case study makes a claim: Data Ops had higher priorities before software integrations, so the design was built not knowing which sources would exist or how complete they'd be — every view crafted so that removing a metric or an entire data category wouldn't break the experience or the story it tells. The obvious way to *show* this is a purpose-built toggle sitting on top of the finished screens.
- But every number across the three built views is currently a hardcoded, pre-formatted display string with no idea what upstream source it depends on. A hardcoded "$4.6M" can't reshape itself when Procurement drops out — you'd have to hardcode the reshaped states too, which fakes the exact principle the case study is arguing. The demonstration is only honest if the reshaping *falls out of* the data's structure rather than being staged.
- The annotated source map made the dependency graph concrete: five upstream sources (Procurement / Identity Providers / Publisher Portals / HR / Config-as-Code), each metric traceable to a combination. Drop Procurement and every dollar column vanishes; drop Identity and active/inactive/utilization vanish; drop HR and the division + terminated-employee analysis vanish. The reshaping is genuinely legible, not cosmetic — which is what makes it worth showing.
- So modularity and the "make the data real" work are the same task seen from two angles. Source-provenance tagging folds into the synthetic-dataset build rather than being a separate later layer — merging them is the point, not a shortcut.
- Placement: the demo is a section in the software-observability case-study page (via `section-builder`), not a new screen. The Insights dashboard from the reference images is a *future* build; it was shared only to read the source map, and will eventually consume the same dataset — it is not the demo surface.

**Decision:** Model one synthetic dataset of raw values, each field tagged with its source(s), metrics defined as functions of those fields; populate all three existing views from it and keep it Insights-ready. The modularity toggle is downstream and only built once that model exists. Recorded as `PLAN.md` 11 (source-tagged data model, foundation) + 12 (modularity demonstration), superseding the earlier "Table CSV → real-fetch data wiring" framing.

## Decision 032: License-model tabs get distinct column shapes, not one shared schema

**Spokes:**
- Top Spend By License Model's Enterprise Agreements tab set the baseline columns; the open question was whether the remaining tabs reuse that schema or diverge. The license model itself changes what's even measurable, so a shared schema would force meaningless columns.
- Open Source has no per-seat purchase and no single vendor to bill — the meaningful row identity is the component itself, and adoption is a raw user count. It collapses to Component / Version / Users, with no logo tile (no publisher to anchor one, and Edgar has no OSS logos).
- Perpetual is owned outright: a one-time acquisition plus recurring maintenance, not a subscription. It keeps the utilization spine but replaces recurring spend with Acquisition Cost + Annual Maintenance, and surfaces a distinct Assigned column (new to the license-model tables) alongside Unassigned.
- Consumption-based stays disabled — no confident column model for usage-metered licensing yet.

**Decision:** Each tab owns its own column set; shared tooltips and icons carry over wherever the same metric reappears (Unassigned / Assigned / Inactive / Active / Utilization). Tab-switching is wired now; rows stay empty until the source-tagged dataset (031) populates them.

## Decision 033: The data model becomes five real source tables at their true grain — not per-software aggregate scalars

**Spokes:**
- [[031]] locked *that* one source-tagged dataset would feed all three views, but left its shape open — the working assumption was per-software aggregate scalars (one object per product carrying tagged totals). Edgar reframed the goal: the case study should *show the actual files/tables each data source would produce*, as realistically as a live export from procurement, an identity provider, an HR system, a publisher portal, and config-as-code — not pre-summarized totals.
- Working through aggregate-scalars vs. per-row (per-seat) modeling surfaced the real payoff of going row-level: the employee drill-downs stop being hand-authored samples (today only one product → one department is real) and become genuine — every count on every screen is the same underlying rows filtered differently. The modularity story (hide a source, its dependent metrics vanish) then *falls out of the joins* instead of being staged, which is the honesty bar [[031]] set.
- Performance was never the real constraint — tables paginate and in-memory aggregation over tens of thousands of rows is trivial; the actual limits are repo bloat and coherent generation, both addressed by generating the data in-repo rather than committing a giant file. That is what makes Edgar's "populate every software fully, not just one hero row" call feasible: full population becomes a property of the join model, not manual work per product.
- Security/compliance data (Overview's compliance card + non-compliant table) doesn't map cleanly onto the five sources — and is slated to leave the case study anyway — so it's deliberately excluded from the model and left decorative rather than force-fitting a sixth source to accommodate it.

**Decision:** Model the data as five source tables at their real-world grain (config / procurement / HR / publisher assignments / identity activity), joined by keys, with every displayed metric defined as a join-and-count across them. Synthetic data is generated in-repo — org size is the tunable knob, exact size still open — never stored in an external service. Every software gets fully populated, because population is emergent from the join model rather than authored per product. Security-compliance data stays decorative and out of scope, pending its removal from the case study.

**Leads to:** 033a

### Sub-decision 033a: Hosted database (Supabase) considered and declined for the live data path

**Spokes:**
- The relational five-table shape naturally suggests a real database, and a live backend would lend "real infrastructure" credibility to the case study.
- But the signature interaction — the modularity morph — has to be instant and reshape the UI in place; a per-toggle round-trip to a hosted DB introduces latency, loading states, and a failure mode that fights the organic transform. Dropping a "source" in the demo is a UI operation over in-memory tables, not literally dropping a database table.
- This is a portfolio on Vercel: an external dependency that can pause, rate-limit, or fail mid-visit is a real risk a self-contained dataset doesn't carry. And the data is synthetic and read-only, so a backend's actual value — auth, mutations, realtime, persistence — goes entirely unused.
- Keeping the data in-repo also keeps the planned code-reveal fully inspectable: the "insides" are the generator and the join logic, not something hidden behind remote credentials.

**Decision:** Live data stays in-memory, generated in-repo; no hosted database on the runtime path. A database is reserved only as an optional *documentation* device — e.g. showing real SQL joins in the code-reveal — if the "real infrastructure" story proves worth telling, never as the source the running UI reads from.

### Sub-decision 033b: Synthetic data authored by a seeded, deterministic generator — logged as part of the build method

**Spokes:**
- The dataset could be authored as a committed literal (rows typed by hand or dumped by an AI) or produced by a generator. A large literal bloats the repo, is painful to keep internally consistent, and silently drifts as the model evolves.
- The modularity demo — and any later "make the org bigger or smaller" change — needs the dataset to be re-scalable from a single knob, not re-authored.
- Edgar wants *how the data is manufactured* to be a visible part of the build story; the method itself is case-study material, not just plumbing.

**Decision:** Author the synthetic data with a **seeded, deterministic generator** committed as small code. It is reproducible (same seed → identical dataset on every load, deploy, and teammate — no flicker, no drift), tunable (one knob sets org size), repo-lean (ship the recipe, not the rows), and self-contained (no external dependency, keeping the code-reveal fully inspectable). Recorded deliberately as part of the process, because the *way* the data is built demonstrates the same systems thinking the case study exists to show.
