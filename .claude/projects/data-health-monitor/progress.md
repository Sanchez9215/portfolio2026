# Data Health Monitor — Build State

**Intent:** Status board only — what's built, what's not, what's next.

**Format rule (hard limit):** every entry in this file is `**short title** — one line`. Never a second sentence. If an entry needs more, the "more" belongs in `PLAN.md` (spec/phases) — or gets cut. This is a scan list, not a narrative.

**When to use:** read at the start of any Data Health Monitor session alongside `PLAN.md` (spec/phases). No separate design system — this project reuses `design-systems/xops/` (tokens + components) as-is; update this file at the end of any session that changes build state.

## Session Workflow

1. Read this file + `.claude/guidelines.md` + `PLAN.md` + `design-systems/xops/components/built-components.md` + `design-systems/xops/tokens.css`.
2. Cross-check every named component/screen against `design-systems/xops/components/built-components.md` before reusing or extending — flag any gap rather than inventing a new xops component here.
3. This project has no design system of its own — no token/component fork. New xops tokens or components needed for Data Health Monitor go through the existing `design-systems/xops/` scaffolding, not a project-local one.
4. Documentation (this file, `PLAN.md`) is batched once at session end, not after each step.
5. Entries written here obey the format rule above — title + one line, no exceptions.

---

## Built

Nothing yet.

## Deferred (Roadmap)

- **Tab transition animation** — smooth animation on `FilterTabs` underline-variant tab switch (Insights row: Requests/Employees/Workspace/Worksite/Infrastructure/Software/Data Health). Deferred until the rest of the screen is built.
- **Company-configurable thresholds** — every threshold value (85%, 90%, etc. driving `ThresholdBar`/`Stat` status + delta copy) is currently hardcoded per row. Real data wiring must let each company configure its own thresholds, not ship fixed constants — same category as Software Observability's `config` source table for org taxonomy.
- **4 of 5 failure categories have no audited detail data** — "Validation Failures by Category"'s category list shows real totals for all 5 (Missing Required Data/Business Rule Violation/Format Violations/Duplicate Records/Referential Integrity), but only Missing Required Data has an audited domain breakdown + bar data. Selecting another category in the list doesn't yet change the detail panel. Needs the other 4 categories' Figma nodes audited before they can go live.

## Resume Context

Project just scaffolded (2026-08-20). Deliverable: a standalone clickable final-design prototype for a Data Health Monitor case study (case study narrative/placement TBD). Reuses `design-systems/xops/` as it existed for the XOPS platform — no new design system. Next session: define goal/scope and phases in `PLAN.md`.
