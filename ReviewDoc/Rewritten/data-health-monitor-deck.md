# Data Health Monitor — DECK VERSION (interview walkthrough, ~22 slides)

**Convention:** plain = your content · **bold = Claude-written** · `🔍 NEEDS YOU` = memory required · ON SLIDE / TALK TRACK / ⚠️ EXPECT per slide.

Interview arc: *why data trust is the whole ballgame → learning a broken 30-year-old domain → architecting for uncertainty → the model that was wrong → the model that was right → governance as design → what shipped and why the pivot proved the architecture.* This is your **systems-depth** story — where Software Observability shows breadth, this one goes deep. Target 25–30 min.

---

**SLIDE 1 — Title.**
ON SLIDE: Data Health Monitor · XOPS · Lead Product Designer · year.
TALK TRACK: **"This is my systems story. An unglamorous domain — CMDB governance — that's been broken at every Fortune 500 for decades. I'll show you how I modeled it, where my model was fundamentally wrong, and why the architecture survived a company pivot."** (Promising your own error up front is a confidence move — it tells them the good part is coming.)

**SLIDE 2 — The stakes.**
ON SLIDE: "Trusted, Clean, Data." + one line: AI agents managing lifecycles operate on a foundation that can't be relied on.
TALK TRACK: XOPS deploys agents to automate IT workflows. Every inherited CMDB was fragmented, manually maintained, rarely audited — dirty data slowed time-to-value and blocked the automation we were selling. **Autonomy is downstream of data trust. That's the whole thesis.**

**SLIDE 3 — The market gap.**
ON SLIDE: "Enterprise CMDBs have been broken for decades."
TALK TRACK: Configuration data scattered, updated manually, audited infrequently — operations running on outdated fiction. Customers needed a better answer to CMDB governance and no one was delivering it. I led design for a persistent monitoring layer to replace reactive cleanup.
⚠️ EXPECT: "Why hadn't anyone solved it?" — **have a view: incumbents (ServiceNow) monetize the record-keeping, not the health; startups lack the integration surface. XOPS had both the data plane and the incentive.**

**SLIDE 4 — Scope, declared. (THE HONESTY SLIDE — do this early, on your terms)**
ON SLIDE: Three-layer diagram — Observability / Investigation / Action — **with a "SHIPPED" badge on Layer 1.**
TALK TRACK: **"Before I walk you through it: Layer 1 shipped to Fortune 500 production. Layers 2 and 3 were designed and SME-validated when the company pivoted. I architected it in independent layers precisely so that a shift like that couldn't zero out the work — and I'll come back to that at the end."** Where are the natural breakpoints? Where can value ship without blocking dependencies? Deadlines shift, timelines are uncertain — clean breakpoints mean the team always delivers something meaningful.
⚠️ EXPECT: "So most of it didn't ship?" — **you've already answered it; that's the point of doing it here and not at slide 20.**

**SLIDE 5 — Learning the domain.**
ON SLIDE: CMDB → XOPS mapping diagram (Category+Class merging into Domain).
TALK TRACK: I started from zero on CMDB. The key translation decision: a literal 1:1 mapping would have broken XOPS's platform logic — CMDBs organize by asset taxonomy, XOPS organizes by lifecycle. I collapsed Category and Class into Domain so data health lived in the structure users already operated in. **The senior move in domain translation isn't fidelity — it's knowing what to refuse to port.**

**SLIDE 6 — Insights from the people who'd lived it.**
ON SLIDE: Three insights (no persistent reliability signal / distributed failures impossible to prioritize / visibility without action is worthless).
TALK TRACK: Validation with Director of Product, VP CustOps, VP Engineering — each had run these problems at enterprise scale. **Insight 3 is the one that architected the product: it's why there are three layers and why Layer 3 exists at all.**

**SLIDE 7 — Three constraints that reshaped the foundation.**
ON SLIDE: The three kickoff constraint cards.
TALK TRACK: Single health score → wrong; health needed independent dimensions per failure mode. Historical trends → descoped; a new system has no baseline, and fake trends would poison trust in Phase 1. Source-vs-source comparison → descoped; sources speak different languages, and domain-level health delivered **80% of the functional value with significantly less technical overhead.**
⚠️ EXPECT: "How do you make descope calls?" — **this slide is your answer: trust-preservation and ROI, stated as percentages where possible.**

**SLIDE 8 — The three pillars.**
ON SLIDE: Completeness / Quality / Recency triptych **with actual formulas.**
TALK TRACK: Do we have it? Is it correct? Is it still relevant? — three independent dimensions covering a data point's lifecycle without overlap. **Walk one formula (Recency: % of CIs synced from authoritative sources within 24h) to show the metrics are defined, not vibes.**

**SLIDE 9 — Whose standard counts?**
ON SLIDE: Threshold-band diagram (passing / warning zone / failing).
TALK TRACK: Excellence differs per organization — so thresholds are configurable, tiered system-level vs domain-level: tight for high-velocity Employee data, flexible for manually-updated Worksite data. And warning zones: **thresholds define failure; warning zones prevent it** — runway to intervene before breach.
⚠️ EXPECT: "Isn't configurable thresholds pushing the hard problem onto the customer?" — **honest answer: yes, partially, in Phase 1 — configured at onboarding; a structured configuration flow was flagged for a later phase. Trade-off named in the design.**

**SLIDE 10 — Designing for density.**
ON SLIDE: Tiles vs rows, same 10 domains.
TALK TRACK: Tile layout failed at Fortune 500 scale — memory tax across cards, visibility capped at four domains, text thresholds forcing mental math. Row architecture: one axis, threshold-relative progress bars, worst-first default sort. **Critical issues surface without anyone having to scan.**

**SLIDES 11–13 — The wrong model, and what it taught. (THE CENTERPIECE — spend 6–8 minutes)**
SLIDE 11 ON SLIDE: the four failure-model explorations, each with its kill reason.
TALK TRACK: Four models for surfacing validation failures, built while I was still learning the domain — weighted attribute impact (sound, but needed a config engine we couldn't afford), criticality filtering (no domain context), domain aggregation (incomplete picture), color-coded pills (collapsed at scale). **I build models to be shot at.**
SLIDE 12 ON SLIDE: **the flaw, diagrammed — assumed model (1 failure = 1 record) vs reality (one CI, multiple simultaneous failures; repeated failures within one CI).**
TALK TRACK: All four shared one silent assumption: a clean relationship between failures and records. An engineering conversation over the donut chart's data requirements falsified it — a single record carries multiple failures across categories. Any model on that assumption **inflates the workload and distorts remediation priorities — the tool would have lied about the size of the problem.**
> 🔍 NEEDS YOU: the engineering conversation specifics (who, what schema reality — one row per failure with repeated CI ids?).
SLIDE 13 ON SLIDE: the corrected model — Total Failures vs Affected Records, single- vs multi-failure split.
TALK TRACK: The fix required surfacing *both* counts — and the correction produced something unplanned: the single-vs-multi split, which turned out to be the product's best prioritization layer. Single-failure records are the low-hanging fruit — the fastest path back to healthy data. **The wrong model, corrected honestly, designed a feature none of us had thought to ask for.**
⚠️ EXPECT: "Tell me about a time you were wrong." — **you're currently telling it, with a diagram. This is the story that gets you hired.**

**SLIDE 14 — Certification: the compliance layer.**
ON SLIDE: The three gaps (no remediation visibility / redundant health data / abstract time without urgency) → the Actionable Governance final.
TALK TRACK: Status alone wasn't enough — an expired domain with active remediation reads completely differently from one where nothing's started. Final design: priority-driven status logic, last-certified audit anchor, **Days Remaining as a countdown bar (urgency without mental math)**, open-request counts as the path back to compliance.

**SLIDE 15 — Inheritance by design.**
ON SLIDE: System view → domain view, same components.
TALK TRACK: Domain views inherit the system-level structure — same status logic, same pillars. Reuse bought implementation velocity *and* kept the mental model intact from system to lifecycle to attribute. **The user never re-learns the product as they descend.**

**SLIDE 16 — From analysis to action.**
ON SLIDE: Attribute-level analysis → bulk selection → remediation request.
TALK TRACK: Layer 3 priority: a bidirectional ServiceNow workflow — the tool our customers already lived in. Bulk-select failures at the attribute level, refine at the record level, dispatch. **Observability becomes operational.**

**SLIDE 17 — The workspace: paths not taken.**
ON SLIDE: Decision tree — Modal (nested ✗ / split ✗) → Full page (split ✗ / nested ✓), kill reasons on branches.
TALK TRACK: I audited the platform for existing patterns first — table bulk-selection, repurposed metric cards; zero new learning curve. Modal killed: couldn't hold metrics + attribute + record detail. Split view killed: **the sidebar stole critical space from record-level identifiers** — the data teams needed to make confident decisions at scale. Nested table in a full page won: collapsed rows for comparison, expansion for multi-failure scope.
⚠️ EXPECT: "How do you decide between layout patterns?" — this tree is the answer: enumerate, borrow, kill with named reasons.

**SLIDE 18 — Forecasting outcomes.**
ON SLIDE: Projected Healthy Records metric.
TALK TRACK: As the design matured I added a forecast: the immediate recovery impact of a specific remediation batch. **It moved the conversation from technical fixes to business outcomes — 'this batch returns the domain to certified.'**
> 🔍 NEEDS YOU: one instance of the forecast informing a real decision.

**SLIDE 19 — Implementation realities.**
ON SLIDE: The three open questions (blocked progress / sync latency / ownership disputes).
TALK TRACK: The questions I logged for implementation — what happens when a fix depends on another asset, when a closed task hasn't synced, when a department rejects ownership. **Some you find in research; some you can't know until you're touching real data. Logging them is the job.**
⚠️ EXPECT: "How would you have solved the ownership dispute?" — **have a sketch of an answer (routing/escalation states on the batch), but it's fine to say it was genuinely open.**

**SLIDE 20 — What shipped, and the pivot.**
ON SLIDE: Layer diagram again — Layer 1 badged SHIPPED, Layers 2–3 badged DESIGNED + VALIDATED.
TALK TRACK: **"The company pivoted before Layers 2 and 3 were built. This is the slide where the architecture from slide 4 pays off: Layer 1 stood alone, shipped, and became the foundation for XOPS's expansion into Data Governance Intelligence. The breakpoints I designed for shifting deadlines ended up absorbing a company-level shift. Scope architecture is risk architecture."**

**SLIDE 21 — Impact.**
ON SLIDE: The rebuilt impact cards (17 sources / Broadcom; pharma outcome if attributable).
TALK TRACK: **Mechanism first, number second: 17 data sources unified into the monitored views — configuration managers pinpoint what's broken by domain and prioritize remediation where recovery impact is highest.**
> 🔍 NEEDS YOU: the 17-source mechanism; pharma attribution; ServiceNow workflow's fate.

**SLIDE 22 — Reflection + arc close.**
ON SLIDE: Three lessons (breakpoints are insurance / wrong models teach faster than no models / governance is a design surface).
TALK TRACK: **Close the pair: "Software Observability was breadth — a new lifecycle 0→1. This was depth — modeling failure itself. Same method both times: learn fast, model it, put the model somewhere it can be falsified, and architect so that being wrong — or a pivot — never zeroes the work."**

---

### Prep list
1. The engineering/schema conversation (slides 11–13) · 2. 17-sources mechanism · 3. pharma attribution check · 4. ServiceNow integration fate · 5. one forecast-informed decision · 6. Batch ID authorship · 7. your sketch-answer to the ownership-dispute question.
**Slides 4 and 20 are a matched pair — declare the scope early, collect the payoff late. Never let the pivot be a surprise you're explaining; make it evidence you're presenting.**
