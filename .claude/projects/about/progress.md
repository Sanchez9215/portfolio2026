# About — Progress

## Session Workflow

1. Read this file + `components/built-components.md` + `styles/globals.css` + `.claude/skills/component-builder/SKILL.md` + `.claude/skills/section-builder/SKILL.md`
2. User provides a Figma node + context — layer names follow component and DOM element naming conventions; existing tokens/components referenced where possible
3. **Before invoking any skill** — independently verify:
   - Read `components/built-components.md` — cross-reference every named component layer in the Figma against the registry
   - Read `design-system/tokens.json` and `styles/globals.css` — resolve all token bindings
   - Only the parent layer name is authoritative — treat it as the component reference and look up its real prop API in the codebase. Do not derive structure from Figma's internal sub-layer tree. If it's unclear how content maps into the component's props, ask before building.
   - To resolve a token tier, match the Figma style's full combination of properties against the codebase's token definitions — not just the style's name or a raw pixel value in isolation. If nothing lines up cleanly, ask which tier to use rather than guessing.
4. Branch on intent:
   - **New component** → run `/component-builder` — complete pre-build checklist, wait for confirm before writing code
   - **New section** → check registry for any new components first; run `/component-builder` for each, then `/section-builder`; before proposing any CSS, grep the stylesheet for existing structural patterns — reuse exact matches, present the closest match and ask if nothing fits exactly, only propose a new rule after confirming with the user that nothing existing covers it
5. Update this file

---

## Built sections (in page order)

Format: plain numbered list, `` `section.name` `` only — no inline structure/annotation notes. Anything worth recording about a section belongs in `## Deferred (Roadmap)` (future work) or `## Resume Context` (active mid-build state) instead — never appended to the list entry, since the actual structure is always in the code.

1. `section.about-hero`
2. `section.how-i-operate`
3. `section.principles`
4. `section.designing-with-ai`
5. `section.in-their-words`
6. `section.off-duty`
7. `section.say-hello`

---

## Deferred (Roadmap)

_none yet_

---

## Resume Context

Active mid-build or about-to-build state, keyed by keyword. Multiple sessions may run in parallel — keep one entry per active thread. Remove an entry once its section is complete and folded into `## Built sections`.

- **new-components-pending-review** — Three components were built new for this page without a Figma source (creative-freedom mandate, flagged for user review): `QuoteMarquee`, `NumberCard`, `SnapshotGallery` — all in `components/about/`, each marked "⚑ NEW COMPONENT (pending review)" in its file header and listed in `components/built-components.md`. User to decide whether to keep/adjust/integrate.
- **first-version-awaiting-visual-review** — Page built as an establish-first draft per user direction ("build and establish, then I will revise"). Content sourced from Figma nodes 476-1477/1302/1265/1373/1339/1427/1408 (content only; styles deliberately ignored). Quote excerpts were condensed from full LinkedIn recommendations — full originals live in Figma node 476-1477.
