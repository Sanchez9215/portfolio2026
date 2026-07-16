# Session Replay: Support Teams (Heap) — Full Case Study Audit + Migration Map

Same reviewer stance as reviews 1, 3, and 5: hiring manager screening for Senior Product Designer, technical, product-led B2B SaaS, judging one impression — **end-to-end owner + systems thinker who prototypes to think and drives teams through ambiguity.**

Read basis: the legacy `SessionReplay.html` content in full. UI/markup ignored per scope; verdicts prescribe the new component vocabulary.

**Portfolio position:** with all four studies now audited, each has a lane — Software Observability is 0→1 breadth, Data Health Monitor is systems depth, Path Analysis is shipped outcomes. This one's lane is **interaction craft + collaborating at scale** — motion-documented iterations with real decision rationale, a design team of ten, an engineering walkthrough, a bug bash. Migrate it to own that lane; don't force it to compete on systems scope it doesn't have (an event list inside a player is a feature, not a platform — and that's fine if the study knows it).

---

## TL;DR — the 5 highest-leverage changes

1. **The title names a persona the evidence never meets.** "Session Replay: Support Teams" — then validation is 6 *product manager* interviews, no support agent appears anywhere, and no support outcome (time-to-resolution, tickets deflected, escalations avoided) is ever measured. A sharp HM catches this in one pass and it taxes everything: the quotes, the goals, the results. Two honest fixes — disclose the proxy and why ("support teams weren't reachable during the integration; PMs who triage alongside them were") or retitle around what the evidence actually supports (investigation/troubleshooting workflows). Pick one; the current silent mismatch is the worst option.

2. **The impact section is two hedged cards, duplicated verbatim, with the evidence sitting unexplained beside them.** "Key factor in closing deals for replay tool replacement" — which deals, replacing which tool? "Contributed to a 10% increase in session replay viewing" — of what baseline, and *viewing* is a usage proxy, not the support outcome the whole study promises. Meanwhile the "Heap on Heap" chart — you measured your own feature with the company's own analytics product, a dogfooding proof no other study has — appears with zero narration. Explain the chart, get one deal specific, scope the 10%, and cut the hero/results duplication.

3. **The acquisition story is your differentiator and it's scattered across two sections.** The real frame: Heap acquired Auryc, and you — the acquired company's replay domain expert — shipped the acquirer's flagship gap in your first two quarters, integrating into a new org, a 10-designer team, and an unfamiliar process while doing it. That's the drives-through-ambiguity narrative, currently split between a modest "Past Experience" section and a Reflection paragraph about "the chaotic environment of an acquisition." Unify it as the study's opening frame — expertise transfer under ambiguity, not circumstance survival.

4. **The Constraints section is the study's one true systems beat — elevate it.** Auryc data didn't match Heap's data model, so the player could only show URL paths, JS errors, and clicked text — and your response was a *semantic* design decision: visually distinguish raw actions from defined events so users understand the limitation, architected so analysis features slot in "once the data matches." Even the later icons-removed decision ("to avoid defined event association") belongs to this beat. That's designing a data-model boundary into the UI and future-proofing against it — the exact XOPS-study muscle, present here in miniature and buried mid-page.

5. **Research surfaces four needs; the MVP ships one; nothing explains the gap.** Past-session access, in-session search, session details, event log — the quotes validate all four, then the iterations cover only the event list. Without one scope sentence (descoped? phased? killed by the data constraint?), the research section reads as theater disconnected from the build. The constraint section probably *is* the answer for most of it — draw the line explicitly.

---

## Structural hierarchy audit + migration map

| # | Legacy section | Content verdict | New-format home | Why / what's missing |
|---|---------------|-----------------|-----------------|----------------------|
| 1 | Hero (title, one-liner, player video, 2 result cards) | **Keep video; rebuild cards; consider retitle** | `SectionIntroduction` | The player video is a strong open. The two metric cards are the weakest impact row of your four studies (TL;DR #2). Title decision per TL;DR #1. |
| 2 | About Heap + meta (role, Q3–Q4 2022, contribution, team) | **Keep; address the Staff designer** | Intro meta LabelBlocks | "Lead product designer" with a Staff product designer on the team invites the ownership question every senior interview asks. One clause on the split ("I owned the player; the Staff designer partnered on X") converts a risk into collaboration evidence. |
| 3 | Background + The Problem + "What's session replay?" | **Keep, tighten** | display + Cards | Problem card is decent. The explainer card earns its place (HMs may not know replay) but at half length. |
| 4 | Opportunity (HMW) | **Keep** | display or QuoteBlock | Fine as the framing question. |
| 5 | Past Experience (Auryc knowledge → 3 proposed enhancements) | **Merge into the acquisition frame** | display + Cards | See TL;DR #3. Also fix the sequence smell: "helped me arrive at some quick solutions" *before* the validation section reads as solution-first research. Reframe: hypotheses from domain experience, then validated — which is what actually happened. |
| 6 | Solution Validation (6 PM interviews, 4 quote cards) | **Keep — strongest research artifact in the portfolio; fix the persona** | display + QuoteBlocks/Cards | The only study that states its n. The insight → verbatim quote → implication card structure is *already* the new format's pattern — port it intact. The Europe-login quote (spotting a regional bug from UI details) is the best quote in all four studies. Persona disclosure per TL;DR #1. |
| 7 | Sketching Solutions | **Merge with Wireframes** | `SectionImg` | Two sections ("get everything on paper," "share with stakeholders") for one sketch→wireframe beat. |
| 8 | Constraints + The Challenge + defined-events explainer | **Elevate hard** | display + Cards | See TL;DR #4. The best section; currently reads as a speed bump between sketches and wireframes. |
| 9 | Wireframes | **Merged into #7** | — | |
| 10 | First Prototype (feedback overlay) | **Keep, fold into the iterations run** | `SectionImg` | The feedback-annotations-on-video artifact is good texture; the finding ("event list didn't appear interactive") is the setup for the iterations — connect them as one arc. |
| 11 | Design Iterations (Chunky / Two-Piece, each with Decision) | **Keep — the portfolio's interaction-craft core** | `SectionImg` ×2 with decision Cards | Motion-documented iterations with real trade-off rationale (two-actions ambiguity, platform-wide style commitment, icons removed for semantic reasons). This maps 1:1 to the new format and is the strongest per-section evidence of "interaction design spike" you own. Migrate with the videos — the motion IS the argument. |
| 12 | Other Explorations (timeline variants) | **Elevate the pushback** | `SectionImg` + decision Card | You built leadership's idea properly, evaluated it, and killed it with a reasoned alternative ("the animation provides the same affordance"). Disagreeing with leadership via artifacts is a senior beat hiding under a throwaway header. |
| 13 | Final Prototype ("walked engineering through all the interactions in detail") | **Expand — this is technical gold compressed to a clause** | display + Block | An interaction-spec walkthrough with engineering is exactly the contributes-to-code adjacency the target role wants. What did the spec cover — states, timing, edge cases? Three sentences. |
| 14 | In Production (bug bash → GA) | **Expand slightly** | display + ImgCard | Bug bash + QA credit: what did *you* log or catch? One concrete bug makes the QA contribution real. |
| 15 | Results + Heap on Heap chart | **Rebuild** | Impact CardRow + ImgCard | TL;DR #2. September 2022 launch date is good — keep dates. "There was a spike in session replay usage" is the vaguest sentence in the study, sitting directly above the chart that could quantify it. |
| 16 | Release Announcement | **Keep — unique proof** | ImgCard | External, public evidence the feature mattered enough to announce. No other study has this artifact type. |
| 17 | Reflection (adaptation + What Would I Do Different / What Went Well) | **Keep structure; cut half; fix tone** | Reflection Cards | The only legacy study with a reflection — and "What Would I Do Different" (should have brought Auryc testimonials/data to expedite decisions) is genuinely self-aware; keep it whole. But "my first impactful contribution," "hearing from 10 other talented designers really opened my eyes," and the process-tourism paragraph read junior — a senior frames the same facts as *calibrating to a scaled design org and contributing back to it*. Trim "What Went Well" by ~60%. |

**Skim-layer verdict:** headers are process-generic (Sketching, Wireframes, First Prototype, Design Iterations) — a skimmer sees a design-school arc, not decisions. But the *images* skim brilliantly: four different iteration videos in motion is a craft signal no header can fake. Migration should fix the headers (name the decisions: "Killing the Timeline," "Actions vs Defined Events") and trust the videos.

---

## Story gaps (ordered by damage)

1. **The persona mismatch** (TL;DR #1) — title, research subjects, and measured outcomes are three different things.
2. **Validated needs vs shipped scope** (TL;DR #5) — one sentence closes it, likely pointing at the Constraints section.
3. **Ownership vs the Staff designer** — unaddressed, and it's the first probing question this study generates.
4. **No support outcome measured** — the premise was faster troubleshooting; the metric is viewing volume. If time-to-resolution data never existed, say what you'd have measured.
5. **"Key factor in closing deals" has no deal** — one anecdote (which competitor was displaced, what the prospect said) or soften the claim.
6. **The Heap-on-Heap chart is unexplained** — axes, baseline, the 10%: narrate your own evidence.
7. **What you personally did in QA/bug bash** — claimed in meta, invisible in the story (same gap as Path Analysis).
8. **"We received feedback that the event list was limited"** — from whom? The constraint's discovery moment is passive-voiced away.

---

## Repetition map

Short study; the repetition is structural, not verbal:

| Beat | Where | Fix |
|---|---|---|
| The 2 result cards | Hero + Results, verbatim | Same rule as Path Analysis: raw claim up top, explained/quantified version at the close — never identical |
| "Save time and effort" | 2 of the 4 quote-card implications | Vary; the implications shouldn't share a benefit clause |
| Sketch→wireframe→prototype telling | §7, §9, §10 all say "I sketched/put on paper to share and get feedback" | One arc, told once (merged sections) |

**Portfolio-level:** this study and Path Analysis are structural siblings (quotes → iterations with pros/cons → production → results). Fine — but they now also share the *same weakness pattern* (hedged results, invisible QA, passive constraint discovery). Fix them the same way in both and it reads as a matured designer revising honestly.

---

## Impact & systems-thinking fixes

**Already strong — protect through migration:**
- The Constraints beat: designing the data-model boundary into the UI semantics, future-proofed (TL;DR #4).
- The iteration decisions, especially icons-removed-for-semantic-reasons and the two-actions ambiguity finding.
- Killing leadership's timeline idea with a reasoned equivalent.
- The n=6 stated sample and the insight→quote→implication card structure.
- Bug bash, engineering walkthrough, September 2022 date, release announcement.
- "What Would I Do Different" — real self-critique with a mechanism.

**Push harder:**
- The acquisition-expert frame (TL;DR #3) — it's also the portfolio's only cross-company thread: Path Analysis shows you *building* replay-adjacent analytics at Auryc; this shows Heap *acquiring* that expertise. Two studies corroborating each other is rare — link them explicitly.
- The 10% viewing increase: scope it, then connect it to the business logic (viewing → analysis adoption → the deals card).
- "Once the data matches defined events, other analysis features can be easily introduced" — did that happen after launch? If yes, your future-proofing claim has a payoff sentence available.

---

## Thin ice (passages too thin to survive the new format)

1. **"I reviewed once more, walked engineering through all the different interactions in detail, and development began."** → The engineering handoff — the target role's core evidence — compressed into a transition clause. Direction: what the interaction spec covered, one question engineering asked, one thing you changed because of implementation reality.
2. **"There was a spike in session replay usage."** → Direction: the number is in the chart below it; write the sentence the chart supports.
3. **"We held a bug bash meeting to stress test the player and log any unusual behavior."** → Direction: one bug you personally caught, and what "high priority" meant.
4. **"We received feedback that the event list was limited…"** → Direction: name the source and the moment — this is the discovery scene for your best section.
5. **Reflection, "What Went Well"** → the inverse problem: not thin but inflated and inward. Direction: cut the process tourism; keep one sentence on calibrating to a 10-designer org and one on what you contributed back to the workshops, not just took.

---

## What the HM says out loud

**After the 60-second skim:**
> "Four iteration videos, all in motion, with decision cards — this person can actually do interaction design, that's the spike I'm hiring for. Real quotes, a release announcement, a reflection section. Smaller scope than their other studies but that's fine. The results row is weak — two soft cards — and hold on, the title says support teams but the quotes are from PMs? Keep reading, with one eyebrow up."

**After the full read:**
> "The craft is real and the constraint handling is quietly the best thing here — they designed a data-model limitation into the UI semantics and future-proofed it. Killing the leadership timeline idea with a reasoned alternative is a senior move. But the study never measures the thing it promised — support outcomes — never explains why PMs stood in for support agents, never tells me what the Staff designer did versus them, and ends on a reflection that sounds like someone's first big project because it says it was. Interview: yes, as the interaction-craft candidate — and I'd open by asking who owned what, which is exactly the question this study should have pre-empted."
