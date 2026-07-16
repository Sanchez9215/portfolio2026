# Software Observability — DECK VERSION (interview walkthrough, ~25 slides)

**Convention:** plain = your existing content · **bold = Claude-written** · `🔍 NEEDS YOU` = your memory required · Each slide: **ON SLIDE** (what's shown) + **TALK TRACK** (what you say — deeper than the site) + ⚠️ **EXPECT** (the question this slide invites — be ready).

Interview arc: *hook → stakes → how I learn → how I decide → how I handle uncertainty → the work → what I cut → what shipped → what I learned.* Target 30–35 min with questions.

---

**SLIDE 1 — Title.**
ON SLIDE: Software Observability, XOPS, Lead Product Designer, timeline.
TALK TRACK: **"This is a 0→1 story: a new product capability from a Slack ping to production, at a Fortune 500-serving startup. I'll show you how I make decisions when there's no spec, no data foundation, and no domain expertise to start from."** (Frames everything as decision-making, not screens.)

**SLIDE 2 — The ping.**
ON SLIDE: The MessageThread (leadership Slack after a sales call).
TALK TRACK: When a startup is at full velocity, high-priority initiatives don't begin with a formal spec. **Tell the real moment: who pinged, what the sales call revealed, what you did in the first 48 hours.**
> 🔍 NEEDS YOU: The specifics of that ping — who, what deal, what they asked for. This anecdote is your cold-open; vague version wastes it.

**SLIDE 3 — The problem.**
ON SLIDE: "Enterprise software data is spread across disconnected systems" + the 50% / $45M stats (with source).
TALK TRACK: IT, Finance and Ops make decisions off different numbers. Making aligned decisions on spend, compliance, allocation: nearly impossible. **One sentence on why this is a *platform* problem, not a feature request — it fit XOPS's core promise of unified operational truth.**

**SLIDE 4 — Starting from zero.**
ON SLIDE: "What did I know about software asset management? 0%".
TALK TRACK: I used Claude and ChatGPT to ramp on the problem space before sitting with experts — **not to learn the domain from AI, but to earn the right to have expert conversations at decision altitude instead of vocabulary altitude.** That groundwork let us move straight to decision making.
⚠️ EXPECT: "How do you trust AI-sourced domain knowledge?" — **Answer lives on slides 10–11: every assumption became a testable card put in front of people who'd lived the domain.**

**SLIDE 5 — Insights → Goals.**
ON SLIDE: The three insight/goal pairs.
TALK TRACK: Walk pair by pair. **Emphasize the experts' profiles (former CIO, former IT Director) — you validated with people who had owned this pain, not proxies.**

**SLIDE 6 — The framework move.**
ON SLIDE: Asset-framework → software-framework mapping (the two card rows + connectors).
TALK TRACK: XOPS already had an observability framework for devices and employees. **My job wasn't to invent a new product — it was to adapt software into a system users already understood. Overview, All-view, Profile, Insights: software inherited the grammar.** This establishes the foundation autonomous workflows operate on.
⚠️ EXPECT: "Where did the mapping NOT work 1:1?" — **have one example ready (licensing has no physical asset analogue; compliance exposure is contract-level, not unit-level).**

**SLIDE 7 — The data model.**
ON SLIDE: The five ContentHubs (Identification / Utilization / Compliance / Financial / Record Integrity).
TALK TRACK: Each data point was a building block toward a goal — a baseline, not a final spec. **Point at Utilization's nesting (Purchased → Assigned → Active/Inactive): that hierarchy IS the reclamation logic the whole product runs on.**

**SLIDE 8 — Designing for data uncertainty. (THE THESIS SLIDE)**
ON SLIDE: **One view shown twice — full data vs a category removed — layout holding.**
TALK TRACK: Data Ops had higher priorities; I didn't know which sources would survive integration. So: modular design — every view crafted so removing a metric or an entire category wouldn't break the experience or its story. **Then the payoff: when [X] data arrived incomplete, the design held without rework.**
> 🔍 NEEDS YOU: the real casualty — which source/field actually fell through, and what happened.
⚠️ EXPECT: "Give me a concrete example of modularity." — this slide must pre-answer it.

**SLIDE 9 — Prototyping as thinking.**
ON SLIDE: Claude prototype + two Figma Make prototypes, side by side.
TALK TRACK: Parallel prototypes to find where outputs converged, validate data groupings, pressure-test the IA before committing. **The method point: I don't prototype to present — I prototype to find out what I think.** Paired with a living glossary + intent doc so stakeholders debated substance, not vocabulary.

**SLIDES 10–11 — Assumption → Finding → Decision. (THE CREDIBILITY CORE — spend 5+ minutes)**
ON SLIDE (10): Prototype 1 with 4 assumption/finding pairs. ON SLIDE (11): Prototype 2 with the decisions.
TALK TRACK: Pick the three strongest arcs and tell them fully:
- **Over-assignment:** I assumed license pools had hard limits. Wrong — over-assignment happens, and non-compliance triggers publisher audits costing millions. **It became a new state in the platform's data model, across every view. A design-research finding changed the schema.**
- **Licensing models:** commercial-vs-open-source was the wrong split; subscription/perpetual/usage-based/EA is how cost behaves. Redesigned the License Overview around it and elevated its hierarchy.
- **Expiring licenses:** enterprise agreements operate at contract level — per-license expiration is irrelevant. Killed the insight, reframed on contract data.
⚠️ EXPECT: "How do you handle being wrong?" — **you just showed it, on purpose. Say so: 'I design assumptions to be falsifiable and put them in front of people who can falsify them.'**

**SLIDE 12 — The organizing question.**
ON SLIDE: "What is this software costing us and is it actually being used?"
TALK TRACK: Every Profile decision optimized for answering this in the first screenful — evidence to justify a reclamation, challenge a renewal, escalate a waste conversation, without leaving the platform.

**SLIDE 13 — Lifecycle events: moving without permission.**
ON SLIDE: Claude event output → refined milestone timeline.
TALK TRACK: Event definitions were pending from product and integration. Rather than wait, I established them myself — generated candidate events with Claude, found them too granular for enterprise scale, refined into reusable aggregate milestones leading with quantitative data points. **The prototype turned a blocked dependency into a productive cross-functional conversation.**

**SLIDE 14 — The connected prototype.**
ON SLIDE: **Recording of the navigable Overview → Catalog → Profile prototype.**
TALK TRACK: I tested the system as one experience, not views in isolation — so gaps in continuity, logic, and data consistency surfaced the way users would actually hit them.
> 🔍 NEEDS YOU: the recording (see web doc §21) + one gap this testing actually caught. Jog: what continuity break did someone hit moving from table to profile?

**SLIDE 15 — Two-track validation.**
ON SLIDE: Diagram: **Track 1 (Director of Product — strategy/buyer reality, weekly) · Track 2 (cross-functional sessions — CS, PM, engineering, advisors).**
TALK TRACK: Different mental models surface different failures. **One example of something engineering caught that design review never would.** (🔍 NEEDS YOU: that example.)

**SLIDE 16 — Self-critique: the first pass failed.**
ON SLIDE: Early All Software with issue annotations.
TALK TRACK: Early designs surfaced the right data but failed to make it actionable — dates without urgency, metrics without relationships. **I'm showing you my own rejected work because the gap between v1 and final is where the design judgment lives.**

**SLIDE 17 — Platform debt found during feature work.**
ON SLIDE: The table-pattern issues (headers, row heights, badge weight, overflow).
TALK TRACK: While solving All Software I found problems that would compound across every lifecycle view as the platform grew. **Feature work became a system-wide table standard — the refinements shipped to all lifecycle views, not just mine.**
> 🔍 NEEDS YOU: blast radius — how many views/teams adopted the pattern? Did other designers pick it up? "Raises the craft bar across the company" needs this number.

**SLIDE 18 — The final table.**
ON SLIDE: Final All Software (before/after if possible).
TALK TRACK: From data display to decision-making surface: publisher logos as visual anchors, color-coded utilization, the "Opportunity" column translating low usage into dollars, renewal countdowns replacing mental math. **The Opportunity column is the one to dwell on — it's the product thesis (data → dollars → action) expressed in a single cell.**

**SLIDE 19 — Trust as a design requirement.**
ON SLIDE: The three calculation tooltips.
TALK TRACK: Unifying data across systems creates a black-box risk. I surfaced metric definitions and calculation logic at the point of use — **when your product's job is to be the source of truth, showing your math is a feature, not documentation.**

**SLIDE 20 — The final profile.**
ON SLIDE: Final Software Profile.
TALK TRACK: Led with financial opportunity — the opportunity banner, split into inactive vs unassigned (reclamation vs over-purchasing), explicit reclaimable total. **Every element answers slide 12's question faster.**

**SLIDE 21 — What I cut, and why. (SENIORITY SLIDE)**
ON SLIDE: The three descoped features (Timeline, Device Tab, Financial Tab).
TALK TRACK: Lead with the Financial Tab: shipping with incomplete records would have cost customer trust during a critical evaluation period — **in an evaluation, one wrong number costs more than one missing tab.** The modular architecture (slide 8) is what made descoping cheap.
⚠️ EXPECT: "Who made the descope call?" — be precise about your role vs PM/leadership in each.
> 🔍 NEEDS YOU: that precision — who decided, what you recommended, where you disagreed.

**SLIDE 22 — Making waste actionable.**
ON SLIDE: Inactive License Distribution (charts → drill-down).
TALK TRACK: Phase 1's promise was confident reclamation, so the employee tab became an organizational breakdown of inactivity — where waste concentrates, who to target first, volume vs dollars, down to the exact license holders. **This is the screen that later powered the Broadcom outcome.**

**SLIDE 23 — Killing my own dashboard.**
ON SLIDE: Overview before/after the revisit.
TALK TRACK: Insights discussions revealed utilization and compliance would get dedicated dashboards — so I removed them from my Overview. **Deleting my own work to protect the system's information architecture: the system wins over the artifact.**

**SLIDE 24 — Impact.**
ON SLIDE: Impact cards mapped to the three goals (with the honest "Directional" on Goal 2).
TALK TRACK: 0→1 platform expansion; the views became core artifacts in enterprise sales conversations; foundation that later powered license optimization — **[the number] in unused license savings for customers like Broadcom.** On Goal 2: directional, not delivered — reconciliation was Phase 2. **Saying that out loud is deliberate: I want you to trust the other two claims.**
> 🔍 NEEDS YOU: the Broadcom figure; velocity (ping → production duration); one sales-moment anecdote (a demo reaction, a deal where these views mattered).

**SLIDE 25 — Reflection + arc close.**
ON SLIDE: Three lessons.
TALK TRACK: Every data point had to earn its place — pressure-tested against source, dependencies, and how a Fortune 500 team would act on it. Tangible artifacts move teams faster than discussion; AI compressed ambiguity-to-direction. **Close the arc: "This project is why I design systems, not screens — the same framework, data model, and table standard carried the next capability I built" → segues directly into the Data Health Monitor story if they want more.**

---

### Prep list (do before the interview)
1. Broadcom number · 2. velocity timeline · 3. the engineering/schema story (over-assignment) · 4. the descope decision-owner detail · 5. one validation catch per track · 6. the connected-prototype recording · 7. the data casualty for slide 8.
**Every ⚠️ EXPECT above is a question you can now cause on purpose. That's the difference between defending a portfolio and steering an interview.**
