# Path Analysis (Auryc) — DECK VERSION (interview walkthrough, ~18 slides)

**Convention:** plain = your content · **bold = Claude-written** · `🔍 NEEDS YOU` = memory required · ON SLIDE / TALK TRACK / ⚠️ EXPECT per slide.

Interview arc: *lost deals → build-vs-buy → research at the source → strategy in two phases → learning a hard visualization form → shipped → adopted → measured.* This is your **proof story** — the one where everything shipped and got used. It's also the earliest work you'll show, so the frame matters: **present it as where your method started, not as your best craft.** Target 20–25 min (shorter than the XOPS decks — leave room for them).

---

**SLIDE 1 — Title.**
ON SLIDE: Path Analysis · Auryc · Lead Product Designer · Q3–Q4 2021 · team of 5.
TALK TRACK: **"This is the story I tell when someone asks whether my work ships. Two quarters, a team of five, a feature that was losing us deals — and the adoption and revenue data from what we built. It's also where the method you saw in my XOPS work started."**

**SLIDE 2 — The bleed.**
ON SLIDE: Feature gap → lost customers; broken Looker experience.
TALK TRACK: Path analysis was the most requested capability from customers and leads. Our answer was a Looker integration that required support tickets to configure and training to read. **Prospects compared us against tools where this was native — and we were losing on it.**
> 🔍 NEEDS YOU: the stakes specifics — a lost deal, a churn, or how often this surfaced in sales debriefs.

**SLIDE 3 — Build vs buy.**
ON SLIDE: More Control / More Value.
TALK TRACK: Native build gave us behavior and UX control — but the real argument was value: Auryc uniquely held session replay, behavioral analytics, AND customer feedback. **No competitor could put all three inside a path. Building native wasn't parity — it was the only route to differentiation.**
⚠️ EXPECT: "Who made the build call?" — be precise about your part (🔍 NEEDS YOU).

**SLIDE 4 — Auditing what we had.**
ON SLIDE: The old tool, annotated with its three failures.
TALK TRACK: Required technical expertise to use, overwhelming to read, and surfaced none of our strengths. **Three failures that became the three goals: Easy, Insightful, Clear.**

**SLIDE 5 — Research at the source.**
ON SLIDE: The four customer quotes (attributed at segment level).
TALK TRACK: Instead of scheduling research, I joined sales and support calls — where the pain was already being spoken. **Read one quote aloud — the rage-clicks ask ("if you could incorporate rage clicks into path analysis, that would be amazing") — then the punchline: "that's a customer writing our Phase 2 roadmap for us."**
⚠️ EXPECT: "Why not formal research?" — **answer honestly: speed and access; two quarters, and the calls were happening anyway. The findings converged with the audit, which was the validation.**

**SLIDE 6 — The competitive map.**
ON SLIDE: The competitive matrix artifact + 4 competitor screenshots.
TALK TRACK: Best practices confirmed (sankeys win; noise control is mandatory) and gaps found: thin tooltips, replays separated from charts, almost nobody surfacing frustration. **The gap list and Auryc's strengths list were the same list. That's when the strategy wrote itself.**

**SLIDE 7 — Two phases. (THE STRATEGY SLIDE)**
ON SLIDE: Phase 1 Foundation / Phase 2 Integrating Strengths, with the quote→feature trace lines.
TALK TRACK: With my PM: Phase 1 ships the table stakes — read-only charts, noise handling, defined events. Phase 2 ships what only we could — replay in the path, frustration signals, metric tooltips. **Foundation first, differentiation second. This phasing instinct is the same layered-architecture thinking I later formalized at XOPS — you saw it survive a pivot in the Data Health story.**

**SLIDE 8 — Query builder, three attempts.**
ON SLIDE: V1 / V2 / shipped, with pros-cons.
TALK TRACK: V1 followed the existing query pattern — easy to build, unreadable. V2 read like language — but testing showed users missed "Include" entirely. Shipped version: exposed analysis options, grouped path parameters. **And the step-count selector — which I added partly as a probe, packaging the design with an effort question so engineering sized it in the same review. Low effort, high flexibility; it shipped.**
⚠️ EXPECT: "How did you test?" — 🔍 NEEDS YOU: participants and method for the V2 finding.

**SLIDES 9–10 — Learning the sankey. (THE CRAFT CORE)**
SLIDE 9 ON SLIDE: old table → your hand-translated first chart.
TALK TRACK: The chart was the hardest problem — I'd never designed a sankey. First move: translate the existing table into a chart by hand, **to understand what every row meant before styling anything.** Second: open dev tools on competitors' charts and read how their implementations structured paths and events.
> 🔍 NEEDS YOU: one concrete dev-tools finding — what you took, what you rejected.
SLIDE 10 ON SLIDE: the final chart, hotspot-annotated with 3–4 decisions.
TALK TRACK: **Walk the decisions (reconstructed from the artifact): how noise stays readable, why repeated paths collapse, how labels survive density, how traffic weight reads at a glance.**
> 🔍 NEEDS YOU: these are the cards from web-doc §11 — this slide cannot exist without them, and it's the slide that proves the craft.
⚠️ EXPECT: "Walk me through a sankey design decision." — slide 10 IS the answer; without it you have "the team reviewed it and it was done."

**SLIDE 11 — Noise control: two methods, one descope.**
ON SLIDE: Toolbar exclusion vs on-chart exclusion (videos).
TALK TRACK: Toolbar for users who know what to cut; on-chart for in-flow refinement. On-chart was pushed to Phase 2 under the timeline — **the toolbar covered the need; the refinement was additive, not blocking. Descope the delight, never the job.**

**SLIDE 12 — Phase 1 shipped.**
ON SLIDE: Phase 1 video + feature list.
TALK TRACK: Read-only inbound, outbound, end-to-end; exclusion; collapsed repeats. **Date it.** (🔍 NEEDS YOU: ship date.)

**SLIDE 13 — Phase 2: the differentiation.**
ON SLIDE: Phase 2 video + the quote-trace callbacks.
TALK TRACK: Tooltips with real metrics, frustration events, JS errors, replay access from the path, event definition. **Point back at slide 5: every item answers a customer's recorded ask. Demand-driven, not roadmap-driven.**

**SLIDE 14 — In production.**
ON SLIDE: The live production video.
TALK TRACK: Minimal. Let it play. **"This is the live product."** (The strongest sentence available to any designer.)

**SLIDE 15 — Ship, watch, fix.**
ON SLIDE: The info-icon post-launch addition.
TALK TRACK: After launch, analysis terminology confused unfamiliar users — we shipped info icons with definitions and examples. **Tell the detection story — especially if you watched Auryc replays of users using path analysis: your feature, watched through your own product.** (🔍 NEEDS YOU: the detection mechanism.)

**SLIDE 16 — Results, scoped. (THE DEFENSIBILITY SLIDE)**
ON SLIDE: Metrics mapped to goals: Easy → 78% adoption · Insightful → +15% expansion, 92% retention · business → ARR context.
TALK TRACK: **Lead with adoption — 78% of accounts. Then give each number its scope out loud before they ask: "measured across…", "from a baseline of…". Present the caveats as rigor, not defense.**
> 🔍 NEEDS YOU: the scopes (see web doc §1). ⚠️ EXPECT: "How much of that ARR is attributable to you?" — **the honest answer, prepared, beats the bold answer, improvised.**

**SLIDE 17 — Reflection.**
ON SLIDE: Three lessons (go where pain is spoken / learn the form before styling / foundation then differentiation).
TALK TRACK: Brief — this deck's power is the shipping, not the philosophizing.

**SLIDE 18 — The arc close.**
ON SLIDE: One line: **Auryc → acquired by Heap.**
TALK TRACK: **"A year later, Heap acquired Auryc — in part for exactly this expertise. The next story is what happened when the acquiring company handed me their session replay player."** (Direct segue to the Session Replay deck; the two studies corroborate each other — use it.)

---

### Prep list
1. Sankey decision cards (slides 9–10 — the deck fails without them) · 2. metric scopes + attribution answers · 3. testing method for V2 · 4. stakes number for slide 2 · 5. ship dates · 6. the info-icon detection story · 7. dev-tools finding.
**This deck's job in a loop: prove you ship and that outcomes follow. Keep it tight, land the production video, and spend the saved minutes on the XOPS decks where the seniority argument lives.**
