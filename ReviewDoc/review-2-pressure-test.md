# Software Observability — Pressure Test of Review 1

Same reviewer, arguing against himself. Companion to `review-1-full-audit.md`.

---

## 1. The Top 5, after defending the other side

**#1 — "AI Prototype 02" captions on final designs.**
*Strongest counter:* the UI is unfinished, so those images may genuinely BE AI-prototype outputs standing in for finals — and honest labeling of AI-assisted work fits your technical positioning better than quietly relabeling them "Final Design."
*Verdict:* **Holds, reframed.** The defect isn't the caption, it's the *contradiction*: a headline that says "Final Design" over a caption that says "AI Prototype 02." Resolve it in either direction — swap in your real finals, or caption them "Final direction — production visuals in progress" — but the header and caption cannot disagree about who made the thing and whether it's done.

**#2 — ~30 display headers, hierarchy flattened.**
*Strongest counter:* on a page this long, frequent display beats are a pacing device; demote too many and you get exactly the walls of text you warned about. The component spec says display = section marker as much as emphasis.
*Verdict:* **Holds, narrowed.** Blanket demotion overcorrects. The real failure is two specific stretches: the three consecutive transition displays (§32–34) and the four feature headers (§43–47). Fix those two stretches and the remaining ~20 displays are defensible pacing.

**#3 — Modular design thesis buried in 40 words.**
*Strongest counter:* brevity IS emphasis. A single stark line can land harder than a built-out section, and expanding it risks infecting your best moment with the over-explanation disease the rest of the study has.
*Verdict:* **Holds, with the counter absorbed.** Keep it short — but a statement with no label is invisible in the skim layer, and a claim with no example is a slogan. The fix is a label plus ONE concrete instance of a view degrading gracefully, not a longer section.

**#4 — The feature-tour middle.**
*Strongest counter:* this is the strongest counter of the five. The role spikes on interaction design, and Customizable Columns / Drag-and-Drop / table anatomy is your interaction-design surface. Depth was explicitly wanted; cutting it guts the 15-minute read.
*Verdict:* **Holds, but the prescription changes.** Don't cut the content — collapse the *headers*. The cost is entirely in the skim layer, where four headlines for one idea reads as a site map. And note: static JPGs of a drag interaction prove nothing about interaction craft anyway — if this section is meant to carry the interaction-design claim, it needs motion (video/GIF), not more sections.

**#5 — Hedged impact, zero engineering presence.**
*Strongest counter:* hedged numbers are safer than inflated ones — "contributing to millions" may be the honest ceiling of what you can claim, and inventing build involvement you didn't have would be fatal in an interview.
*Verdict:* **Holds untouched.** The ask was never inflation. A velocity number and one true build moment either exist or they don't; if they exist, their absence is pure loss, and if they don't, that's a positioning problem no case-study edit fixes.

All five survived. None dropped. Two changed shape (#1 reframed, #4 re-prescribed), one narrowed (#2). The next issue in line — the empty "Full Prototype" card — didn't need promotion; it shows up as the #1 cost in the one-impression walk below anyway.

---

## 2. Cuts ranked by regret (cut deep at the top, carefully at the bottom)

**Zone A — a HM would never know these existed. Cut without ceremony:**
1. Duplicate Employee Drill-Down + Cost Breakdown cards; merge §56–57 into one distribution beat
2. Issue↔refinement duplicate pairs (Asset Count Badge, Region Filters, Table Headers, Row Heights ×2 each)
3. Second parallel-prototyping explanation (§29) → one clause
4. §34 "Together these sessions gave me clarity" — delete entirely, don't even demote
5. §30 Setting a Blueprint → folded into §29
6. §17 "With gaps identified…" → Block
7. Completion quote (§60)
8. Duplicate Publisher-logo / Category / Vendor rationale cards
9. Reflection card 4→3
10. §19 Core Attribute Intent header

**Zone B — a careful reader might notice; keep the substance, kill the container:**
11. §23 Utilization and Cost Summary — the "justify a reclamation, challenge a renewal" line is good; it needs to exist *once*, not the section
12. All Software Proto 1 obvious-column cards — keep spend-first sort and the 90-day inactivity choice, those two carry real judgment
13. §43 Tooltips — do NOT simply cut; the calculation-transparency idea is a trust signal. Demote the header, keep the idea

**Zone C — a HM would actually miss these. Merge headers only, lose nothing:**
14. §46–47 Customizable Columns + Drag-and-Drop — your interaction-design surface; collapse to one beat, never delete
15. §37–38 system-level table debt — the "found platform debt while doing feature work" story is a genuine senior signal; merging with §45 is fine, burying it is not
16. Anything inside Assumption→Finding→Decision (§15–16) — untouchable. Fix the copy/paste bug, change nothing else.

---

## 3. The one-impression test

Impression: **end-to-end owner + systems thinker who prototypes to think and drives teams through ambiguity.** Walk-through, using review-1 numbering:

**ADDS:** Intro impact blocks · Brief · Problem + Slack thread · "Nearly impossible" quote · Insights & Goals (§7) · Observability First (§9) · Data model (§10) · Parallel Prototyping (§13) · Glossary/intent doc (§14) · Assumption→Finding→Decision loop (§15–16) · Generating Events + iterations (§26–28) · both Issues sections' self-critique (§35–38) · "decision-making surface" headline (§39) · Scope & Trade-Offs (§52–53) · Distribution (§54–55) · Overview Revisit (§58) · Impact + goal mapping (§62–63)

**NEUTRAL:** metric cards (§5) · Research (§6) · Framework Adaptation preamble (§8) · All Software View / Software Profile intros (§18, §21) · What/When/Why/Who (§25) · Unifying Systems (§29–30) · final images · Next Steps

**DILUTES — ordered by what each costs you:**
1. **Empty "Full Prototype" card (§31)** — dead center of the "prototypes to think" claim, and the proof slot is literally blank. Costs the most because it's a broken promise, not just a weak section.
2. **"Final Design" / "AI Prototype 02" contradiction** — muddles ownership at the craft-proof moments.
3. **Transition-display stretch (§32–34)** — three headlines of connective tissue exactly where the skim story should be accelerating toward finals; plus "bringing multiple perspectives is a strategy I rely on" is résumé-speak inside a narrative.
4. **Feature headers §43–47** — converts "systems thinker" to "screen documenter" in the skim layer.
5. **Duplicate distribution sections (§56–57)** — one insight told three times reads as padding right before Impact.
6. **"I took the initiative" (§26 body)** — telling the trait instead of letting the situation show it; the section itself ADDS, the phrasing dilutes.
7. **Restatement layer (§19, §23)** — third telling of the profile's purpose; trains the reader to skim your bodies.
8. **Completion quote (§60)** — a status update in an emphasis slot cheapens your other two quotes.
9. **"Publisher logos strengthen product polish" card (§24)** — the one card in the study that sounds like decoration rationale; it's surrounded by decision rationale and suffers by contrast.

---

## 4. Missing evidence that's already in your hands

1. **You changed the platform's data model and describe it as a card footnote.** §16: "Added over-assignment as a distinct utilization state **across the data model and all views**" — paired with the §15 finding that over-assignment triggers publisher audits "costing organizations millions." The claim sitting right there: *I discovered a domain risk leadership hadn't modeled and it became a new state in the platform's schema.* That is the designer-touches-the-system proof the study otherwise lacks. Go confirm the state shipped into the production data model, name the conversation where engineering adopted it, and give this its own beat — it's simultaneously your systems-thinking and technical-credibility evidence.

2. **The Broadcom number is one click away and you made the reader do the click.** You link to XOPS's public Broadcom case study, then write "contributing to millions." Whatever figure that public page states, you can state — it's already public. Pull the number (or its range) into your impact card. If the public figure is genuinely unquantified, quote Broadcom's own outcome language instead of your hedge.

3. **"System-wide refinements" is the raise-the-bar claim, unclaimed.** §44: the table fixes were proposed platform-wide because the problems were "already visible in other lifecycle views." The stronger claim: *feature work on software shipped improvements to every lifecycle view in the platform* — which is the target role's "raises the craft bar across the company," nearly verbatim. Go find the blast radius: how many views adopted the pattern, and whether other designers/engineers picked it up. State it as scope ("adopted across all N lifecycle views"), not as styling rationale.

Runner-up: the living glossary (§14). If engineering or product kept using it after you moved on, that one sentence becomes "I created the shared vocabulary the team still works from" — a governance artifact with a lifespan. Worth one fact-check.

---

## 5. The 15-second verdict

Fifteen seconds buys the intro screen only: title, one-liner, Company/Gap/Role, three impact labels — and a **placeholder hero image**.

The copy layer earns a yes on its own: "0→1," "Millions Reclaimed in License Spend," "Broadcom," "Lead Product Designer" is a strong 15-second hand. But the first and largest thing on screen is an empty grey card, and at the 15-second altitude a missing hero doesn't read as "in progress" — it reads as "this portfolio isn't done," which for a *design* candidate is a verdict on the candidate, not the page. Today: **"come back when it's finished" — a soft no that has nothing to do with your story.**

The single flip: **put the final All Software view in the hero slot.** One image makes the 15-second read [real product] + [0→1] + [millions] + [Broadcom] + [Lead] — that's a yes from copy and evidence together, before a single section is read. (Second-most-likely flip, if the hero were already fixed: replacing "Millions Reclaimed" with the hard number from #4.2.)
