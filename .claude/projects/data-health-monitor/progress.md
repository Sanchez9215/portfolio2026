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

- **Screen shell** — `app/work/data-health-monitor/prototype/` (page/layout/`DataHealthScreen.tsx`), `Sidebar` + `GlobalHeader` reused as-is
- **Head + tabs** — `PageHeader` ("Insights") + `FilterTabs` underline variant, new `fullWidth={false}`
- **Data Health Overview header** — title/last-updated row, Overall Status `Tag`, "Learn More" link
- **3 threshold metric cards** — `Stat` + `ProgressBar` (Completeness/Quality/Recency)
- **Health by Domain table** — `Card` + `Table`, `showChevron`, per-cell `ProgressBar`
- **Validation Failures by Category** — 2 `Stat` tiles, `FilterTabs variant="vertical"` category list, nested `Card` (`headerValue`) with 3 `Stat` tiles + domain breakdown `Table` + `BarChart`
- **Certification Status by Domain table** — `Card` + `Table`, `ProgressBar height="8"` with no marker
- All above iterated live against the running dev server this session (colors, spacing, hover states) — not yet given an explicit final sign-off
- **Domain Specific view** (Figma 709:600, `DomainHealthScreen.tsx`, route `/work/data-health-monitor/prototype/domain`) — Infrastructure domain only, reached by clicking the Health by Domain table's Infrastructure row (other domains inert until built)
  - **Certification Status card** — 4 `Stat` tiles (Status/Last Certified/Valid Until/Days Remaining); `Stat` gained a fix to skip its empty value line when `value=""`
  - **Open Remediation Requests** — new `RemediationRequestList.tsx` (single-open accordion), each row expands to `Card` + `Table` (per-department progress); `ProgressBar` gained `status="info"` (brand-primary/border-divider, non-threshold)
  - **Validation Failures detail table** — domain-specific totals, functional attribute search, sortable columns; Serial Number's Affected/Single/Multi-Failure values and the "Request Remediation" button now open the Remediation Request view (other 7 attributes' values stay inert, no destination yet)
- **Remediation Request view** (Figma 739:1607, `RemediationRequestPanel.tsx`, opens in-place over Domain Specific — no new route) — reached via "Request Remediation" (unfiltered) or Serial Number's Affected/Single/Multi-Failure values (pre-filtered to that subset); top bar (Cancel/Selected/Projected Healthy Records/Request stub), 4 summary `Stat` tiles, search + "Show Only Single-Issue Records" `Toggle` (reused segmented Toggle, not a new binary switch), 8-attribute checkbox accordion (only Serial Number expandable with real entity data — 4 audited rows, "Other Failures" sub-list is page-local synthetic-row markup, not a `Table` capability), other 7 attributes collapsed/inert matching the Validation Failures category pattern. Projected Healthy Records pill uses `MagicSurface` at `scale={0.3}` (same blob treatment as Software Profile's Opportunity card, no new color tokens)

## Deferred (Roadmap)

- **Tab transition animation** — smooth animation on `FilterTabs` underline-variant tab switch (Insights row: Requests/Employees/Workspace/Worksite/Infrastructure/Software/Data Health). Deferred until the rest of the screen is built.
- **Company-configurable thresholds** — every threshold value (85%, 90%, etc. driving `ThresholdBar`/`Stat` status + delta copy) is currently hardcoded per row. Real data wiring must let each company configure its own thresholds, not ship fixed constants — same category as Software Observability's `config` source table for org taxonomy.
- **4 of 5 failure categories have no audited detail data** — "Validation Failures by Category"'s category list shows real totals for all 5 (Missing Required Data/Business Rule Violation/Format Violations/Duplicate CIs/Referential Integrity), but only Missing Required Data has an audited domain breakdown + bar data. Selecting another category in the list doesn't yet change the detail panel. Needs the other 4 categories' Figma nodes audited before they can go live — applies to both the Overview and Domain Specific views.
- **`ProgressBar`'s `status="info"` needs a cleaner pass** — added quickly for Open Remediation Requests' non-threshold bars; revisit alongside a broader status/variant model.
- **`ProgressBar`'s `.bar` is now capped at `max-width: 152px`** (no `min-width`, since removed this session) — still overshoots Figma's 111px bars in Open Remediation Requests/its nested department table; accepted deviation, not fought.
- **Domain Specific view — only Infrastructure built**; Employee/Worksite/Software domains need their own Figma nodes audited (Health by Domain table rows for them stay inert until then).
- **`#INF-9911`/`#INF-9910` remediation requests have no audited department breakdown** — their nested tables render empty if expanded.
- **`BarChart`'s `.track` background still uses `--xops-border-divider`** — same mistokenization `ProgressBar`'s track had (a border/divider token reused as a surface fill); fixed on `ProgressBar` via the new `--xops-surface-track` semantic token, `BarChart` left alone for now. Swap it to `surface-track` too when touched next — no visual change, just correct tokenization.
- **Overview screen mixes flex `gap` with compensating `marginTop` calc offsets** for one-off spacing between rows in a uniform-gap column (`DataHealthScreen.tsx`) — works but fragile (each offset hardcodes the parent gap it's compensating for) and not the cleanest approach; revisit as a refactor into split sub-groups with their own direct `gap`, no margin math.
- **Remediation Request view's entity data is a 4-row sample, not the full 850** — "Showing X of 850 Records" reflects the real (small) sample size, not Figma's static "200 of 850" mock; no real pagination wired since there's no real dataset yet.
- **Remediation Request view's other 7 attributes have no audited entity data** — same deferred shape as Validation Failures' other 4 categories; checkboxes work, expansion doesn't.

## Resume Context

Data Health Overview (node 684:1584, 4 sections), the Domain Specific view (node 709:600, Infrastructure only, 3 sections), and the Remediation Request view (node 739:1607) are all built — see Built list above. Real-world domain model captured in `PLAN.md`'s Goal section; synthetic data/generator work still not started (see `xops` `PLAN.md` item #16).

**This session was a heavy, still-unfinished visual-adjustment pass on the Overview screen (`DataHealthScreen.tsx`)** — no sign-off yet, don't treat any of it as Built. Covered so far: the top 3 metric cards and Health by Domain's per-cell metric values now compute their status live from admin target/warning bands (a real per-domain-per-metric target+warning pair, not the old flat `metricStatus()` `+10` band) with domain-level `Tag` status derived as worst-of its 3 metrics, rather than hand-authored; `ProgressBar` bars were removed from both the top cards and the table in favor of plain numbers + `Tooltip` legends; Health by Domain's column widths/alignment went through several rounds (flex vs. auto, right-aligned numbers) and currently sit on `flex` for Domain/Completeness/Quality/Recency, `auto` for Status; a new "All values reflect your organization's configured thresholds. Learn More" row sits right-aligned below the 3 top cards. Several shared `design-systems/xops/` components/tokens changed along the way (see `built-components.md` for the authoritative list: `Card`, `Table`, `ProgressBar`, `Stat`, `Tooltip`, `Button`, plus the new `MetaText` component) — none of those are reviewed either.

**Next session: Health by Domain card finalization** — pick up directly from current dev-server state at `/work/data-health-monitor/prototype`.
