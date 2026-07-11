# Building Guidelines — Portfolio Case Studies

Read this file at the start of every session, alongside `progress.md`.  
These are strict prohibitions derived from real mistakes. Follow them unconditionally.

---

## Session Start

**Never respond to the first task without reading all six required files.**

Required reading, in order: `progress.md` → `guidelines.md` → `components/built-components.md` → `styles/globals.css` → `.claude/skills/component-builder/SKILL.md` → `.claude/skills/section-builder/SKILL.md`

The skill files define the exact build gates and checklists. Skipping them causes process violations mid-session.

---

## Session Handoff

**Resume Context is a mid-session checkpoint, not a session-end summary.**  
Write a Resume Context entry only when you need to interrupt and hand off — context limit approaching, abrupt stop, or mid-build pause before clearing chat. A clean session ends with the Built sections list updated and any new Deferred items added — no Resume Context entry needed.

**End every session that touches docs or builds with "Ready to clear."**  
After updating `progress.md` (or any other doc) following a build, always close with the literal line "Ready to clear." This confirms all doc updates and builds are finished with no loose ends, so the user can safely clear the chat. Only say it once `## Resume Context` reflects reality — any unfinished build, deferred roadmap item, or flagged mistake must be recorded there (or in `## Deferred (Roadmap)`) first. If there are loose ends, state them instead of saying "Ready to clear."

---

## Process

**Never remove a Resume Context entry unless the user explicitly confirms it is complete.**
Resume Context entries track outstanding work. Removing one because a build session finished is incorrect — only remove it when the specific pending task (e.g., a missing asset) has been resolved.

**Never jump to a downstream step without completing the prerequisite gate.**  
Always finish each step in the session workflow before advancing. Skipping ahead requires a correction mid-session.

**Never treat reading a reference source as a formality.**  
Reading `built-components.md`, `globals.css`, or any registry means actively cross-referencing it against every decision in the task — not skimming it.

**Never widen scope beyond what the task requires.**  
Additive tasks touch only what is needed. Do not audit or refactor unrelated code.

**Never deviate from an established convention without a documented design reason.**  
If a shared property (naming, column span, component variant) already has an established pattern, default to it. Only deviate when the design explicitly requires something different.

**Never assume new sections belong in the middle of the page to match a narrative position.**  
New sections provided in a build session are appended work — place them at the very bottom of the page (before `</main>`), after the last existing `<Section>`, unless the user explicitly says otherwise. Do not infer placement from where the content would "logically" sit in the case study's story.

**The `## Built sections` list in `progress.md` must match actual page position.**  
It is not append-only independent of layout — it mirrors `page.tsx` order. Since new sections are placed at the bottom of the page (previous rule), their list entries also land at the bottom, in the same order. If a section is ever inserted mid-page, its list entry must move to match that position, not stay wherever it was last appended.

**Always use the most stable, unambiguous anchor for insertions.**  
Prefer a structural boundary (e.g., `</main>`, a section comment) over a sibling element as the insertion point.

**Never shorten names.**  
Use the full form derived directly from the source (Figma layer name, CSS class, component name). Never abbreviate.

---

## Layout & CSS — section-builder

**Never propose new CSS without grepping the stylesheet first.**  
Before writing any rule, search for the structural pattern in the module CSS. If an existing class covers the layout, reuse it exactly. Only propose a new rule after confirming nothing existing applies.

**Never put a grid-column rule on a child when the section's own class can handle it.**  
When all direct children of a section share the same column span, put the rule on the section class via `> *`. Only add `className` to a child for unique per-instance overrides (e.g., one child needs a different span than its siblings).

**Never use a wrapper div solely to apply a column span.**  
Use `> *` or `> :nth-child(n)` on the parent instead. Extra DOM nodes for layout only are not acceptable.

**Never replace `grid-template-columns` on a Section.**  
The 12-col grid is the system. Use `nth-child` column spans to position children. Only override `grid-template-columns` if the layout is entirely incompatible with 12 columns (rare — confirm with user first).

**Never use `!important` to force a layout override.**  
Win specificity with an element-qualified selector (e.g., `section.foo`) instead.

---

## Token Resolution — component-builder

**Never resolve a token tier from a single raw value.**  
Match the full property combination — font-family + weight + size + line-height — against the codebase token definitions. A single pixel value or a Figma style name in isolation is not sufficient. If nothing lines up cleanly, ask rather than guess.

---

## Component Usage — component-builder & section-builder

**Never derive a component's internal structure from Figma's sub-layer tree.**  
Only the parent layer name is authoritative (e.g., `ImgCard`, `LabelBlock.Display`). Look up the real prop API in the codebase. If how content maps to props is unclear, ask before building.
