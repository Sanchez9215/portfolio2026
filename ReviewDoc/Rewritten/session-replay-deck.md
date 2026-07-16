# Session Replay (Heap) — DECK VERSION (interview walkthrough, ~16 slides)

**Convention:** plain = your content · **bold = Claude-written** · `🔍 NEEDS YOU` = memory required · ON SLIDE / TALK TRACK / ⚠️ EXPECT per slide.

Interview arc: *acquired expertise → new org, new constraints → validated hypotheses → designing inside a data boundary → iteration craft → pushing back on leadership → handoff and ship → measured with our own product.* This is the **craft + collaboration** deck — the shortest of the four, and the one that shows you inside a scaled design org. Pairs with the Path Analysis deck (its explicit prequel). Target 18–22 min.

---

**SLIDE 1 — Title.**
ON SLIDE: Session Replay · Heap · Lead Product Designer · Q3–Q4 2022.
TALK TRACK: **"Heap acquired Auryc — and with it, replay domain expertise. I was that expertise. This is what happened when the acquiring company handed me their flagship gap: new org, ten-designer critique culture, a data model that couldn't yet support what I knew users needed. Two quarters later it was in GA."**

**SLIDE 2 — The setup.**
ON SLIDE: Heap's early player next to the Auryc player you'd designed.
TALK TRACK: Heap's native replay was early — a recording with none of the context support teams need to move from watching to analyzing. I'd already solved this problem once (**point at the Auryc player: Page URL, session details, activity log**). My starting hypotheses came from that work — **but hypotheses from a different product's users are still hypotheses. So: validate first.**
⚠️ EXPECT: "How was working at the acquirer vs the startup?" — **have the calibration answer ready (slide 15's material): earlier, rougher work into critique; more structured process; you adapted fast and it made the work better.**

**SLIDE 3 — Validation.**
ON SLIDE: The four insight→quote→implication cards; the Europe-login quote enlarged.
TALK TRACK: Six interviews, each walking me through their last real replay investigation. **Read the Europe quote aloud — a user spotting a regional bug purely from login-UI details — "that's the job we're designing for: investigation, not playback."** Needs surfaced: past-session access, in-session search, session details, an action log.
⚠️ EXPECT: "Why PMs for a support-team feature?" — **give the disclosure before they ask** (🔍 NEEDS YOU: the honest reason — mid-acquisition access? PMs as hands-on triagers? Decide once, per the web doc, and use it verbatim here).

**SLIDE 4 — The constraint. (THE SYSTEMS SLIDE)**
ON SLIDE: Data-boundary diagram — Heap's defined-event model vs what early replay could capture (URLs, JS errors, clicked text).
TALK TRACK: Then the ceiling: Auryc's data didn't yet match Heap's model. No defined events — the building block of every Heap analysis — only raw actions. **Four validated needs, one shippable slice: search and session-history deferred; the event list and details could ship.** The design challenge this created: display raw actions in a way that's informative but *visually distinct from defined events* — so users understand the player's limits without reading documentation — and architected so analysis features slot in when the data unifies.
⚠️ EXPECT: "Tell me about designing under technical constraints." — **this slide is the prepared answer; it's the same muscle as the XOPS modular-design thesis, a year earlier.**

**SLIDE 5 — Sketch to first prototype.**
ON SLIDE: Sketches → wireframes → the feedback-overlay artifact.
TALK TRACK: Fast: sketches for direction, wireframes for stakeholder approval, then an interactive prototype into design and product critique. One converged finding: **the event list didn't look interactive. That single line of feedback drives the next three slides.**

**SLIDES 6–7 — The iterations. (THE CRAFT CORE — let the videos run)**
SLIDE 6 ON SLIDE: Chunky Event List video.
TALK TRACK: Chunky: solid drop shadow, borrowed from a new button style — testing showed people knew it was clickable but couldn't see that each element held *two* actions: jump-to-moment and expand-details. **And a second kill reason that matters more: we weren't committed to chunky platform-wide. I won't introduce a one-off pattern into a design system for a single component's benefit.**
SLIDE 7 ON SLIDE: Two-Piece Event List video.
TALK TRACK: Two-piece: each action gets its own target — border and hover shadow separating navigation from detail, current-event highlighting during playback. **And the smallest, most telling decision: icons removed — because icons read as defined events, and these were raw actions. The data constraint from slide 4, enforced at the pixel level.** URL dropdown and open-in-new-tab postponed for testing rather than shipped on assumption.
⚠️ EXPECT: "Walk me through a micro-interaction decision." — slide 7 is the answer.

**SLIDE 8 — Killing the timeline.**
ON SLIDE: Both timeline-variant videos.
TALK TRACK: Leadership wanted a vertical timeline connecting list to playback. We built it properly — both variants — evaluated, and dropped it: the event-list animation already provided the affordance. **I don't argue with leadership in meetings; I build their idea well enough that the artifact can lose on its merits.**
⚠️ EXPECT: "Tell me about disagreeing with leadership." — **this is it, with receipts.**

**SLIDE 9 — The handoff.**
ON SLIDE: Final prototype video.
TALK TRACK: Final prototype implementing every round of feedback, then a detailed engineering walkthrough — every interaction, state by state.
> 🔍 NEEDS YOU: the three sentences (what the spec covered, one question the developer asked, one thing implementation changed). **With one developer on the team this was a working relationship — tell it like one. This slide carries the technical-collaboration claim for the whole deck.**

**SLIDE 10 — Bug bash → GA.**
ON SLIDE: A bug-bash artifact if one exists (list, board screenshot); else the production player.
TALK TRACK: We stress-tested engineering's build in a bug bash, triaged, fixed high-priority, shipped to GA — September 2022.
> 🔍 NEEDS YOU: the one bug you caught. **"I QA'd it" is a claim; "I caught the playback desync on session restart" is a fact.**

**SLIDE 11 — Measured with our own product. (THE DOGFOODING SLIDE)**
ON SLIDE: The Heap-on-Heap chart, narrated (axes, window, baseline).
TALK TRACK: **"Heap, measured in Heap: [the real sentence — replay views rose __% over __ post-launch]." Then the business layer: the new player became a factor in replay-tool replacement deals — prospects switching from [competitor category].**
> 🔍 NEEDS YOU: the chart's specifics + one deal detail. ⚠️ EXPECT: "10% of what?" — never let this be asked; scope it in the telling.

**SLIDE 12 — The announcement.**
ON SLIDE: The release announcement.
TALK TRACK: One line — **external proof it mattered enough to announce.** Move on.

**SLIDE 13 — What I'd do differently.**
ON SLIDE: The Auryc-evidence lesson.
TALK TRACK: I could have shipped faster by bringing Auryc customer testimonials and usage data to Heap stakeholders — the features' success was already proven once. Mid-integration, that evidence was hard to extract. **Lesson: when you're the acquired expertise, your old evidence is an asset — get it out before the integration buries it.** (Genuine, specific, mechanism included — this is the reflection interviewers remember.)

**SLIDE 14 — What the org taught me.**
ON SLIDE: One line on the 10-designer critique culture.
TALK TRACK: **Senior register, 30 seconds max: "First scaled design org after years as a team of two. I learned to bring work earlier and rougher — and contributed back through the workshops I ran for this project."** (🔍 NEEDS YOU: verify the contribution-back claim per web doc §12.) **Do not say "opened my eyes" or "my first impactful contribution" — facts, not wonder.**

**SLIDE 15 — The afterlife.**
ON SLIDE: Heap's replay player today (if it grew analysis features on your architecture).
TALK TRACK: > 🔍 NEEDS YOU: did the event-list architecture carry defined events when the data unified? If yes: **"The future-proofing held — the analysis features slotted in exactly where the architecture left room. That's a design decision you can audit years later."** If unknown/no: cut this slide.

**SLIDE 16 — Arc close.**
ON SLIDE: Auryc Path Analysis ↔ Heap Session Replay, side by side.
TALK TRACK: **"These two stories corroborate each other: I built the replay-context thinking at Auryc; Heap acquired it; I shipped it into their platform. And the constraint-driven, future-proofed architecture you just saw is the same method I then scaled at XOPS — which is the rest of my portfolio."** (Positions the loop exactly where you want the conversation to go next.)

---

### Prep list
1. The persona-proxy disclosure (decide once, slide 3) · 2. the handoff specifics (slide 9) · 3. the caught bug (slide 10) · 4. Heap-on-Heap chart scopes + one deal detail (slide 11) · 5. Staff-designer split (will be asked even though no slide carries it — one prepared sentence) · 6. the afterlife check (slide 15) · 7. contribution-back verification (slide 14).
**This deck's job in a loop: prove craft under constraint and collaboration at scale — in under 25 minutes. It's the deck most likely to draw behavioral questions ("disagreement," "constraints," "being wrong") — slides 4, 7, 8, and 13 are your prepared answers; steer to them.**
