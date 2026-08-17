# Building Guidelines

**Intent:** Project-agnostic process rules for *how* to build in this repo — not what to build, and never project-specific detail.

**When to use:** Read at the start of any session touching build work, regardless of which project — portfolio pages, XOPS, or anything future — alongside that project's own doc set.

These are strict prohibitions derived from real mistakes, written at the level of intent so they hold regardless of which project's tools, skills, or file layout are in play. Follow them unconditionally.

---

## Session Start

**Never respond to the first task without reading the active project's full doc set and design-system source of truth.**
That means: the project's own build-state doc (e.g. `progress.md`), this file, its component registry, and its token/style source of truth — plus any skill files that define build gates or checklists for the kind of work being done. Skipping any of these causes process violations mid-session.

---

## Documenting Build State

**Never write a build-state doc entry (a `## Built` list item, a "done"/"complete" registry line) for UI work the user hasn't reviewed — code compiling, typechecking, or returning 200 is not "done."**
This codebase has a standing rule that the agent cannot self-verify UI (see "No self-verify UI" below) — the user is the only one who can confirm a visual/interactive change actually works. Writing it into the build-state doc as built, then closing the session with the "Ready to clear" ritual, presents unreviewed — and potentially broken — work as finished. This happened for real: a new Home section was built, marked as done in `progress.md`'s Built list, and the session was closed out, while the live embed inside it was silently unstyled the whole time (a missing per-route CSS import) — a defect the user caught immediately on looking at it, not the agent. Doc first, review after is backwards.
**Correct order:** finish the build → tell the user it's ready to look at, in concrete terms (what to check, where) → wait for them to confirm or flag issues → only then write the Built-list entry and close the session. If the user hasn't looked yet, either don't write the doc entry, or write it explicitly flagged as unreviewed (e.g. under a Resume Context / open-items entry, never the plain Built list) and don't run the "Ready to clear" close-out — the session isn't actually done.
**This applies to build-state docs specifically** (Built lists, registry "done" markers) — Resume Context entries, Deferred/Roadmap items, and PLAN.md decisions are unaffected; those are meant to be written before review, mid-build, per the existing rules elsewhere in this file.

## Session Handoff

**Resume Context is a mid-session checkpoint, not a session-end summary.**
Write a Resume Context entry only when you need to interrupt and hand off — context limit approaching, abrupt stop, or mid-build pause before clearing chat. A clean session ends with the build-state doc's completed-work list updated and any new deferred items added — no Resume Context entry needed.

**End every session that touches docs or builds with a copy-pasteable continuation phrase, then "Ready to clear."**
After updating the build-state doc (or any other doc) following a build, close with two things in order: (1) a single self-contained sentence — naming the project and pointing at where the next step is documented (e.g. "check PLAN.md's X section" or "see progress.md's Resume Context") — that the user can paste as the first message of a fresh chat; (2) the literal line "Ready to clear." Don't restate the context itself (what was decided, the full next step, background) — the next session is already required by the Session Start rule above to read the full doc set before doing anything, so repeating it here is redundant. The pointer must name a marker that actually exists in the doc (a real Resume Context entry, a real PLAN.md section) — never invent one. Only produce either once the docs reflect reality — any unfinished build, deferred roadmap item, or flagged mistake must be recorded there (or in the project's Deferred/Roadmap section) first, and low-risk doc writes (a confirmed decision, a status update) can be folded into this same close-out step rather than written mid-session, as long as no unrelated work intervenes between the decision and this close-out. If there are loose ends, state them instead.

**Write plan/scope/architecture decisions into PLAN.md the moment they're confirmed — never batch these like built-component doc updates.**
Batching doc updates to session end is safe for built components because the code itself persists in the repo regardless of when the doc catches up. A plan, scope, or architecture decision that exists only in conversation has no such fallback — if the session pivots into unrelated build/debug work before the doc catches up, or context gets lost, the decision is gone with it. This nearly happened for real: a multi-turn design conversation established a genuine plan (what a new mechanic absorbs, its scope, its flow) that was never written down before the session moved on to implementation and a long debugging detour, and it survived only because the user happened to ask about it directly at session end. The moment a plan/scope/architecture decision is confirmed (not proposed), write it into that project's PLAN.md before continuing to the next piece of work — not at session end.

---

## Process

**Ask before acting; never build on an assumption.**
When any part of a task is unspecified — intent, scope, the real source of a value or structure, the expected outcome — stop and ask *before* doing the work, not after. Never fill a gap with a plausible guess and build on it. A wrong assumption means the work is discarded and redone, which **wastes tokens — the expensive path on this plan — and time, far more than asking ever would.** This is the default operating mode for every task, not a per-situation rule. Surface the assumptions you'd otherwise make silently as questions, up front. The concrete failures that generated this rule (inventing pixel dimensions; reconstructing a screen's nav/structure from a remembered "generic" version instead of its real components) were all the same root act: executing on a guess rather than asking.

**Never remove a Resume Context entry unless the user explicitly confirms it is complete.**
Resume Context entries track outstanding work. Removing one because a build session finished is incorrect — only remove it when the specific pending task (e.g., a missing asset) has been resolved.

**Never jump to a downstream step without completing the prerequisite gate.**
Always finish each step in the session workflow before advancing. Skipping ahead requires a correction mid-session.

**Never treat reading a reference source as a formality.**
Reading a component registry, a token/style file, or any other registry means actively cross-referencing it against every decision in the task — not skimming it.

**Never widen scope beyond what the task requires.**
Additive tasks touch only what is needed. Do not audit or refactor unrelated code.

**Never deviate from an established convention without a documented design reason.**
If a shared property (naming, layout position, component variant) already has an established pattern, default to it. Only deviate when the design explicitly requires something different.

**When a user's correction conflicts with an already-established, documented convention, flag the conflict and confirm scope before applying it — don't silently strip the standing default.**
Pinned-scroll scenes in this codebase have a standing default: the sticky stage offsets by `--nav-height` so pinned content never renders under the fixed nav (`TheProblemPinnedScene`, `FrameworkScene`, and this same component earlier in the session). Told "pin to top means very top, regardless of a scene," the nav-height offset was removed outright — treating the instruction as an override of the standing convention rather than checking whether it applied to a different element (e.g. the table's own top-left anchor point vs. the stage's nav clearance). This produced content pinned under the nav bar and required a second correction to reverse. When new guidance appears to contradict an existing, working convention, say so and confirm which element/scope it targets before changing the default.

**Never place new work in a position that matches a narrative or logical fit instead of actual append order.**
New work (a new page section, a new item in a build-order list) is appended work — place it at the true end of the existing structure, matching where it will actually land, not where it would "logically" sit in the story. Any doc that tracks build order (e.g. a completed-work list) must mirror the real, current position of what it describes — it is not append-only independent of that reality. If something is ever inserted mid-structure, its doc entry moves to match, not stay wherever it was last appended.

**Always use the most stable, unambiguous anchor for insertions.**
Prefer a structural boundary over a sibling element as the insertion point.

**Never verify each component in Storybook/dev-server one at a time while building toward a batch milestone.**
When several components are being built toward one larger goal (e.g. all the pieces for one screen), defer Storybook/dev-server checks until the whole batch is done, then verify together — not after every individual piece.

**Never shorten names.**
Use the full form derived directly from the source (design-tool layer name, class name, component name). Never abbreviate.

**Never make a CSS, structural, or behavioral call and disclose it after writing it — ask before, every time, with no "small decision" exception.**
Disclosing a decision after it's already in the code is not the same as asking permission for it — the user can only ever react to what already happened. If a choice isn't a pure bug fix (i.e. it changes what something looks like, does, or is composed of, beyond what was explicitly discussed) — a border added to fix clipping, a hover/selected style with no design source to check it against, matching one component's radius to another's, a default picked because nothing else was specified — stop and ask before writing it. This applies even when the choice feels small, obviously correct, or purely mechanical in the moment. There is no threshold of "small enough to just do it" — that judgment call is itself the thing that keeps getting made without consent. When genuinely unsure whether something counts (e.g., a one-line CSS fix with only one sane implementation), ask anyway rather than deciding it doesn't count.

---

## Layout & CSS

**Never propose new CSS without searching the existing stylesheet(s) first.**
Before writing any rule, search for the structural pattern already in use. If an existing class covers the layout, reuse it exactly. Only propose a new rule after confirming nothing existing applies.

**Never put a layout rule on a child when the parent's own class can handle it.**
When all direct children of a container share the same layout treatment, put the rule on the parent via a child-combinator selector. Only add a class to a child for a unique per-instance override.

**Never use a wrapper element solely to apply a layout rule.**
Use a combinator selector on the parent instead. Extra DOM nodes for layout only are not acceptable.

**Never override a project's established layout system (e.g. its grid) without confirming first.**
The system in place is the system to build within. Only override its core structure (e.g. replacing a grid's column template) if the layout is entirely incompatible with it — rare, and confirm with the user before doing it.

**Never use `!important` to force a layout override.**
Win specificity with a more specific, element-qualified selector instead.

**Never invent a pixel dimension — every size derives from a real source.**
This applies to abstract/schematic shapes (loading skeletons, wireframe blocks, diagrams) just as much as real UI — "it's only a placeholder" is not an exemption. **Widths** come from the parent container: `width:100%` to fill, or a `%`/flex-ratio for a partial look — never an eyeballed pixel width. **Heights** come from the real thing the shape stands in for: typography **line-height tokens** for anything representing text (a body-14 element is its 20px line-height, not a 10px sliver), and `control-height` / `bar-height` / `logo-tile-size` / `legend-swatch-size` tokens for controls and chart marks. This mistake was made twice in one build — skinny sub-container widths, then sub-line-height bar heights — each time by reaching for a magic number instead of the real dimensional source. If no token fits the thing being represented, ask rather than guess a number.

---

## Token Resolution

**Never resolve a token tier from a single raw value.**
Match the full property combination — e.g. font-family + weight + size + line-height — against the codebase's token definitions. A single pixel value or a design-tool style name in isolation is not sufficient. If nothing lines up cleanly, ask rather than guess.

**Never assume a design system's foundational tokens are inherited correctly — verify they're explicitly applied.**
When building new component CSS, explicitly check that base properties (e.g. font-family) are set from the project's own token file rather than assuming a parent or global style will supply the right value. A missing explicit declaration can silently pull in the wrong design system's styling.

---

## Design Source Ingestion

**Never pull a rendered/raster screenshot without asking first and saying why — structured data is the default source.**
The layer tree (metadata: names, sizes, positions), the design context (real vector geometry, colors, copy), the variable defs, AND the text styles are all available as structured data — read those first and build from them. That includes typography: font family, weight, size, line-height, and letter-spacing come off the node, so resolve type tiers from the node's real style, never guess or leave a placeholder. A rendered/raster screenshot (or downloading a PNG) is occasionally worth it for a purely visual judgment the structured data can't express — but it costs tokens, so ask the user before doing it and state the specific reason the vector/metadata can't answer the question. Don't take one silently as the default way to "see" a design.

## Component Usage

**Never derive a component's internal structure from a design source's sub-layer/node tree.**
Only the top-level named reference is authoritative. Look up the real prop API in the codebase. If how content maps to props is unclear, ask before building.

**Never treat "no Figma source for this variant" as license to build it as a structural one-off — ask whether it should match an existing sibling variant's mechanic.**
When adding a new variant/state/size to an already-established component, a missing design mock for that specific piece is not a green light to invent its structure from scratch. Ask explicitly: should this be the **same** structural mechanic as the closest existing sibling (e.g. a new hover state should reuse the fixed-width centered-badge slot another variant's hover state already uses), or only **similar**, with named differences? This happened for real: Button's secondary+icon hover face had no Figma mock, so it was dropped into the existing flat label-only hover shell using a generic flex-gap layout instead of mirroring primary's fixed-width badge slot — producing mismatched icon-to-label spacing (12px vs 24px) and a leftover dark icon-badge background, both silent until the user caught them well after the fact.
