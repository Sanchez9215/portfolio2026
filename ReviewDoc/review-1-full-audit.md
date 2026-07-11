# Software Observability — Full Case Study Audit

Reviewer stance: hiring manager screening for Senior Product Designer, technical, product-led B2B SaaS. Judged against one impression: **end-to-end owner + systems thinker who metabolizes complexity, prototypes to think, and drives teams through ambiguity.**

Read basis: all 68 sections of `app/work/software-observability/page.tsx`, `SectionIntroduction.tsx`, and the component vocabulary in `components.md` / `built-components.md`.

---

## TL;DR — the 5 highest-leverage changes

1. **Your final designs are captioned "AI Prototype 02." Fix this before anything else.** The All Software final design, Table Anatomy, Row Anatomy, System Refinements, and Customizable Columns images — the exact artifacts that prove your craft and decision-making — carry a caption that credits them to an AI tool. A HM skimming images-first reads: *"the AI made the final design."* This single caption choice undercuts the entire "raises the craft bar" claim at the moment you're supposed to be earning it. Caption finals as finals ("All Software — Final Design"), and reserve AI attribution for the divergent exploration phase, where it makes you look fast, not replaceable.

2. **You have ~30 `display`-weight headline beats. A hierarchy where everything is elevated has no hierarchy.** Pure transition sentences ("With gaps identified…", "Together these sessions gave me clarity…", "In parallel, I facilitated cross-functional sessions…") get the same structural weight as your genuine highlights (the Assumption→Finding→Decision loop, Scope & Trade-Offs, Impact). Demote every connective-tissue display to a `Block`, and the ~12–15 real beats will finally read as beats. Specifics in the table below.

3. **Your best systems-thinking moment is buried in two disconnected one-liners.** "Data Ops had higher priorities" (an editorial aside) → "I took a modular design approach" (an unlabeled display with zero elaboration). This is the thesis of the whole project: *designing a full module against a data foundation that didn't exist yet, so that any missing source degrades gracefully.* No B2B portfolio ever shows this, and you have it — in ~40 words with no example, no image, no name. Make it a labeled section, show one view with a data category removed, and let it govern the story (every later descope decision is this principle paying off).

4. **The middle third collapses into a feature tour.** Tooltips → Design System Refinements → Customizable Columns → Drag-and-Drop Reordering are four consecutive headline sections for what is one idea ("the table became a configurable decision surface, and the fixes were promoted platform-wide"). A skimmer reading only headers goes from "systems thinker" to "person who documents table features." Merge into one or two beats; the platform-wide propagation of the fixes is the interesting part — that's system leverage, currently a footnote.

5. **Impact is real but hedged, unquantified, and missing the "technical" proof entirely.** "Contributing to millions" for Broadcom is the only number, and it's soft-attributed. There is no velocity number (Slack ping → shipped Phase 1 in how many weeks?), no adoption signal, no sales anecdote with teeth — and for a role that wants someone who contributes to code, **the case study never once mentions engineering handoff, implementation, or anything you built.** "In production" appears once, passively. This is the gap between "strong designer" and "the person this role describes."

---

## Structural hierarchy audit

Vocabulary key: `display` = headline beat (LabelBlock size="display"), `editorial` = custom heading, `Block` = supporting prose, `Cards` = discrete decisions/annotations, `Quote` = emphasis moment, `Img` = image section.

| # | Section | Current weight | Verdict | Why |
|---|---------|----------------|---------|-----|
| 1 | Intro (hero + overview + 3 impact blocks) | Intro composite | **Keep** | Impact-first opening is right. But the hero image is a placeholder — nothing to skim. |
| 2 | Brief ("no formal spec") | display | **Keep** | Earns "comfortable in ambiguity" in one beat. Strong open. |
| 3 | The Problem + MessageThread | display + artifact | **Keep** | The Slack-thread artifact is the best origin device in the study. |
| 4 | "Nearly impossible" quote | Quote | **Keep** | Correct use of the emphasis slot — but attribute it. Unattributed, it reads as your own copywriting, not user pain. |
| 5 | 50% / $45M metric cards | MetricCards | **Keep, cite** | Uncited industry stats invite HM skepticism. One-line source fixes it. |
| 6 | Research ("0%" + AI ramp) | display + 3 xs labels | **Demote the labels** | The self-aware 0% is charming and the AI ramp fits your positioning. But the three xs LabelBlocks ("The Current Landscape," "Data Points & Metrics," "Terms & Definitions") are empty labels — content-free chrome. Cut or fill them. |
| 7 | Insights & Goals + Experts | display + 3 rows | **Keep — this is your spine** | Insight→Goal pairing is the strongest structure in the study; the payoff mapping at the end (goal-connections) closes the loop. Don't touch the structure; tighten the bodies (see Walls of Text). |
| 8 | Framework Adaptation & Data Requirements | display | **Merge into #9** | It's a preamble to Observability First — one beat pretending to be two. The "I wasn't a SAM expert but…" line is a hedge; cut it, the 0% section already made that point with more charm. |
| 9 | Observability First (framework mapping) | editorial + 2 CardRows | **Elevate** | Asset-framework → software-framework mapping is genuine systems thinking and it's *below* display weight while transitions above it get headlines. This deserves the promotion #8 is squatting on. |
| 10 | Data. Data. Data (5 ContentHubs) | editorial + hubs | **Keep** | The data model as an artifact is exactly what "handles complexity" looks like. The "baseline, not a final spec" line is quietly excellent. |
| 11 | Data Ops had higher priorities | editorial | **Elevate + merge with #12** | The constraint that defines the whole project, styled as an aside. |
| 12 | "I took a modular design approach" | display, unlabeled | **Elevate hard** | See TL;DR #3. Currently the thesis of the project is the shortest section in it. Label it, give it an example and an image. |
| 13 | Parallel Prototyping | display + imgs | **Keep** | Differentiated method, clearly told. This is your "prototyping as thinking" evidence — good. |
| 14 | Prototype Validation + glossary/intent doc | display + Blocks | **Keep; elevate glossary** | The living glossary + metric intent doc is a governance/trust artifact almost nobody shows — and it's one sentence in a side Block. Show the artifact or give it a card. |
| 15 | Overview Prototype 1 — Assumption→Finding (8 cards) | SectionImg | **Keep — best section in the study** | Honest assumptions, domain-dense findings (over-assignment audits, jurisdiction risk, no industry-standard stages). This is where a HM decides you're real. |
| 16 | Overview Prototype 2 — Decisions (8 cards) | SectionImg | **Keep, fix one bug** | The Geographic Filtering "Decision" card repeats the *assumption* text verbatim from #15 — a copy/paste error that states no decision. In your most rigor-proving section, that's a credibility leak. |
| 17 | "With gaps identified…" | display | **Demote to Block** | Transition sentence at headline weight. |
| 18 | All Software View | display | **Keep (thin)** | Legitimate beat, but body restates the framework card from #9 nearly verbatim. |
| 19 | Core Attribute Intent | display | **Demote / merge into #18** | It's the sub-thought of #18, not a beat. |
| 20 | All Software Prototype 1 — column rationale (8 cards) | SectionImg | **Cut ~half the cards** | Explaining why a table has a "name" column is feature-tour material at decision weight. Keep the non-obvious ones (spend-first sort, utilization rate, inactive-90-days); cut Identification Columns, Category, Total Spend, Licenses Purchased — their content reappears in Row Anatomy anyway. |
| 21 | Software Profile | display | **Keep** | |
| 22 | "What is this software costing us…" quote | Quote | **Keep** | Correct emphasis use — the design's organizing question. |
| 23 | Utilization and Cost Summary | display | **Demote** | Restates #22's idea in abstract language. The quote is the beat; this is its caption. |
| 24 | Profile Prototype 1 (5 cards) | SectionImg | **Keep, trim** | "Publisher logos strengthen product polish" is a weak card — logo rationale also appears again in Row Anatomy. Once is enough. |
| 25 | Lifecycle Timeline (What/When/Why/Who) | display + editorial | **Keep** | Nice rhythm break. |
| 26 | Generating Realistic Events ("I took the initiative") | display | **Keep, reword** | The beat is real (moved without upstream definitions — ambiguity-driving). "I took the initiative" as the display *body* is telling, not showing; let the situation say it. |
| 27–28 | Event iterations + final timeline | SectionImg ×2 | **Keep** | The AI-output-too-granular → aggregate-milestones refinement is a genuinely good "technical designer working with AI" beat. |
| 29 | Unifying Systems | display | **Keep, compress** | Second full explanation of the parallel-prototyping method — reference it ("same two-track approach as Overview"), don't re-teach it. |
| 30 | Setting a Blueprint | display | **Demote / merge into #29** | "I synthesized my findings into a prototype" is the same beat as #29's ending. |
| 31 | Testing the Experience | display + **empty ImgCard** | **Keep beat, fix hole** | The connected navigable prototype is your single best "prototypes to think" proof and the image is missing. An empty card captioned "Full Prototype" is worse than no card. |
| 32 | Two Track Validation | display | **Merge with #33** | "Two Track" names the section, but track two lives in the *next* section under a different headline. One section, two tracks, one header. |
| 33 | Cross-functional sessions | display | **Merge into #32** | Also: "Bringing multiple perspectives… is a strategy I rely on" is résumé-speak inside a narrative. Show it once, don't announce it. |
| 34 | "Together these sessions gave me clarity" | display | **Cut or demote** | Pure connective tissue at headline weight — third transition-as-headline in a row. This stretch (32–34) is where the skim story stalls. |
| 35–36 | All Software: Issues Identified + annotations | display + SectionImg | **Keep** | Self-critique of your own first pass = confidence. Good. |
| 37–38 | "…issues with our current table experience" + annotations | display + SectionImg | **Keep, rename, split intent** | This is actually a *different and better* story than #35 — you found platform-wide debt while doing feature work. The header doesn't signal that. Name it as system-level ("The table pattern wouldn't survive the platform's growth") so the two issue sections read as product-level vs system-level instead of "Issues, again." |
| 39–40 | All Software: Final Design + image | display + Img | **Keep** | "From data display to decision-making surface" is your best headline. It's also the third time the beat appears (see Repetition). Make this the *only* place it appears. |
| 41–42 | Table Anatomy + Row Anatomy (7 cards) | display + SectionImg | **Keep, absorb #43** | Legitimate depth. But Vendor/Category/logo cards repeat earlier rationale verbatim in idea. |
| 43 | Tooltips | display + imgs | **Demote into #41 or reframe** | As "Tooltips," it's a feature. As *calculation transparency so users trust unified numbers*, it's governance/trust — one of your target signals. Either fold into Table Anatomy or reframe the header around trust, not the widget. |
| 44–45 | Design System Refinements + annotations | display + SectionImg | **Keep, merge with #37–38** | These six cards are the *solutions* to the exact issues in #38, with near-duplicate copy (Asset Count Badge, Region Filters, Table Headers, Row Heights each appear in both). One before/after section instead of issue-section + fix-section 400 lines apart. |
| 46–47 | Customizable Columns + Drag-and-Drop | display ×2 + imgs | **Demote to one combined sub-beat** | Two headline sections for column config. This is the heart of the feature-tour sag. |
| 48–49 | Software Profiles: Issues + annotations | display + SectionImg | **Keep** | Note: the "Low Visibility of Underutilized Cost" card body is about tooltips — it doesn't match its own label. Copy/paste artifact. |
| 50–51 | Software Profiles: Final + annotations (8 cards) | display + SectionImg | **Keep, trim cards** | "Opportunity-first framing" and "explicit reclaimable total" are the two cards that matter; several others restate them. |
| 52–53 | Scope and Trade-Offs + descoped views | display + SectionImg | **Elevate — move earlier or spotlight** | Descoping the Financial Tab *because incomplete data would burn customer trust during evaluation* is senior judgment, and it's the modular-design thesis paying off. Currently arrives after the feature tour has drained skim attention. |
| 54–57 | Inactive License Distribution + 3 chart sections | display + SectionImg ×3 | **Keep 54–55, merge 56–57** | The evolution of the employee tab into a waste-targeting instrument is a strong late beat. But three consecutive SectionImgs with near-identical card copy (see Repetition) is one beat told three times. |
| 58–61 | Overview Revisit + final imgs + completion quote | display + imgs + Quote | **Keep revisit; kill the quote** | Removing your own dashboards because Insights made them redundant = systems honesty, keep. But "With the overview refined… Phase 1 was complete" is a status update occupying an emphasis slot — QuoteBlock debasement. |
| 62–63 | Product & Business Impact + goal connections | display + CardRows | **Keep — strongest structural idea in the back half** | Mapping outcomes back to the three goals, *including an honest "Directional" on Goal 2*, is exactly right. Needs harder numbers, not more structure. |
| 64 | Reflection (4 cards) | Cards | **Keep, cut to 3** | "Tangible Artifacts" and "Parallel Prototyping as Velocity" are one lesson wearing two cards. |
| 65 | Next Steps | display | **Keep** | Fine as an exit. |

**Does the skim layer tell a coherent story?** The first third does, cleanly: ambiguous start → fragmented-data problem → stakes → ramp-up → insights/goals → framework → data model → prototyping → validation. Then headers turn into a site map: *All Software View, Core Attribute Intent, Software Profile, Lifecycle Timeline, Unifying Systems, Table Anatomy, Tooltips, Customizable Columns, Drag-and-Drop Reordering.* A skimmer's takeaway flips from "this person thinks in systems" to "this person is walking me through screens." The back third recovers (Trade-Offs → Distribution → Impact → Reflection). Fix the middle and the skim story holds end to end.

---

## Story gaps (ordered by damage)

1. **No engineering/build presence at all.** For this role, the absence is loud. Where did design meet implementation? Data-model negotiations with the integration team are implied ("as the team learned what data was actually available") but never shown. Even one beat — a schema conversation you drove, a constraint you caught in review, anything you shipped hands-on — converts "technical" from claim to fact.
2. **The final designs appear without a craft owner.** AI prototypes are shown, then "final design" appears captioned *AI Prototype 02*. The step where *you* did the design work — the translation from AI exploration to production-quality design in your system — is the invisible middle. Say what you kept, killed, and redrew.
3. **No customers anywhere in validation.** The problem is framed as IT/Finance/Ops pain, but every validating voice is internal (CPO, VP CustOps, Director of Product). If customer or prospect input existed — even sales-call feedback — one line changes the study from "internally validated" to "market validated." If it didn't exist, the descope-for-trust beat is your cover; acknowledge the constraint.
4. **No timeline.** "Startup at full velocity" and "moves fast" are claimed; zero dates or durations appear. Ping-to-Phase-1 in weeks is the cheapest high-value number available to you.
5. **"Testing the Experience" promises the payoff and shows nothing** — the ImgCard is empty. The connected prototype is the climax of prototyping-as-thinking; right now it's a caption with no body.
6. **The $45M and 50% stat cards are unattributed**, and the opening quote has no speaker. Three data-trust gaps in a case study *about* data trust.
7. **Goal 2's "Directional" honesty is good, but the reconciliation story dead-ends.** Record Integrity is a whole ContentHub in the data model, then never appears again until it's quietly deferred. One sentence on *why* it slipped (integration dependency?) turns a dangling thread into a scoping decision.
8. **Prototype 2's Geographic Filtering "Decision" states no decision** (verbatim repeat of the assumption text). A careful reader — the kind you want — will catch it.

---

## Repetition map

The core duplicated beat, with grep counts: **"turn data into decisions / actionable at a glance."** `reclamation` ×18, `waste` ×10, `actionable` ×6, `urgency` ×6, `at a glance` ×4, `cognitive load/strain/friction` ×4, `single source of truth` ×3.

| Beat | Where it appears | Keep | Cut/merge |
|---|---|---|---|
| "Data display → decision surface / actionable at a glance" | All Software: Issues (header) · All Software: Final (header) · Table Anatomy (header) · Profile: Issues (header) · Profile: Final (header) | **All Software: Final** — it's the sharpest phrasing | Reword the other four headers to say something specific to *their* content (Profiles: "led with the dollar opportunity"; Issues: name the failure, not the theme) |
| Renewal urgency rationale | All Software Proto 1 "Renewal" · Issues "Renewal" · Row Anatomy "Renewal Date + Countdown" · Profile Final "Decision-Ready Renewal Context" | Issues (problem) + Row Anatomy (solution) as one before/after pair | The other two |
| Employee drill-down card | Distribution Overview "Employee Drill-Down" vs Cost Center "Employee Drilldown" — near-verbatim ("exposing the exact users/employees… enabling targeted/fast reclamation and clean handoffs/follow-through") | One | The other |
| Cost breakdown card | Departments "Cost Breakdown" vs Cost Center "Cost Breakdown" — same sentence, reshuffled ("Converts inactive license volume into annualized dollar impact…") | One | The other — merge sections 56–57 into a single department/cost-center beat |
| Issue ↔ refinement pairs | Asset Count Badge, Region Filters, Table Headers, Row Heights each get an "issue" card (§38) **and** a "fix" card (§45) with overlapping copy | One before/after section | The 400-line gap between problem and solution |
| Publisher logo rationale | Profile Proto 1 "Product Identity" · Row Anatomy "Publisher Logo" | Row Anatomy | Profile Proto 1 card |
| Category / Vendor column rationale | All Software Proto 1 · Row Anatomy (both make the same redundancy/procurement points) | Row Anatomy | Proto 1 versions |
| Parallel-prototyping method explanation | Parallel Prototyping (§13) · Unifying Systems (§29) | §13 in full | §29 → one clause: "same two-track approach" |
| "Single source of truth" | Goal 1 · Software Profile header · Lifecycle Timeline header | Goal 1 (it's the goal) | Rephrase the two headers |
| All Software Prototype 1 image | Used in §20, §36, and §38 | Fine if annotations differ — but merging §38+§45 removes one use anyway | |

---

## Impact & systems-thinking fixes

**Where you already demonstrate real systems thinking — protect and elevate these:**
- The framework-adaptation mapping (asset lifecycle grid → software grid) — promote to display weight.
- The five-ContentHub data model with "baseline, not final spec."
- Modular design under data uncertainty (TL;DR #3) — currently 40 words, should be a pillar.
- Over-assignment added "as a distinct utilization state **across the data model and all views**" — that clause is the systems move; it's buried in a decision card. Worth a sentence of its own: a domain discovery that propagated through the entire model.
- Design-system refinements propagating platform-wide — reframe from "cleanup" to "software work raised the bar for every lifecycle view" (that's the "raises the craft bar across the company" signal, verbatim).
- Descoping the Financial Tab to protect customer trust — the single most senior decision in the study; make sure a skimmer can't miss it.

**Where impact is vague — push for the number or the moment:**
- "Contributing to millions in unused license savings" — hedge word + round vagueness. Either the real figure/range for Broadcom, or a concrete mechanism sentence ("the inactive-license distribution view is what the optimization workflows queried"). Chain of causation beats adjacency.
- "Became core artifacts in enterprise sales conversations" — one specific moment (a deal, a demo reaction, a prospect quote) is worth the whole paragraph of abstraction.
- "Enterprise customers received their first actionable view of software waste" — first *ever*, or first from XOPS? A skeptic reads it both ways.
- No velocity metric anywhere (see Story Gaps #4).

**Ownership clarity:** The "I" voice is consistent and collaboration is credited specifically (CPO on stages, Director of Product on strategy) — genuinely well handled. The two leaks: final-design captions crediting AI, and the missing translation step from AI exploration to your production design. Both fixable in an afternoon.

---

## Walls of text

The study's problem is not paragraph length — it's **annotation-card density**: 60+ cards whose bodies all follow *[concrete thing] + comma + [abstract benefit clause]* ("…reducing cognitive load," "…improving transparency and decision speed," "…enabling clean operational follow-through"). Individually fine; cumulatively, the benefit clauses become white noise and the reader stops trusting them. The global fix: **keep the concrete half, cut the benefit clause wherever the benefit is obvious.** Specific offenders:

1. **Financial Tab descope card** — "Contract terms, support costs, and historic spend are often scattered across emails, invoices, spreadsheets, and legal documents with no reliable integration path. Shipping with incomplete records would have cost XOPS customer trust during a critical evaluation period. Phase 2 required a data collection strategy before the tab could deliver on its promise."
   → *Direction:* the middle sentence is the decision and the gold — lead with it. Compress the evidence list, cut the third sentence (implied). ~50% shorter, stronger.

2. **Goal 2 body** — "Reconcile internal records against publisher and vendor data to expose discrepancies, and connect spend to utilization by department and employee so every budget conversation is backed by verified, operational intelligence."
   → *Direction:* two goals crammed into one breath, capped with a slogan ("verified, operational intelligence"). Split into the two actions; delete the slogan.

3. **Sales-enablement impact card** — "In production, the software overview, portfolio, and profile views became core artifacts in enterprise sales conversations, giving sales teams a live demonstration of the exact capabilities Fortune 500 prospects said they were missing and positioning XOPS as a differentiated enterprise solution." (one 47-word sentence)
   → *Direction:* cut "positioning XOPS as a differentiated enterprise solution" (empty calories); replace with one concrete sales moment.

4. **Reflection: End-to-End Accountability** — "…every data point had to earn its place, pressure-tested against its source, dependencies, and how a Fortune 500 team would actually act on it. That discipline sharpened engineering conversations and ensured every metric held up the moment a customer tried to use it."
   → *Direction:* "every data point had to earn its place" is the keeper — it's a great line. Everything after it is restatement; cut to that line plus one concrete example of a metric that *didn't* earn its place.

5. **Testing the Experience body** — "Rather than validating each view in isolation, I wanted feedback to reflect how teams would actually move through the system, from portfolio to catalog to individual record, so that gaps in continuity, logic, and data consistency would surface naturally."
   → *Direction:* the "portfolio → catalog → record" path is the idea; the framing around it ("rather than… I wanted… so that… naturally") doubles its length. State the path, state what it caught.

6. **Milestone Based Events card** — decision + future proposal + rationale in one card body.
   → *Direction:* split the future-configurability proposal into its own clause or cut it; one idea per card.

7. **Utilization and Cost Summary body** — "The business intent was clear, give stakeholders the evidence they needed to justify a reclamation, challenge a renewal, or escalate a waste conversation without ever leaving the platform."
   → *Direction:* good sentence, wrong altitude — this is the third restatement of the profile's purpose in four sections (§21, §22, §23). Keep it here only if you cut it from §21.

---

## What the HM says out loud

**After the 60-second skim:**
> "Strong open — real origin story, they own a problem from a Slack ping, the insight-to-goal structure is tight, and the data-model diagrams tell me they can handle complexity. Prototyping with AI in parallel, interesting… okay, now I'm in a table-features section… tooltips, column drag-and-drop… this got long. Wait, is the final design an *AI prototype*? Hm. Impact says millions and Broadcom, decent. Verdict: probably senior, clearly thorough — but is this a systems designer or a very diligent screen documenter? Depends which half of the study I believe. Keep in pile, with a question mark."

**After the full 15-minute read:**
> "Better than the skim. The assumption→finding→decision loop is real rigor — the over-assignment and jurisdiction findings tell me they actually metabolized the domain. Descoping the financial tab to protect customer trust is the most senior call in here. Honest 'Directional' on Goal 2 — rare. What I can't find: any contact with engineering or code for someone we're hiring partly for technical depth; any customer voice; any number that isn't 'millions'; and the middle third repeats 'make data actionable' until I stopped registering it. And they let their finals be captioned as AI output, which makes me wonder who did the craft. I'd interview — but I'd walk in planning to probe exactly the things this case study should have already answered: what did *you* make, how fast, and what happened when it hit engineering and customers."

That question mark is removable. Fixes 1–5 in the TL;DR remove it.
