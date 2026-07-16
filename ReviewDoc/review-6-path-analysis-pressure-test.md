# Path Analysis (Auryc) — Pressure Test of Review 5

Same reviewer, arguing against himself. Companion to `review-5-path-analysis-full-audit.md`.

---

## 1. The Top 5, after defending the other side

**#1 — Metrics indefensible as written.**
*Strongest counter:* these are the only hard numbers in the portfolio — scoping and caveating them ("of accounts active in the quarter…") could bleed their punch, and a 2021 project's exact baselines may be unrecoverable. Better a bold round number than a hedge-riddled one.
*Verdict:* **Holds — the counter has it backwards.** Unscoped numbers aren't bold, they're fragile; the punch dies at the first interview follow-up instead of on the page. And the fix isn't hedging, it's scoping: "adopted by 78% of accounts" *gains* force with "within N months of launch." If a baseline is truly unrecoverable, drop that one metric rather than present all four at the same unverifiable level — three defensible numbers beat four soft ones.

**#2 — The sankey reasoning black box.**
*Strongest counter:* it's been four-plus years; reconstructing design rationale from memory risks confabulation — writing whys you can no longer verify is worse than modestly reporting what happened. The exercises' images might have to stand alone.
*Verdict:* **Holds, with a guardrail absorbed.** The chart's *structural* decisions are recoverable from the final artifact itself — noise handling, collapsed paths, label behavior are visible in the screenshots and production video; describing what the design demonstrably does is not confabulation. Reconstruct from the artifact, not from memory of meetings; skip any why you can't anchor to something visible.

**#3 — Undersold technical evidence.**
*Strongest counter:* inspecting charts with dev tools is table-stakes curiosity, not engineering contribution — inflating it could read as a non-technical person's idea of technical, and invite a probing question the candidate loses.
*Verdict:* **Holds, narrowed.** Don't inflate the dev-tools moment into an engineering claim — present it as what it is: learning a hard visualization form by reading real implementations. The *stronger* technical evidence in this study is elsewhere and the audit underweighted it: the QA credit and the backend-constraint traces (read-only Phase 1, defined-events-only, collapsed repeated paths — all three smell like data-model constraints you designed within). Lead the technical story with those; the dev-tools beat supports.

**#4 — Elevate and connect the customer quotes.**
*Strongest counter:* quotes harvested from sales calls you sat in on aren't research rigor, and attributing them years later ("VP of Product, e-commerce company") risks invented specificity. Four QuoteBlocks might also over-use the emphasis component the audit elsewhere protects.
*Verdict:* **Holds, right-sized.** Attribution can be honest at the segment level ("support call, enterprise retail customer") — no invention needed. And the audit already allowed the format answer: two quotes as QuoteBlocks, two as Cards. The quote→decision traceability, which is the actual point, survives any counter — those lines are drawable from the shipped Phase 2 list today.

**#5 — Write the missing back third.**
*Strongest counter:* this is a legacy project being migrated, not re-litigated; a bolted-on 2026 reflection about 2021 work could read as retrofitted wisdom. Maybe the study should stay lean and let the new studies carry reflection.
*Verdict:* **Holds — the counter names the trap, not the reason to skip.** Hindsight is this study's unique asset, not its liability: you know what happened *after* — whether the feature endured, what Phase 3 became, what you'd now do differently having designed two more 0→1 systems since. A reflection that says "three years later, here's what this project taught me that I used at XOPS" is the portfolio's only chance to show growth *across* case studies. No other section anywhere can do that.

Tally: all five hold; #2 gained a confabulation guardrail, #3 re-led with QA/backend constraints over dev tools, #4 right-sized the QuoteBlock count. Nothing dropped.

---

## 2. Cuts ranked by regret

This study's migration is mostly expansion, so the cut list is short — which makes the zones matter more, not less:

**Zone A — a HM would never know these existed:**
1. The verbatim Results repeat (content, not position — the closing slot gets the goal-mapped rebuild)
2. "What are we working with?" as a header
3. The Components/Types inventory cards (fold the one-line facts into the audit intro)
4. All encoding artifacts, typos, and the second "at a glance"
5. "More Chart Exercises" as a header (the content survives under a better name)

**Zone B — a careful reader might notice; keep the substance, kill the container:**
6. Competitive Analysis + Areas of Opportunity → one section; the competitor-gap cards must survive intact (they justify Phase 2)
7. The Goals section as-written → dissolved into InsightGoalRows; the Easy/Insightful/Clear triad itself is worth keeping as the goal names

**Zone C — a HM would actually miss these. Untouchable:**
8. All four customer quotes
9. Both iteration sections with their honest cons
10. The two-phase strategy framing
11. The production video and the timeline/team/contribution meta — this study's proof-of-shipping is its entire portfolio role

---

## 3. The one-impression test

Impression: **end-to-end owner + systems thinker who prototypes to think and drives teams through ambiguity.**

**ADDS:** hero video + metrics (once scoped) · Background stakes · build-vs-buy Opportunity framing · tool audit findings · Shadowing Sales & Support (§7 — the study's biggest ADD) · competitive gaps → Phase 2 line · two-phase Research Conclusion · Query Builder V1/V2 honest iteration · step-count probe (§11) · table→chart exercise · dev-tools inspection · Excluding Events descope · In Production section · timeline/team meta

**NEUTRAL:** About/Auryc boilerplate · Components/Types inventory · phase feature lists (until each item is tied to a quote or gap) · Final Sankey Chart *as currently written*

**DILUTES — ordered by cost:**
1. **Unscoped metrics** — the study's own credibility engine running in reverse; every other claim gets discounted by the reader's doubt about the four numbers.
2. **The sankey black box** — the self-declared hardest problem resolving in one passive sentence reads as "someone else finished it." Costs the end-to-end-owner claim directly.
3. **Goals-as-notes** — the one section where the writing quality itself undermines the seniority impression ("Tooltips can lead to more path context than only the traffic count" is a jotting, not a goal).
4. **The missing back third** — a story that ends at a metrics slide is a sprint report; the absence dilutes by genre.
5. **Typos and encoding damage** — "Intergrating Strenghts" as a *section header* is the cheapest possible way to lose the craft-bar argument.
6. **"Tested internally" vagueness** — makes real findings sound like anecdotes.

---

## 4. Missing evidence that's already in your hands

1. **Phase 1's constraint set is your backend-collaboration story, unclaimed.** Read-only charts, defined-events-only, collapsed repeated paths — three scoping decisions that are almost certainly the shape of what the backend engineer could deliver in a quarter. If so, the sentence you're missing is: "I designed Phase 1 inside the data model's real limits — here's the constraint and what I traded to fit it." Go reconstruct which of the three were technical constraints vs design choices; either answer produces a good beat.
2. **You likely watched users struggle in your own product's session replay.** Auryc *is* a session-replay company; the post-launch info-icon fix implies you saw confusion somewhere. If the signal was Auryc replays of Auryc users — that's a dogfooding loop (designed the feature, watched real sessions of it, shipped the fix) no other study in the portfolio can offer. One memory to verify; enormous return if true.
3. **The competitive analysis chart artifact exists** (`CompetitiveChart.svg`) — a real feature-matrix you built. The audit's competitive section keeps the findings, but the artifact itself is evidence of structured synthesis; carry it into the new format as an ImgCard rather than summarizing it away. Runner-up: the research-synthesis photo (`Research Synth.jpg`) — physical/whiteboard synthesis artifacts are exactly the "drives teams through ambiguity" texture the XOPS studies lack.

---

## 5. The 15-second verdict

Fifteen seconds buys: a product logo, "Path Analysis," a one-line description, an autoplaying product video, and four metric cards.

**Verdict today: yes — the only 15-second yes in the portfolio.** A moving product plus four numbers is a stronger open than either XOPS study currently has (one has a placeholder hero, one has a `{Summary}` hole). The weakness is inside the yes: "ARR increase of 20% from previous quarter" is phrased like a company earnings line, and a sharp HM's yes comes with a mental asterisk on all four numbers.

**The single change:** rescope the metric cards — lead with "Adopted by 78% of accounts," attach a scope to each of the rest, drop any number that can't carry one. That converts a yes-with-asterisk into the clean yes this study's evidence deserves. (Second: replace the "ARR" card's phrasing even if the number stays — feature-attributed language, not earnings language.)

Closing portfolio note: this study is the portfolio's *proof layer* — it shipped, it was adopted, customers spoke, and there's video. Its migration priority should reflect that role: the XOPS studies claim; this one verifies. Don't let it launch last.
