---
name: new-nonportfolio
description: Scaffolds a doc set for a project that isn't a portfolio page — asks whether it needs its own separate design system (isolated from the portfolio's), and asks before creating PLAN.md or DECISIONS.md. progress.md is always created. Triggers on explicit /new-nonportfolio invocation.
---

# New Non-Portfolio Project

For a project that isn't a page in the main portfolio site (that's `/new-portfolio-page`). Nothing here is assumed except `progress.md` — ask before creating anything else.

The doc set (`PLAN.md`/`progress.md`/`DECISIONS.md`) always scaffolds under `.claude/projects/<name>/` — the same location portfolio-page projects use. Only the design-system scaffolding (Step 9), if wanted, goes under `design-systems/<name>/`. See CLAUDE.md's "Project Doc Sets" section.

---

## Steps

### Step 1 — Get the project name

Ask if not already given: project slug, kebab-case (e.g. `xops`).

### Step 2 — Ask whether this project needs its own separate design system

Isolated tokens/components, like `design-systems/xops/` — because it needs to look like someone else's product, not the portfolio's brand. If no, skip all tokens/components scaffolding (Step 9).

### Step 3 — Ask whether PLAN.md is wanted

Not automatic. Ask before creating.

### Step 4 — Ask whether DECISIONS.md is wanted

Not automatic. Ask before creating. If yes, mention up front that it only records the user's decisions and direction — never the agent's execution process (see `.claude/projects/xops/DECISIONS.md`'s format section for the rule and example).

### Step 5 — Check for an existing doc set

If `.claude/projects/<name>/` already exists, stop and ask before overwriting anything.

### Step 6 — Scaffold progress.md (always)

`.claude/projects/<name>/progress.md`. Mirror `.claude/projects/xops/progress.md`: a `# <Name> — Build State` header, a Session Workflow section, `## Built` (grouped by phase if there's a design system, otherwise a flat list), `## Deferred (Roadmap)`, `## Resume Context`. If Step 2's answer is no, drop the tokens/component-builder references from the Session Workflow — read PLAN.md (if it exists) and whatever the project's real reference files are instead.

### Step 7 — Scaffold PLAN.md, only if Step 3 confirmed it

Mirror `.claude/projects/xops/PLAN.md`'s shape: Goal, (if there's a design system) Why a separate system + File placement + Skill reuse table, Phases, Status. Drop the design-system-specific sections entirely if Step 2 was no.

### Step 8 — Scaffold DECISIONS.md, only if Step 4 confirmed it

Copy `.claude/projects/xops/DECISIONS.md`'s format section and logging-workflow rules verbatim (numbered spine, spokes, lettered sub-decisions, user-POV-only rule), replacing the intro line to name this project.

### Step 9 — If Step 2 was yes, offer (don't create) the design-system scaffolding

Under `design-systems/<name>/` — code and tokens only, not docs (the doc set already lives in `.claude/projects/<name>/` from Steps 6–8). Tokens (`tokens.json`/`tokens.css`) get created later, once foundations are actually audited — not stubbed empty. Same for a `<name>-component-builder` fork (repoints `.claude/skills/component-builder/SKILL.md`'s portfolio-specific paths to this project's own; rules carry over unchanged) — offer it, don't fork until asked.

### Step 10 — Confirm

Report what was created and stop. Do not start auditing foundations or building anything — those are separate, explicit asks.
