# Data Health Monitor — Full Case Study Audit

Same reviewer stance as `review-1-full-audit.md`: hiring manager screening for Senior Product Designer, technical, product-led B2B SaaS, judging one impression — **end-to-end owner + systems thinker who metabolizes complexity, prototypes to think, and drives teams through ambiguity.**

Read basis: the full Data Health Monitor markdown (source is pre-build, so structural weights below are prescriptions for the component vocabulary — what deserves `display`, what belongs in Cards/Blocks — when it's built like Software Observability).

---

## TL;DR — the 5 highest-leverage changes

1. **The pivot confession is buried in the last section and detonates everything before it.** A HM reads ~40 sections of remediation workflow, progress tracking, and ServiceNow integration design, then hits: *"we pivoted to other projects before the end-to-end… experience was fully implemented."* Everything they just read gets retroactively reclassified from "shipped product" to "unshipped design work" — and they feel misled, which is worse than the fact itself. Fix by declaring scope honestly up front: Layer 1 (system-level health overview) shipped; Layers 2–3 were designed, validated, and handed off before the pivot. Framed that way, the layered architecture becomes the hero — *the layer-1 breakpoint you designed is exactly why the pivot still left shipped value behind.* That's your own "A Layered Approach" thesis proving itself, and the study never claims the credit.

2. **The impact section over-claims what the ending admits — and buries real numbers inside garbled copy.** "Self-healing source of truth" for Broadcom is claimed as impact, but the study itself defines Self-Healing Data as the *future vision* beyond Phase 1. The pharma outcome (3,000–5,000 seasonal workers, device provisioning) reads like a platform-onboarding win, not a Data Health Monitor win. Meanwhile the two verifiable numbers you actually have — 17 unified data sources, enterprise-wide accuracy for a Fortune 500 — are trapped in blurbs that don't parse. Rewrite all three with clean attribution: what THIS capability did, for whom, with the number first.

3. **Your best story is filed as a mid-story detail: "The Fundamental Logic Flaw."** Four explorations built, then a discovery via engineering that all four shared a wrong assumption (failures ≠ records; one record can carry many failures), the model rebuilt, and a prioritization layer (single- vs multi-failure records) that *"hadn't been part of the original model at all"* emerging from the correction. That is the interview story: intellectual honesty + systems modeling + a better product falling out of a mistake. It deserves headline-arc treatment (its own display beat, before/after model), not a paragraph between chart explorations.

4. **Three consecutive glossary sections before any problem, user, or stake.** CMDB Framework → Data Certification → Translating the Framework. The translation table is the systems-thinking payload (Category+Class collapsed into Domain *because a 1:1 mapping would have broken platform logic* — that clause is the senior signal); the two pure-definition sections ahead of it are a textbook. Compress the definitions into the translation table's own cells and get to "The Problem" roughly 40% sooner.

5. **Ship the hygiene before anyone reads it.** `{Summary}` placeholder in the opener, Team/Year values missing, two `{IMG}` placeholders, "Certification Status" and "Calculation Transparency" blocks duplicated verbatim (each appears both inside a table and as its own section), the top impact blurbs repeated verbatim at the bottom, and five separate headers for one certification beat. Individually trivial; together they read as a draft — fatal for a candidate whose pitch includes "raises the craft bar."

---

## Structural hierarchy audit

Verdicts assume the Software Observability component vocabulary: display = headline beat, Cards = discrete decisions, Block = support.

| # | Section | Should be | Verdict | Why |
|---|---------|-----------|---------|-----|
| 1 | Title + {Summary} + meta | Intro | **Fix holes** | Placeholder summary, missing Team/Year. Dead on arrival at skim speed. |
| 2 | Impact (3 blurbs) | Intro impact | **Rewrite** | See TL;DR #2 — garbled, over-attributed, numbers buried. |
| 3 | Overview (XOPS) | Block | **Keep, trim** | Same boilerplate as the Software Observability study — one sentence shorter. |
| 4 | The Brief | display + Blocks | **Keep — strong** | "Trusted, Clean, Data" is a real stakes-setter; "CMDBs have been broken for decades" frames market-level opportunity; "I led design" plants ownership early. Best opening of your two studies. |
| 5 | Closing the Knowledge Gap | Block | **Demote + dedupe across portfolio** | Nearly the same "started from 0" beat as Software Observability's Research section, told with less charm (no 0% device). One-liner here. |
| 6 | Understanding the CMDB Framework | Cards | **Compress into #8** | Pure glossary. Category/Class/Type/CI definitions can live inside the translation table cells. |
| 7 | Data Certification (definition) | Block | **Compress into #8 or #27** | Second consecutive textbook section; also collides with the *other* "Data Certification" header (#27) in the skim layer. |
| 8 | Translating the CMDB Framework to XOPS | display + Cards | **Elevate — this is the systems beat** | "A literal 1:1 mapping would have broken the platform logic" + collapsing Category/Class into Domain is judgment, not translation. Also contains an honest descope (CI dependencies). Make the two glossary sections feed this instead of preceding it. |
| 9 | Certification Status | — | **Delete one copy** | Appears verbatim twice (table cell + standalone section). |
| 10 | The Problem | display | **Keep, split the sentence** | Right beat, but it's one 49-word how-might-we. Two sentences: the visibility gap, then the stakes. |
| 11 | The Research (3 insights) | display + Cards | **Keep** | Insight 3 ("visibility without a path to action was worthless") is the study's spine — it predicts the three-layer architecture. Consider naming the experts' relevance like Software Observability's "The Experts" block does. |
| 12 | Goals + Autonomous Governance vision | display + Cards | **Keep; flag the vision** | Goals mirror insights cleanly. The Self-Healing vision card is good North-Star framing — but it's also what impact blurb #1 later claims as delivered. One of them has to change (see TL;DR #2). |
| 13 | A Layered Approach | display | **Elevate hard** | "Where are the natural breakpoints… deliver value without blocking dependencies" is the most senior paragraph in the study — and it's the exact argument that later redeems the pivot. Currently it never gets its payoff sentence. Connect it to the ending explicitly. |
| 14 | Kicking Off Design (AI prototypes, 3 constraints) | display + Cards | **Keep** | The three constraint cards are real decisions ("80% of the functional value with significantly less technical overhead" is the kind of line HMs quote). Note: parallel AI prototyping is explained in full for the second time across the portfolio — reference the method, don't re-teach it. |
| 15 | The 3 Pillars | display + Cards | **Keep — strong** | Completeness/Quality/Recency with "Do we have it? Is it correct? Is it still relevant?" is crisp framework design. The best skim-layer moment in the middle of the study. |
| 16 | Calculation Transparency | Card | **Delete one copy, keep the idea** | Duplicated verbatim; also the same trust beat as Software Observability's Tooltips. Keep it — governance/trust is on-target — but once, and in your own fresh words. |
| 17 | Secondary Optimization Targets | Cards | **Keep, one line shorter each** | Shadow IT / Stale / Redundant shows domain breadth and velocity discipline ("categorized as secondary to maintain project velocity"). |
| 18–19 | Standardizing of Excellence + Multi-Layered Thresholds | display + Cards | **Keep, retitle** | Configurable thresholds + system-vs-domain logic ("tight standards for high-velocity Employee data, flexible for Worksite data") is genuine governance design. "Standardizing of Excellence" is broken English on a headline — "Whose standard counts?" or "Configurable Standards" territory. |
| 20 | Threshold Framework + Warning Zones | Cards | **Keep** | Three-state logic + early-warning runway = designing for proactive operations. Good. |
| 21 | Designing for Density & Scale | display + Cards | **Keep** | Tiles→rows with named failure reasons (memory tax, 4-domain cap, calculation gap) is honest self-critique with scale rationale. |
| 22 | Health By Domain Final Design | display + Img + Cards | **Keep** | Worst-first default sort is the standout card. |
| 23 | Health Status Logic | Cards | **Keep, trim** | Healthy/At Risk/Critical — necessary, but the bodies restate the threshold section's ideas. |
| 24 | Defining a Failure Analysis Model (4 explorations) | display + Cards | **Keep — rigor on display** | Four explorations *with the reasons each failed* is the assumption→finding muscle from your other study in a new form. |
| 25 | Expanding the Failure Landscape | Block + Img | **Merge into #26** | Exists to introduce the donut chart that revealed the constraint — it's the setup, not a beat. |
| 26 | **The Fundamental Logic Flaw** | **display — headline arc** | **Elevate to centerpiece** | See TL;DR #3. Also the study's only explicit engineering collaboration ("discussions with engineering revealed a fundamental constraint") — name that conversation, it's your technical-credibility evidence. |
| 27 | Validation Failures by Category (new model, 6 cards) | display + Cards | **Keep** | Total failures vs affected records + single/multi split — the payoff of #26. The six cards are dense but each earns its place. |
| 28–32 | Data Certification layer: intro + explorations + By Domain + Unifying gaps + Actionable Governance | ONE display beat + Cards | **Merge 5 headers → 2** | One beat ("certification joined health in one view") told across five headers. The three-gaps section (no remediation visibility / redundant data / abstract time) is the keeper — it's insight-driven. "Actionable Governance" holds the final design and stays. |
| 33–34 | Closing the Loop + Domain Focused Views | Block + display | **Keep, compress** | Component reuse for "implementation velocity" is a quiet technical signal worth one clear sentence, not two sections. |
| 35 | Attribute Level Failure Analysis | display + Cards | **Keep** | Impact-driven prioritization + complexity-based remediation strategies — systems thinking at the leaf level. |
| 36–37 | From Analysis to Action + Requesting Remediation | display | **Merge, add shipped-status flag** | This is where the reader still believes everything shipped. One clause here ("designed to handoff; see Impact for shipped scope") prevents the ending ambush. |
| 38–41 | Foundational Requirements + Puzzle Pieces + Layout Patterns + Modal→Full Page | display + Cards | **Keep — best interaction-design run in the portfolio** | Auditing existing platform patterns, borrowing from Control Center and Orders views, testing modal and killing it with reasons, split-view killed with reasons ("stole critical space") — this run does what Software Observability's drag-and-drop sections only gesture at. Protect it; trim only the "breathing space" triplicate (×3 in two sections). |
| 42 | Remediation Request Final Iterations | display + Img + Cards | **Keep** | Honestly labeled "set for further SME validation" — good. |
| 43 | Outcome-Based Forecasting | display | **Elevate** | Projected Healthy Records — converting a remediation batch into a forecast of business outcome — is a one-section proof of "translates design into business terms." Currently three sentences with no image callout. |
| 44 | Progress Tracking Iterations | Cards | **Keep** | Batch ID as the XOPS↔ServiceNow correlation key is a real data-model contribution — say who defined it (you?). |
| 45 | Implementation Realities | display + Cards | **Keep — do not cut** | Blocked progress / sync latency / ownership disputes as open questions is exactly the maturity HMs probe for. Its only problem is that it currently reads as foreshadowing for the pivot confession. Decoupled from that (per TL;DR #1), it stands as strength. |
| 46 | Product & Business Impact | display + Cards | **Rebuild** | The pivot admission + verbatim-repeated impact blurbs. See TL;DR #1 and #2. |

**Skim layer verdict:** stronger headers than Software Observability — "The Fundamental Logic Flaw," "A Layered Approach," "Actionable Governance," "Implementation Realities" are narrative beats, not screen names. The failures are local: two identical "Data Certification" headers, five headers for the certification beat, a glossary opening, and a title-case grammar slip ("Standardizing of Excellence"). Fix those and the skim story is the better of your two studies.

---

## Story gaps (ordered by damage)

1. **Shipped vs designed is undisclosed until the final paragraph.** The single biggest structural dishonesty-by-omission in either study. The fix costs one sentence in the Brief and one reframe of the ending (TL;DR #1).
2. **Impact attribution doesn't survive its own study.** Self-healing = the stated *future* vision, claimed as delivered impact; the pharma outcome has no visible connection to any screen in the study. Every impact claim needs a mechanism sentence: which shipped layer produced it.
3. **No timeline, again.** "Maintain project velocity" and "shortening time to market" are claimed; zero durations exist. This study has a natural one: how long from zero CMDB knowledge to validated three-layer architecture?
4. **The experts validate; no customer or configuration manager ever appears.** The study's own persona — "configuration managers pinpoint exactly what's broken" — is never met. Even one secondhand anecdote from onboarding a real CMDB would ground it.
5. **The ServiceNow integration's fate is unstated.** Phase 1's remediation priority was "a bidirectional workflow with ServiceNow" — did the integration exist, get built, get validated? It's the technical heart of Layer 3 and it just evaporates.
6. **Who set the three pillars?** "Completeness, Quality, and Recency emerged through validation sessions" — *emerged* is ownership-ambiguous on the study's central framework. If you proposed them and SMEs confirmed, say that.
7. **The Batch ID data-model contribution is authorless** (see table row 44).
8. **"Certification Status Explorations" references delta indicators "descoped before technical constraints"** — sentence is garbled in source and the constraint is never named. Fix or cut.

---

## Repetition map

Counts from the source markdown: `remediation` ×47, `certification` ×41, `prioritiz*` ×20, `governance` ×12, `Fortune 500` ×6, `cognitive` ×5, `low-hanging fruit` ×3, `breathing space` ×3, `cramped workspace` ×2.

| Beat | Where | Keep | Cut |
|---|---|---|---|
| Certification Status definition | Table cell + standalone section (verbatim ×2) | Standalone | Table copy |
| Calculation Transparency | Table row + standalone section (verbatim ×2) | One, reworded | The other |
| Impact blurbs | Top of study + final section (verbatim ×2) | Final section (rebuilt per TL;DR #2) | Top copy becomes the 1-line summary |
| Certification beat headers | 5 headers (§28–32) | 2 ("Unifying…" gaps + "Actionable Governance") | 3 |
| "Low-hanging fruit" | Single/multi split ×3 tellings (§27, §35, §42) | First telling | Rephrase the other two |
| "Breathing space" / "cramped workspace" | ×3 / ×2 within §38–41 | One each | The modal section and full-page section make the same point twice — merge |
| "Fortune 500" | ×6 | 2 | The rest — it starts sounding like a tic |
| Single vs multi-failure explanation | §27 cards + §35 cards + §42 toggle card | §27 (origin story) | Compress later mentions to references |
| Cross-portfolio: AI parallel prototyping, "knowledge gap from 0," XOPS boilerplate, calculation-transparency beat | Full retellings in both case studies | Full version in Software Observability | One-line references here |

---

## Impact & systems-thinking fixes

**Already strong — protect:**
- The CMDB→XOPS translation with the 1:1-would-break-platform-logic judgment call.
- The three-layer architecture with breakpoint reasoning — *then close its loop at the ending* (the pivot proves the breakpoints were right).
- The Fundamental Logic Flaw arc and the emergent single/multi prioritization layer.
- Tiered thresholds + warning zones — governance design with per-domain operational empathy.
- The 80/20 source-comparison descope — quantified trade-off language.
- Implementation Realities — edge-case fluency.

**Push harder:**
- "Unified 17 data sources" — the study's best number, currently trapped in a garbled blurb. Give it a mechanism: unified *how*, surfaced *where* in your design.
- "Shortening time to market" → by how much, or cut the claim.
- "Projected Healthy Records" — did anyone use the forecast to make a decision? One example turns a feature into influence.
- Engineering presence is closer here than in Software Observability (the donut-chart constraint conversation, component reuse for implementation velocity, Batch ID) — but all three are drive-bys. Pick one and give it three sentences of who-said-what.

---

## Walls of text

Same disease as the other study — benefit clauses stapled to every concrete statement — plus conversion damage. Worst offenders:

1. **The Problem** — one 49-word how-might-we containing five clauses. *Direction:* split into gap + stakes; the lifecycle-structure detail belongs in the answer, not the question.
2. **Full Page Rationale + Moving Away from Split-View** — two sections making one decision, with "breathing space" ×3 and "cramped workspace" ×2 as load-bearing phrases. *Direction:* one section, one paragraph per killed option, keep "stole critical space from the record-level data" (the concrete one), delete the breathing.
3. **Translation table, Lifecycle cell** — an 80-word cell doing definition + rationale + outcome. *Direction:* rationale only ("XOPS is lifecycle-built, so Category and Class collapsed into Domain"); the definition is upstream, the outcome is visible.
4. **Requesting Remediation** — ServiceNow rationale + goal statement fused into one breath. *Direction:* lead with "our customers already lived in ServiceNow"; cut "balanced X with Y" phrasing (it appears in some form four times in the study).
5. **Autonomous Data Governance vision card** — one 60-word sentence chaining four future behaviors. *Direction:* it's a vision — three short declaratives will land harder than a subordinate-clause train.
6. **Every final-design annotation ending in "…without interpretation / without mental calculation / without cognitive overload"** — the reader got it the first time. *Direction:* keep the mechanism, cut the cognition clause in at least half the cards.

---

## What the HM says out loud

**After the 60-second skim:**
> "Dense. CMDB governance — genuinely hard, unsexy domain, that's a point in favor. Headers tell an actual story: layered architecture, three pillars, a 'fundamental logic flaw' they caught themselves — I want to read that section. But there's a `{Summary}` placeholder at the top, the impact blurbs don't parse, and I've now seen 'Broadcom' and '0→1' in both of this person's case studies. Keep reading? Yes — but on trust credit that the finish will justify it."

**After the full read:**
> "The middle is the best sustained thinking in this portfolio — the failure-model rebuild, the threshold governance, the modal-to-full-page reasoning with actual kill rationale. This person models systems, not screens. Then the last paragraph tells me most of it never shipped, *after* forty sections implied it did. I don't mind unshipped — startups pivot — I mind finding out at the end. And the impact section claims the future-vision slide as a delivered outcome, which now makes me re-check every other claim. Interview: yes, on the strength of the logic-flaw section alone. But my first question is 'what actually shipped?' — and it shouldn't have to be."
