# Data Health Monitor — WEB VERSION (scannable, HM-facing)

**Convention:** plain = your existing copy · **bold = Claude-written** · `🔍 NEEDS YOU` = memory required · `[component]` = structural weight · `🎨 VISUAL` = storytelling idea.
Structural rules applied from the audit: shipped-vs-designed declared up front · glossary folded into the translation table · the Logic Flaw elevated to centerpiece · certification told in 2 beats not 5 · duplicated blocks removed · the ending reframed as the layering thesis paying off.

---

## 1. Intro `[SectionIntroduction]`
Title: Data Health Monitor. **Summary (replaces the `{Summary}` placeholder): "A continuous data-health and certification monitoring system for enterprise CMDB data — designed in three independent layers, with the observability foundation shipped to Fortune 500 production."**
Meta: Company XOPS · Role Lead Product Designer · **Team __ · Year __** (🔍 NEEDS YOU: fill both — every other study has them. Jog: who was the PM? which year/quarters?)

Impact blocks — **rebuilt with clean attribution (the current blurbs are garbled and claim the future vision as delivered):**
1. **Platform Expansion (0→1):** Shipped system-level data health observability at Fortune 500 scale, establishing the foundation for XOPS's expansion into Data Governance Intelligence.
2. **Data Health at Enterprise Scale:** **Unified 17 data sources into a monitored source of truth for Broadcom** — configuration managers pinpoint what's broken by domain and prioritize remediation.
3. **Enterprise-Wide Accuracy:** **[Pharma customer] achieved enterprise-wide data accuracy across 3,000–5,000 seasonal workers, enabling seamless device provisioning and global onboarding.**
> 🔍 NEEDS YOU: Verify attribution on #2 and #3 — are these outcomes of the Data Health Monitor specifically, or the platform's integration layer generally? If the pharma story predates/parallels this work, replace it with a DHM-specific outcome. **Do not claim "self-healing" anywhere in impact — the study defines it as the future vision.**

🎨 VISUAL — hero: the Health by Domain table (the final design), or a short recording of sorting worst-first.

## 2. The Brief `[LabelBlock display + Blocks]`
Keep your copy nearly whole — it's the best opening of your studies: Systems of intelligence and autonomous workflows depend on one thing. Trusted, Clean, Data. … CMDB definition … we consistently inherited CMDBs that were fragmented, manually maintained, rarely audited … Enterprise CMDBs have been broken for decades … XOPS saw a clear business opportunity. I led design for the Data Health Monitor — reactive data cleanup into a persistent monitoring layer.
**Append the scope-setting sentence (this defuses the ending):** **"Phase 1's observability layer shipped to production; this study covers the full three-layer system I designed — including the investigation and action layers validated and handed off before a company pivot."**

## 3. Translating the CMDB Framework `[display + Cards]` — *absorbs the two standalone glossary sections*
**Cut "Closing the Knowledge Gap" to one line inside this intro:** I knew CMDB as a concept; beyond that I started from zero — **the same ramp-up discipline as Software Observability, so I'll spare the retelling.** For most Fortune 500s the CMDB lives in ServiceNow — the primary integration source.
Then the mapping cards, each teaching the CMDB term *at the moment of use* (definition folded into the cell):
- **Category + Class → Domain:** CMDBs silo assets under taxonomy like Hardware or People (Category) with subdivisions (Class). A literal 1:1 mapping would have broken the platform logic XOPS was built around — I collapsed both into a single Domain layer so data health mapped to the lifecycles XOPS already managed.
- Type → Asset Type: direct mapping (keep your copy).
- CI → Asset Profile: a CI is a record; an Asset Profile is a living operational view. Same underlying data, richer surface. (keep)
- Attribute → Profile Field: keep — including the offboarding-workflow failure example (it's the best line in the table).
- Relationships → Ownership & Entitlements: keep, including the honest Phase-1 descope of technical dependencies.

🎨 VISUAL — **side-by-side mapping diagram: CMDB hierarchy column ↔ XOPS framework column with connecting lines; the Category+Class→Domain merge drawn as two lines converging into one. This is the study's systems-thinking money shot — a FigJam-style diagram, not cards, if you can.**

## 4. The Problem `[display]`
**Split the 49-word question into two lines:**
Body: How do we give enterprise IT teams continuous, quantifiable visibility into the health of their CMDB data and compliance readiness —
Support: surfaced through the lifecycle structure they already operate in, so they can prioritize remediation where it matters most?

## 5. Research → Goals `[display + InsightGoalRow-style pairs + vision Card]`
Keep insights and goals as written (they pair cleanly). Keep the Autonomous Data Governance vision card, **explicitly labeled: "The North Star (beyond Phase 1)"** — Self-Healing Data: monitoring and certification operating autonomously, remediation triggered when quality falls, recertification on success.
> 🔍 NEEDS YOU: "Completeness, Quality, and Recency *emerged* through validation sessions" — passive. Did you propose the three pillars and SMEs confirmed? Say which. Jog: who first drew the three-way split — you at a whiteboard, or the Director of Product?

## 6. A Layered Approach `[display]` — **ELEVATE**
Keep your copy whole (natural breakpoints, value without blocking dependencies, "the team can always deliver something meaningful, regardless of what changes"). Observability → Investigation → Action, Layer 1 read-only through Layer 3 operational.
🎨 VISUAL — **three-layer architecture diagram: stacked horizontal bands (Observability / Investigation / Action) with a "shippable independently" cut-line between each. Add a small "shipped" badge on Layer 1 — foreshadowing the ending honestly.**

## 7. Kicking Off Design `[display + 3 constraint Cards]`
Keep: AI parallel prototypes → stakeholder sessions → three constraints. **Compress the method sentence to a reference: "Using the same parallel-prototyping approach as Software Observability…"** Keep all three constraint cards — especially the 80/20 source-comparison descope ("80% of the functional value with significantly less technical overhead").

## 8. The 3 Pillars of Data Health `[display + Cards ×3 + trust Card]`
Keep: Completeness / Quality / Recency — Do we have it? Is it correct? Is it still relevant? Keep Calculation Transparency **once** (delete the duplicate block).
🎨 VISUAL — **triptych diagram: three columns, each with its question, its formula (the actual calculation — you have them), and its failure mode. Showing the formulas IS the calculation-transparency principle, practiced on your own case study.**

## 9. Secondary Optimization Targets `[Cards ×3]`
Keep (Shadow IT / Stale Records / Redundant Data), one line shorter each — the framing sentence ("categorized as secondary to maintain project velocity") carries the judgment.

## 10. Whose Standard Counts? `[display + Cards]` — *retitled from "Standardizing of Excellence" (grammar) — merges threshold logic + framework + warning zones*
Keep the substance: excellence differs per organization → configurable thresholds → system-level (executive baseline) vs domain-level (tight for high-velocity Employee data, flexible for manually-updated Worksite data) → three states (Passing / Near Threshold / Failing) → warning zones: **thresholds define failure; warning zones prevent it.** (That line is yours and it's the section's headline — promote it to the display support.)
🎨 VISUAL — **threshold-band diagram: one horizontal metric bar with colored zones (passing / warning / failing) and a marker showing "runway to act." One diagram replaces three sections of prose.**

## 11. Designing for Density & Scale `[display + before/after]`
Keep: tiles → rows, with the named failure reasons (memory tax, 4-domain cap, calculation gap) and the row-based fix (single-axis scanning, threshold bars).
🎨 VISUAL — **before/after: tile layout vs row layout with the same 10 domains — the tile version visibly overflowing. The scale argument in one image.**

## 12. Health by Domain — Final `[display + SectionImg]`
Keep all four cards (Familiarity / worst-first Prioritization / threshold-relative Key Metrics / Drill Down).

## 13. Health Status Logic `[Cards ×3]`
Keep Healthy / At Risk / Critical; trim bodies (they restate §10).

## 14. Defining a Failure Analysis Model `[display + 4 exploration Cards]`
Keep all four explorations *with their failure reasons* — weighted attributes (directionally sound, config-engine cost), criticality filtering (no domain context), domain aggregation (incomplete picture), color-coded pills (broke at scale — pill overload, prioritization signal lost). **Frame line: "Built while I was still learning the domain, these explorations existed to be shot at."**

## 15. **The Fundamental Logic Flaw** `[display — CENTERPIECE]`
Keep your copy essentially whole; it's the strongest writing in the study: All four explorations shared the same critical flaw — they assumed a clean relationship between failures and records… a single record can contain multiple simultaneous failures… counting the same record multiple times would inflate the workload and distort remediation priorities.
**Name the discovery: "A discussion with engineering over the donut chart's data requirements surfaced the constraint — and falsified every model in the room."**
> 🔍 NEEDS YOU: that engineering conversation's specifics — who, what schema fact broke it. Jog: what did the failures table actually look like — one row per failure with repeated CI ids?
Then the payoff, kept: single- vs multi-failure records — low-hanging fruit — **"a prioritization layer that hadn't been part of the original model at all. The correction produced a better product than the plan did."**
🎨 VISUAL — **the flaw as a diagram: left = the assumed model (1 failure → 1 record, neat bars); right = reality (one CI holding 3 failure types, another holding duplicates) — a simple entity diagram or Venn. Then the new model's two counters: Total Failures vs Affected Records. This is the #1 visual investment of the study.**

## 16. Validation Failures by Category `[SectionImg + 6 cards]`
Keep all six cards (Total Failures / Affected Records / modular side panel / Breakdown by Domain / Affected Records per category / Single vs Multi) — each earns its place.

## 17. Certification, Unified `[display + gap Cards + final SectionImg]` — *5 headers → 2 beats*
Beat 1 — the gaps (keep the three-gap analysis whole: No Remediation Visibility / Redundant Health Data Points / Abstract Time Without Urgency — it's insight-driven).
Beat 2 — **Actionable Governance** (keep title + final-design cards: status logic, last-certified anchor, Days Remaining countdown bar, open remediation requests, contextual transparency, row-level entry points). **Delete: the standalone early "Data Certification" definition (folded into Beat 1's intro line), the duplicate Certification Status block, and the exploration section's garbled delta-indicator sentence.**
🎨 VISUAL — the Days-Remaining countdown bar deserves a close-up crop; it's the "abstract time → urgency" gap answered visibly.

## 18. Domain-Focused Views `[display, compressed]`
One beat: the domain view inherits the system-level structure — same status logic, same pillars, same certification context. **Component reuse wasn't just implementation velocity; it kept the user's mental model intact from system to lifecycle to attribute.** Then Attribute-Level Failure Analysis cards (keep: remediation prioritization / % of Category impact / complexity-based strategies).

## 19. From Analysis to Action `[display]` — *merged with Requesting Remediation*
Keep: bulk selection bridging identification → resolution; ServiceNow bidirectional workflow as the Phase-1 priority ("the tool our customers already lived in"). **Status flag (one line): "This layer was designed and SME-validated for handoff — shipped scope is covered in Impact."**

## 20. The Workspace Decisions `[display + SectionImg run]` — *your best interaction-design sequence — keep nearly all of it*
Keep: Foundational Requirements (4 cards) → **Identifying Operational Puzzle Pieces** (audited the platform for reusable patterns — checkbox bulk-selection from tables, repurposed dashboard metric cards) → Split View vs Nested Table (borrowed from Control Center / Orders views) → modal killed (**keep "cramped workspace" once**) → full-page rationale (**keep "breathing space" once — it currently appears three times**) → split-view killed ("stole critical space from record-level data" — the concrete kill reason, keep verbatim) → final iterations with the six annotation cards → **Outcome-Based Forecasting, promoted to its own display beat:** the Projected Healthy Records metric shifted conversations from technical fixes to business outcomes — a forecast of the recovery impact of a specific remediation batch.
🎨 VISUAL — **decision-tree diagram for the layout exploration: Modal(Nested/Split) ✗ → Full Page(Split ✗ / Nested ✓), with one-line kill reasons on the ✗ branches. Interviewers love seeing the paths not taken as a map.**
> 🔍 NEEDS YOU: did anyone use the Projected Healthy Records forecast to make a real call? One example = influence, not feature.

## 21. Progress Tracking + Implementation Realities `[Cards]`
Keep both. Batch ID as the XOPS↔ServiceNow correlation key — > 🔍 NEEDS YOU: did you define the Batch ID concept, or engineering? If you: say so — it's a data-model contribution. Keep all three open questions (Blocked Progress / Sync Latency / Ownership Disputes) — **framed as: "the questions I logged for implementation — the ones you can't answer until you're touching real data."**

## 22. Product & Business Impact `[display + Cards]` — **REBUILT ENDING**
**Lead with the layering thesis paying off, not the pivot confession:**
**"The company pivoted before Layers 2 and 3 were implemented — and the layered architecture is why that didn't matter: Layer 1 stood alone, shipped, and became the foundation for XOPS's Data Governance Intelligence."** The launch of the System-Level Data Health Overview served as that foundation. Then the three rebuilt impact cards from §1 (do not repeat verbatim — the intro carries the stats; here carry the mechanisms: **17 sources unified *into which views*; what configuration managers do differently now**).
> 🔍 NEEDS YOU: the 17-sources mechanism (unified how, surfaced where in your designs) · the ServiceNow integration's fate (did the bidirectional workflow ever go live?) · any post-pivot afterlife of Layers 2–3 designs.

## 23. **Reflection** `[Cards ×3]` — **NEW (the study has none)**
**Drafts to react to — rewrite in your voice:**
1. **"Breakpoints are insurance."** The layered architecture was designed for shifting deadlines — it ended up surviving a company pivot. Scope architecture is risk architecture.
2. **"Wrong models teach faster than no models."** Four explorations died to one engineering conversation — and the correction produced a prioritization layer no one had planned.
3. **"Governance is a design surface."** Thresholds, warning zones, certification cycles — trust isn't a byproduct of good data; it's a system you design deliberately.

---

### Visual storytelling summary (build priority order)
1. **Logic-flaw model diagram (§15)** — the study's centerpiece argument
2. **CMDB→XOPS mapping diagram (§3)** — the systems money shot
3. **Three-layer architecture with "shipped" badge (§6)** — carries the honest ending
4. **Threshold-band diagram (§10)**
5. **Tiles-vs-rows before/after (§11)**
6. **Layout decision tree (§20)**
7. **Pillars triptych with real formulas (§8)**
