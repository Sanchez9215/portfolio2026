---
name: new-portfolio-page
description: Adds a new page's section (progress.md, optionally a PLAN.md section) to the shared portfolio doc set — a case study, About, Resume, or a Home page addition. Uses the shared design-system/tokens.json, styles/globals.css, and components/ registry. Triggers on explicit /new-portfolio-page invocation.
---

# New Portfolio Page

Adds space for a new page inside the shared `.claude/projects/portfolio/` doc set — as opposed to `/new-nonportfolio`, which scaffolds a whole separate doc set for a project needing its own design system.

The whole portfolio site (every case study, plus Home/Nav/Footer/About) shares one doc set. This skill does not create a new directory — it adds a new top-level section to the existing `progress.md` (and optionally `PLAN.md`), for the new page only.

---

## What's shared vs. unique

**Shared across every portfolio-page project — never duplicated per project:**
- `design-system/tokens.json`, `styles/globals.css`
- `components/built-components.md`, `components/components.md`
- `component-builder` skill, `section-builder` skill

**Unique per page — a new section added by this skill:**
- A new `## <Page Name>` section in `.claude/projects/portfolio/progress.md` (always)
- A new `## <Page Name>` section in `.claude/projects/portfolio/PLAN.md` (only if asked for — see Step 2)

No `DECISIONS.md` section here — that's reserved for `/new-nonportfolio` projects.

---

## Steps

### Step 1 — Get the page name

Ask if not already given: page name (e.g. `About`, `Resume`, `Home Refresh`).

### Step 2 — Ask whether this page needs a PLAN.md section

Not every page needs one — a small page may only need a `progress.md` section. Ask before creating it.

### Step 3 — Check for an existing section

If a `## <Page Name>` section already exists in `.claude/projects/portfolio/progress.md`, stop and ask before overwriting anything.

### Step 4 — Append a progress.md section

Append at the true end of the file (never mid-structure), matching the format already used by the file's other page sections (see the `Home / Nav / Footer / About` section for the pattern):

```md
## <Page Name>

### Built sections (in page order)

Format: plain numbered list, `` `section.name` `` only — no inline structure/annotation notes. Anything worth recording about a section belongs in Deferred (future work) or Resume Context (active mid-build state) instead — never appended to the list entry, since the actual structure is always in the code.

_none yet_

### Deferred (Roadmap)

_none yet_

### Resume Context

_none yet_
```

### Step 5 — Append a PLAN.md section, only if Step 2 confirmed it's wanted

```md
## <Page Name>

**Goal:** [what this page needs to accomplish, one paragraph]

**Shared resources:** this page uses the portfolio's existing design system — see CLAUDE.md's "Project Doc Sets" section. No separate tokens/components are created here; anything new gets added to the shared `components/built-components.md` registry.

**Phases:** [fill in as scope becomes clear — don't invent phases speculatively]

**Status:** see `.claude/projects/portfolio/progress.md`'s `<Page Name>` section for current build state.
```

### Step 6 — Confirm

Report what was added and stop. Do not start building the page itself — that's a separate, explicit ask.
