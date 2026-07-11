# XOPS Design System — Build State

See `design-systems/xops/PLAN.md` for the full plan and rationale, `design-systems/xops/DECISIONS.md` for the why-behind-the-why decision log.

## Session Workflow

1. Read this file + `PLAN.md` + `built-components.md` + `tokens.css` + `.claude/skills/xops-component-builder/SKILL.md` (once forked)
2. User provides a Figma node (legacy and/or modern version) + context
3. **Before invoking any skill** — independently verify:
   - Read `built-components.md` — cross-reference every named component layer in the Figma against the registry
   - Read `tokens.json` and `tokens.css` — resolve all token bindings; if a token doesn't exist yet, flag it for the Foundations Audit rather than inventing one
   - Only the parent layer name is authoritative — treat it as the component reference. Ask before building if the mapping is unclear.
4. Branch on intent:
   - **New foundation token** → update `tokens.json` + `tokens.css` directly, confirm with user before locking in a value
   - **New primitive/pattern component** → run `/xops-component-builder` (once forked) — pre-build checklist, wait for confirm before writing code
   - **Placing the module into the case study page** → run `/section-builder` (portfolio skill, reused as-is)
5. Update this file
6. **Draft decision log entries continuously as real decisions get made during the session** (forks, naming choices, reversals, dead ends) — don't wait to be asked. Before closing the session, present drafted entries for confirmation; only write confirmed entries into `DECISIONS.md`.

---

## Built (foundations, components, screens)

Format: plain numbered list, grouped by phase. Nothing built yet.

### Foundations
_none yet_

### Primitives
_none yet_

### Patterns
_none yet_

### Screens
_none yet_

---

## Deferred (Roadmap)

- **Code-reveal toggle** — bespoke live-UI ↔ source-code swap, deferred until screens exist
- **Roadmap stub / real-data wiring** — typed prop + mock-data scaffolding on complex pieces (e.g. line chart), for the "what would it take to make this real" conversation with engineering

---

## Resume Context

Active mid-build or about-to-build state, keyed by keyword. Remove an entry once complete and folded into `## Built`.

### `xops-component-builder` skill fork
Not yet created. Needs to mirror `.claude/skills/component-builder/SKILL.md` with all `design-system/tokens.json`, `styles/globals.css`, `components/components.md`, `components/built-components.md` references repointed to their `design-systems/xops/` equivalents.

### Foundations audit
Not started. Needs both legacy and modern Figma files for the 3-screen flow. Output: `tokens.json` + `tokens.css`, plus a per-screen classification (visual-only / structural / mixed) to determine which transform technique (CSS-var tween vs. FLIP) each screen needs.
