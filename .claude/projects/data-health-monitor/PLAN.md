# Data Health Monitor — Plan

**Intent:** Destination and spec — the end-state architecture, phase sequencing, and what "done" looks like for this project.

**When to use:** Read to know what phase this project is in and what to build next; consult alongside `progress.md` (current build state).

## Goal

Deliverable is a standalone clickable final-design prototype (not yet tied to a case study route/narrative — placement decided later), built using the existing XOPS design system as it existed in the XOPS platform.

Real-world basis (from the source case study, `/Users/edgarsanchez/Downloads/New - Data Health Monitor (1).md`): a ServiceNow-style CMDB observability layer. Domain = collapsed CMDB Category+Class (Employee/Infrastructure/Worksite/Software); Configuration Item (CI) = one asset/record; Asset Profile Field = attribute. Three pillars: Completeness (% CIs with required fields populated), Quality (% populated fields that are valid), Recency (% CIs synced within 24h). A single CI can carry multiple simultaneous validation failures across categories — Total Failures ≠ Total Affected Records, hence the single-vs-multi-failure split. 5 fixed failure categories: Missing Required Data, Format Violations, Referential Integrity, Business Rule Violations, Duplicate CIs. Domain health status (Healthy/At Risk/Critical) rolls up from the 3 metrics vs. company-configurable thresholds with a warning zone. See `xops` `PLAN.md` item #16 for the CI data-model addition this implies for the shared dataset (not yet started).

## Design system

No separate design system — reuses `design-systems/xops/` (tokens, components) as-is. No fork of `component-builder`.

## Phases

Not yet defined.

## Status

See `.claude/projects/data-health-monitor/progress.md` for current build state.
