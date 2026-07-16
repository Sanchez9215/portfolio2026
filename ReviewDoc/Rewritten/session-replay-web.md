# Session Replay (Heap) — WEB VERSION (scannable, HM-facing)

**Convention:** plain = your existing copy · **bold = Claude-written** · `🔍 NEEDS YOU` = memory required · `[component]` = structural weight · `🎨 VISUAL` = storytelling idea.
Portfolio lane: **interaction craft + collaborating at scale.** Structural rules applied: acquisition-expert frame unified as the opener · persona honesty resolved · Constraints elevated to the systems beat · research→MVP gap closed with one sentence · results rebuilt · reflection tone fixed.

---

## 1. Intro `[SectionIntroduction]`
Title decision first — > 🔍 NEEDS YOU (pick one):
- **A. Keep "Session Replay: Support Teams"** and disclose the research proxy in §5 (only if the disclosure sentence is honest — see there).
- **B. Retitle: "Session Replay: From Recording to Investigation"** — matches what the evidence actually supports.
One-liner: Helping support teams understand customer behavior and identify root causes through session replay.
Meta: Company **Heap — digital insights platform** · Role Lead Product Designer · Timeline Q3–Q4 2022 · Team: 1 PM, 1 Staff product designer, 1 developer · Contribution: Research, Scoping, Design, QA.
> 🔍 NEEDS YOU: one clause on the Staff designer split — **"I owned the player experience end-to-end; [name/role] partnered on ___."** This is the first probing question the study generates; answer it before it's asked. Jog: what did they actually review/own — design-system alignment? critique only?

Impact blocks — **rebuilt (currently the weakest metric row of your four studies):**
1. **Shipped to GA September 2022** — [one clause on scope: the event list, session details, and player foundation].
2. Key factor in closing replay-tool replacement deals — > 🔍 NEEDS YOU: which competitor category was being displaced (FullStory? LogRocket? Hotjar?) and one deal detail. Even "replaced [competitor] at __ enterprise accounts" at category level.
3. Contributed to a 10% increase in session replay viewing — > 🔍 NEEDS YOU: scope it (10% of what, over what window — the Heap-on-Heap chart has the answer).

🎨 VISUAL — keep the player hero video. **This hero has room for a third impact card — fill it with the strongest scoped number from the Heap-on-Heap chart.**

## 2. The Acquisition Frame `[LabelBlock display + Blocks]` — **NEW opening beat: unifies "Background" + "Past Experience" + the Reflection's adaptation paragraph**
**"Heap acquired Auryc — and with it, replay domain expertise. I was that expertise."** Heap was in the early stages of a native session replay tool; the player lacked the context support teams needed to move from watching to analyzing — troubleshooting issues, assessing impact. **Two quarters into a new company, a new 10-designer org, and an unfamiliar process, my job was to ship the acquirer's flagship gap.**
From Auryc I already knew what replay needs beyond the recording — my starting hypotheses: Page URL context, Session Details, and an event list (activity log). **Hypotheses from domain experience — then validated, not assumed** (→ §5).
**Tone rule applied: expertise transfer, not chaos survival — no adjectives about the acquisition.**
🎨 VISUAL — **side-by-side: the Auryc player (your prior work) next to Heap's early player — the expertise-transfer argument in one image. You already have both screenshots.**

Keep the "What's session replay?" explainer as one tight Card (HMs may not know the category) — half current length.

## 3. Opportunity `[QuoteBlock or display]`
How can session replay empower support teams to better understand customer behavior and pinpoint problem roots?

## 4. Solution Validation `[display + QuoteBlock/Cards ×4]`
To validate, I interviewed 6 product managers who walked me through their last real session-replay experience.
**The persona disclosure (required — pick per your title decision):** > 🔍 NEEDS YOU: why PMs and not support agents? If true, say it plainly: **"Mid-acquisition, customer support orgs weren't accessible on our timeline; the PMs interviewed triage alongside their support teams and had run these investigations firsthand."** If that's not accurate — what was the real reason? The silent mismatch is the only wrong option.
Keep all four insight→quote→implication cards intact — **this structure is already the new format's pattern; port it whole.** The Europe-login quote (spotting a regional bug from UI details) — **promote to a QuoteBlock; it's the best research quote in the portfolio.**
**Close the research→MVP gap (one sentence, at the section's end):** **"Four needs surfaced; the data constraint (next section) deferred search and session-history to post-MVP — the event list and session details were the pieces that could ship."**

## 5. The Constraint `[display + Cards]` — **ELEVATED: the study's systems beat**
We received feedback that the event list was limited by replay's early stage — > 🔍 NEEDS YOU: from whom? Name the discovery moment ("**engineering flagged in [review] that…**"). Auryc's data didn't yet match Heap's data model: no defined events available — only URL paths, JS errors, and clicked text.
The Challenge (keep, it's strong): display actions in a way that is flexible and informative, **visually distinct from defined events so users understand the player's limits without being told** — and architected so analysis features slot in once the data matches.
Keep the defined-events explainer as one tight card (the section depends on the concept).
🎨 VISUAL — **data-boundary diagram: two circles/columns — "What Heap's model defines" vs "What replay could capture today" — with the overlap labeled as the MVP's raw material (URLs, JS errors, click text). This is the study's CMDB-mapping equivalent: the constraint drawn, not described.**

## 6. Sketch → Wireframe → First Prototype `[SectionImg]` — *three legacy sections, one arc*
I explored solutions by sketching feature components with research insights top of mind, detailed them into wireframes for stakeholder approval, then built a quick prototype for the design and product teams to interact with. The feedback converged on one problem: the event list didn't appear interactive at first glance. **That finding drove everything that follows.**
🎨 VISUAL — keep the feedback-overlay artifact (the prototype video with team annotations on it) — **it's real collaboration texture; caption it as "design-team feedback round."**

## 7. Design Iterations `[SectionImg ×2 with decision Cards]` — **the portfolio's interaction-craft core — migrate at full fidelity**
Chunky Event List — keep copy: solid drop shadow signaled clickability; testing showed users read elements as clickable but couldn't see the *two* actions (jump-to-moment vs expand details); and we weren't committed to "chunky" platform-wide. **Two kill reasons: interaction ambiguity and system-level consistency — the second one is a design-system judgment, not a taste call.**
Two-Piece Event List — keep copy: border + hover shadow per action, playback highlighting, chosen for cleanly separating navigation from detail. Icons removed **to avoid defined-event association — a semantic decision protecting users from over-reading the data (the §5 constraint, enforced at the pixel level).** URL dropdown and Open-in-New-Tab postponed for testing.
🎨 VISUAL — keep both iteration videos. **The motion is the argument; never replace these with stills.**

## 8. Killing the Timeline `[SectionImg + decision Card]` — *retitled from "Other Explorations"*
Keep: leadership asked for a vertical timeline to tie the list to playback; we built both variants properly, evaluated, and dropped it — the event-list animation already provided the same affordance. **Leadership's idea, honored with real exploration, killed with a reasoned equivalent. The artifact did the disagreeing.**

## 9. The Handoff `[display + Block]` — *expanded from one clause*
Once the team aligned on the two-piece list, I built the final prototype implementing all collected feedback and walked engineering through every interaction in detail.
> 🔍 NEEDS YOU — this is the study's contributes-to-code evidence; expand to 3 sentences: what the walkthrough covered (hover/active/playback-sync states? timing? edge cases like zero-event sessions?), one question the developer asked, one thing implementation reality changed. Jog: what broke or got simplified between prototype and build?

## 10. Bug Bash → GA `[display + ImgCard video]`
Keep: once engineering's build was testable we held a bug bash to stress the player, fixed high-priority issues, and moved to general availability.
> 🔍 NEEDS YOU: one bug you personally caught and what "high priority" meant. The QA credit in your meta is invisible without it. Jog: what did you log — playback desync? event-list scroll issues?

## 11. Results `[display + Cards + ImgCard]` — *rebuilt*
Launched September 2022. **Then narrate the Heap-on-Heap chart instead of the current vague "there was a spike":** > 🔍 NEEDS YOU: the chart's axes, window, and baseline — write the sentence the chart proves ("replay views per week rose __% in the two months post-launch"). **The chart is a dogfooding artifact — Heap measuring Heap with Heap — say that out loud; no other study has it.** Deals card per §1 note.
Keep the Release Announcement as an ImgCard — **external proof the launch mattered; caption with the publication/date.**

## 12. Reflection `[Cards ×2]` — *tone-fixed; ~60% shorter*
Keep "What Would I Do Different" nearly whole (it's the most honest paragraph in all four studies): I could have expedited decisions by bringing Auryc customer testimonials and data to Heap stakeholders — gathering it mid-integration proved difficult. **The general lesson: when you're the acquired expertise, your old evidence is an asset — extract it before the integration buries it.**
Replace "What Went Well" with the senior framing: **"Calibrating to a scaled design org: my first 10-designer critique culture after years as a team of two. I learned to bring work earlier and rougher — and to return the favor: the workshops I brought this project into became a venue other designers used for theirs."**
> 🔍 NEEDS YOU: is that last clause true (did your workshops get reused)? If not, swap for what you genuinely contributed back. **Cut entirely: "my first impactful contribution," "opened my eyes," the process-tourism paragraph.**

## 13. **Afterlife** `[display]` — **NEW closing beat**
> 🔍 NEEDS YOU: The Challenge card promised "once the data matches defined events, other analysis features can be easily introduced." Did that happen — did Heap's replay grow analysis features on your event-list architecture after the data unified? If yes: **"The architecture carried defined events when the data unified in 202_ — the future-proofing held."** That's a validated architecture decision, checkable years later. Jog: what does Heap's replay player look like today vs your shipped version?
**Cross-reference line (the portfolio arc):** **"The replay-context instincts here came from building Path Analysis at Auryc — the expertise Heap acquired."**

---

### Visual storytelling summary (build priority order)
1. **Data-boundary diagram (§5)** — the constraint, drawn
2. **Auryc player ↔ Heap player side-by-side (§2)** — the acquisition frame in one image
3. **Both iteration videos + timeline-kill videos (§7–8), full fidelity** — the craft proof
4. **Narrated Heap-on-Heap chart (§11)** — the study's only quantitative artifact, currently unexplained
5. **Feedback-overlay artifact (§6)** — collaboration texture
6. **Release announcement (§11)** — external validation, keep prominent
