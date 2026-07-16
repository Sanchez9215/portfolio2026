# Session Replay: Support Teams (Heap) — Pressure Test of Review 7

Same reviewer, arguing against himself. Companion to `review-7-session-replay-full-audit.md`.

---

## 1. The Top 5, after defending the other side

**#1 — The persona mismatch (support teams titled, PMs interviewed, no support outcome).**
*Strongest counter:* at Heap's customer base, PMs often *are* the replay power users who triage alongside support — the quotes describe genuinely lived investigation workflows, not secondhand speculation. And during an acquisition integration, customer support orgs may simply have been unreachable; interviewing 6 PMs in that window was resourceful, not sloppy.
*Verdict:* **Holds — the counter is the fix, unwritten.** If PMs really were the accessible proxy with firsthand investigation experience, one disclosure sentence saying exactly that converts the hole into a resourcefulness beat. The audit's alternative (retitle) stays on the table only if that sentence can't honestly be written. What cannot stand is the silent version, because the mismatch is discoverable from the page itself.

**#2 — Hedged impact, unexplained Heap-on-Heap chart.**
*Strongest counter:* feature-level revenue attribution inside a company Heap's size is genuinely murky; "key factor" and "contributed to" may be the honest ceiling, and inflating them is the greater interview risk. The chart may also contain customer data that can't be narrated in detail.
*Verdict:* **Holds — same ruling as Path Analysis #1, and the pair should be fixed together.** The ask is specificity, not inflation: name the displaced competitor category if not the customer, scope the 10% ("of weekly active analysis users," whatever it truly was), and narrate the chart's axes even if values stay redacted. An unexplained chart is worse than no chart — it looks like decoration; a scoped hedge is stronger than a bold blur.

**#3 — Unify the acquisition-expert frame.**
*Strongest counter:* leading with the acquisition makes the study about circumstances rather than design decisions, risks reading as excuse-scaffolding ("it was chaotic"), and could even read as trading on Auryc's brand rather than personal contribution.
*Verdict:* **Holds, with the counter setting the tone rule.** The frame must be expertise-transfer, never chaos-survival: "Heap acquired Auryc; I was the replay domain expert; two quarters later the flagship gap shipped." Facts, no adjectives about chaos — delete "chaotic environment" from the Reflection regardless. The counter kills a framing, not the finding.

**#4 — Elevate the Constraints beat.**
*Strongest counter:* it's a modest technical limitation on a single component — promoting it to a headline systems beat risks the same structure-inflation the earlier audits penalized in the XOPS studies. Not every constraint is architecture.
*Verdict:* **Holds.** The elevation isn't for the constraint, it's for the *response*: encoding a data-model boundary into UI semantics (actions vs defined events) so the design degrades honestly today and extends cleanly later. That's the identical muscle review 1 called the thesis of Software Observability — modular design under data uncertainty — demonstrated a year earlier. Elevating it also does portfolio work: it makes the XOPS studies' central claim look like a habit, not a one-off.

**#5 — Explain the research→MVP scope gap.**
*Strongest counter:* MVP scope-cutting is table stakes; auditing every unshipped insight adds bookkeeping the reader doesn't need, and the Constraints section already implies the answer for anyone paying attention.
*Verdict:* **Holds, narrowed to one sentence.** "Implies for anyone paying attention" is the problem — a skimming HM doesn't connect §6's four needs to §8's data constraint unaided. One line at the end of validation ("the data constraint deferred search and session-history to post-MVP; the event list was the piece that could ship") closes it. No bookkeeping, one load-bearing sentence.

Tally: all five hold; #1's counter became its fix, #2 merged with the Path Analysis metric ruling, #3 gained a tone rule, #5 shrank to a sentence. Nothing dropped.

---

## 2. Cuts ranked by regret

**Zone A — a HM would never know these existed:**
1. The verbatim result-card repeat (hero + Results)
2. "Past Experience" as a standalone header (content survives inside the acquisition frame)
3. Sketching + Wireframes + First Prototype as three headers (one arc)
4. ~60% of Reflection's "What Went Well" (the process-tourism and "opened my eyes" material)
5. "Save time and effort" appearing in two quote implications
6. Half the "What's session replay?" explainer
7. Encoding artifacts and typos

**Zone B — a careful reader might notice; keep the substance, kill the container:**
8. The defined-events explainer card — the concept must survive (the Constraints beat depends on it), but as one tight card inside that section, not a standalone tutorial
9. "Other Explorations" as a header — the timeline exploration stays in full; the throwaway header goes ("Killing the Timeline" or equivalent)

**Zone C — a HM would actually miss these. Untouchable:**
10. All four iteration videos — the motion is the portfolio's interaction-design proof; migrate them at full fidelity
11. The four quote cards with their insight→quote→implication structure (the Europe-login quote especially)
12. The Constraints section
13. The release announcement artifact
14. Reflection's "What Would I Do Different" card — the most honest paragraph in all four studies

---

## 3. The one-impression test

Impression: **end-to-end owner + systems thinker who prototypes to think and drives teams through ambiguity.**

**ADDS:** hero player video · acquisition-expert context (once unified) · n=6 stated sample + quote cards · Constraints beat (§8 — the study's biggest ADD) · both iteration sections with decision rationale · the timeline kill (§12) · engineering walkthrough (once expanded) · bug bash → GA · September 2022 date · Heap-on-Heap chart (once narrated) · release announcement · "What Would I Do Different"

**NEUTRAL:** About Heap · both explainer cards · sketches/wireframes imagery · Opportunity HMW

**DILUTES — ordered by cost:**
1. **The persona mismatch** — once noticed (and the title guarantees noticing), it discounts the research section, the goals, and the results in one stroke. Costs the most because it's a trust tax, not a content gap.
2. **The two hedged result cards, twice** — the study's weakest content occupying its two highest-attention slots.
3. **Reflection's junior register** — "my first impactful contribution," "really opened my eyes": the one place the *writing itself* argues against the seniority claim. Facts can stay; the wide-eyed framing can't.
4. **The unexplained Heap-on-Heap chart** — evidence presented without narration reads as filler, and it's the study's only quantitative artifact.
5. **The unaddressed Staff designer** — a silent ambiguity that grows the longer the "I" voice runs unqualified.
6. **Process-generic headers** — Sketching/Wireframes/First Prototype make the skim layer read as coursework while the videos underneath argue mastery.
7. **"There was a spike in usage"** — vagueness directly above its own proof.

---

## 4. Missing evidence that's already in your hands

1. **The engineering walkthrough is a compressed scene from exactly the movie the target role wants.** "Walked engineering through all the different interactions in detail" — with one developer on the team, this was a working relationship, not a ceremony. Go reconstruct: what the spec covered (hover/active/playback-sync states? timing?), one question the developer asked, one thing implementation reality changed. This plus the bug bash is the study's contributes-to-code case; both currently total two clauses.
2. **The future-proofing claim has a checkable payoff.** The Challenge card promises "once the data matches defined events, other analysis features can be easily introduced." It's been years — did Heap's replay grow analysis features on that foundation? If yes, one sentence ("the event-list architecture carried defined events when the data unified in 202X") turns a design intention into a validated architecture decision. This is the same move review 4 found in Data Health Monitor's layering thesis: your own claim, proven by what happened after, unclaimed.
3. **Path Analysis is this study's missing witness.** The two studies corroborate each other — you built path analysis at Auryc partly *around* session replay access, then Heap acquired that expertise and you shipped their player. A one-line cross-reference in each study's intro ("continuing the replay-context work from Auryc" / "expertise Heap later acquired") makes the portfolio read as a career arc instead of four disconnected projects. No other pair of your studies can do this. Runner-up: name what the Staff product designer owned — one clause, converts the ownership risk into collaboration evidence.

---

## 5. The 15-second verdict

Fifteen seconds buys: Heap logo, "Session Replay: Support Teams," a one-liner, an autoplaying player video, and two metric cards — one with no number ("Key factor in closing deals for replay tool replacement") and one soft one ("10% increase in session replay viewing").

**Verdict today: a lean yes on the video, undercut by the weakest metric row of the four studies.** A recognizable brand (Heap) plus a polished player in motion carries the 15 seconds; the cards then spend the earned trust — a claim with no number next to a number with no scope.

**The single change:** rewrite the two cards — lead with the concrete ("Shipped to GA September 2022; replaced [competitor category] replay tools in enterprise deals"), scope the 10%. (Second: add a third card — this hero has room, and "adopted as the support workflow at N accounts" or the launch-quarter usage figure from the Heap-on-Heap chart would fill it with the study's own data.)

Closing portfolio note, with all four studies now audited: the lanes are **Software Observability = 0→1 breadth · Data Health Monitor = systems depth · Path Analysis = shipped outcomes · Session Replay = interaction craft + collaboration.** The recurring fixes are the same five across all four — metric scoping, engineering scenes, persona/customer presence, duplicated impact blocks, and junior-register tone in reflections — which means one revision pass, applied consistently, upgrades the whole portfolio at once. Fix them identically everywhere; the consistency itself will read as craft.
