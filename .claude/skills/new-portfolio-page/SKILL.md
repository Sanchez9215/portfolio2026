---
name: new-portfolio-page
description: Scaffolds a project doc set (progress.md, optionally PLAN.md) for a new page in the main portfolio site — a case study, About, Resume, or a Home page addition. Uses the shared design-system/tokens.json, styles/globals.css, and components/ registry. Triggers on explicit /new-portfolio-page invocation.
---

# New Portfolio Page

Scaffolds the doc set for a project that lives inside the main portfolio site and shares its existing design system — as opposed to `/new-nonportfolio`, which is for projects needing their own separate design system.

---

## What's shared vs. unique

**Shared across every portfolio-page project — never duplicated per project:**
- `design-system/tokens.json`, `styles/globals.css`
- `components/built-components.md`, `components/components.md`
- `component-builder` skill, `section-builder` skill

**Unique per project — created fresh by this skill:**
- `.claude/projects/<page-name>/progress.md` (always)
- `.claude/projects/<page-name>/PLAN.md` (only if asked for — see Step 2)

No `DECISIONS.md` here — that's reserved for `/new-nonportfolio`.

`.claude/projects/software-observability/` is a real, in-progress example of this pattern.

---

## Steps

### Step 1 — Get the page name

Ask if not already given: page slug (kebab-case, e.g. `about`, `resume`, `home-refresh`).

### Step 2 — Ask whether this project needs a PLAN.md

Not every page needs one — a small page may only need `progress.md`. Ask before creating it.

### Step 3 — Check for an existing doc set

If `.claude/projects/<page-name>/` already exists, stop and ask before overwriting anything.

### Step 4 — Scaffold progress.md

Mirror the exact structure of `.claude/projects/software-observability/progress.md` — same section headers, same formatting rules, not a simplified version:

```md
# <Page Name> — Progress

## Session Workflow

1. Read this file [+ `PLAN.md`, if one exists] + `components/built-components.md` + `styles/globals.css` + `.claude/skills/component-builder/SKILL.md` + `.claude/skills/section-builder/SKILL.md`
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

_none yet_

---

## Deferred (Roadmap)

_none yet_

---

## Resume Context

Active mid-build or about-to-build state, keyed by keyword. Multiple sessions may run in parallel — keep one entry per active thread. Remove an entry once its section is complete and folded into `## Built sections`.

_none yet_
```

### Step 5 — Scaffold PLAN.md, only if Step 2 confirmed it's wanted

```md
# <Page Name> — Plan

## Goal

[what this page needs to accomplish, one paragraph]

## Shared resources

This project uses the portfolio's existing design system — see CLAUDE.md's "Project Doc Sets" section. No separate tokens/components are created here; anything new gets added to the shared `components/built-components.md` registry.

## Phases

[fill in as scope becomes clear — don't invent phases speculatively]

## Status

See `.claude/projects/<page-name>/progress.md` for current build state.
```

### Step 6 — Confirm

Report what was created and stop. Do not start building the page itself — that's a separate, explicit ask.
