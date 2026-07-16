# Software Observability — WEB VERSION (scannable, HM-facing)

**Convention:** plain text = your existing copy (kept or trimmed) · **bold = Claude-written** · `🔍 NEEDS YOU` = only your memory can fill it · `[component]` = structural weight · `🎨 VISUAL` = storytelling idea.
Where a section says *unchanged*, keep the copy currently in `page.tsx`.

Target: ~14 display beats (down from ~30). The skim layer alone should tell: ambiguous start → fragmented-data problem → ramp-up → goals → framework → designing under uncertainty → prototype-driven decisions → decision-surface finals → trade-offs → shipped impact.

---

## 1. Intro `[SectionIntroduction]`
Copy unchanged (title, one-liner, Company/Gap/Role, 3 impact blocks).

🎨 VISUAL — **Hero slot: the final All Software view (or a 6–10s screen recording of it). This is the single highest-leverage visual change in the portfolio — the placeholder hero is currently a soft-no at 15 seconds.**

> 🔍 NEEDS YOU: In the "Millions Reclaimed" impact block, replace "millions" with the real figure or range — it's likely stated in XOPS's public Broadcom case study you already link to. Also: add a Timeline meta item (your legacy studies all have one — e.g. "Q_–Q_ 202_"). Jog: when was the leadership Slack ping, when did Phase 1 hit production?

## 2. Brief `[LabelBlock display]`
Unchanged. (This section earns "comfortable in ambiguity" in one beat — protected.)

## 3. The Problem `[Block + MessageThread + LabelBlock display]`
Unchanged. The Slack-thread artifact is the best origin device in the portfolio.

## 4. User voice `[QuoteBlock]`
Quote unchanged.
> 🔍 NEEDS YOU: Attribute it — even loosely: **"— IT Director, Fortune 500 prospect call"**. Whose words were these, or whose pain does it paraphrase? An unattributed quote reads as your own copywriting.

## 5. Stakes `[MetricCard ×2]`
Unchanged (50% / $45M).
> 🔍 NEEDS YOU: One-line source under the cards (**"Source: Gartner / Flexera State of ITAM report…"** — wherever these came from). Uncited stats in a case study *about* data trust invite exactly the wrong skepticism.

## 6. Research `[ContextBlock 0% + LabelBlock display]`
Keep the 0% device and the display copy. **Cut the three empty xs labels** (Current Landscape / Data Points / Terms) — they're content-free chrome.

## 7. Insights & Goals `[display + InsightGoalRow ×3 + Experts ContextBlock]`
Structure unchanged — this is the study's spine. One tightening, Goal 2 body:
~~"Reconcile internal records against publisher and vendor data to expose discrepancies, and connect spend to utilization by department and employee so every budget conversation is backed by verified, operational intelligence."~~
→ **"Reconcile internal records against publisher and vendor data to expose discrepancies. Connect spend to utilization by department and employee."** (Two actions, no slogan.)

## 8. Observability First `[LabelBlock display + CardRows]` — *absorbs the old "Framework Adaptation" section*
**Promote this to a labeled display beat** (it currently sits below transitions that had headline weight). Open with one line from the old preamble: "The software experience needed to integrate seamlessly into the platform." **Cut the "I wasn't a SAM expert but…" hedge — the 0% section already made that point with more charm.** Framework cards unchanged.

🎨 VISUAL — the two CardRows + connectors already diagram the asset→software framework mapping. **Consider a subtle entrance animation: the top (asset) row visible first, connectors draw downward, software row fades in — the inheritance IS the story.**

## 9. Data. Data. Data `[ContextBlock + ContentHub ×5]`
Unchanged, including "This was a baseline, not a final spec."

🎨 VISUAL — **interactive idea: hover a node to highlight which Goal (1/2/3) it serves — color-coded dots tying the data model back to the goals. Cheap to build, shows systems traceability.**

## 10. **Designing for Data Uncertainty** `[LabelBlock display]` — *NEW beat: merges "Data Ops had higher priorities" + "I took a modular design approach"*
**This is the thesis of the project, currently split into two disconnected one-liners. Give it a label so it exists in the skim layer:**

Label: **"Designing for Data Uncertainty"**
Body: Data Ops had higher priorities before software data integrations. I didn't know which sources would be available, how complete the data would be, or whether every field would survive the integration.
Support/statement: I took a modular design approach. Every view crafted so that removing a metric or entire data category would not break the experience or the story it was telling.

🎨 VISUAL — **the missing proof: a before/after of ONE view with a data category removed (e.g. the Profile with Record Integrity absent) showing the layout re-flowing gracefully. Interactive version: a small toggle — "data source offline" — that collapses a module live. This one artifact converts the claim into the portfolio's best systems evidence.**
> 🔍 NEEDS YOU: Which data category actually did fall through in integration? Jog: what did the first real customer data pull look like vs your spec? Naming the real casualty ("**when X data arrived incomplete, the view held**") is the payoff sentence.

## 11. Parallel Prototyping `[display + ImgCards]`
Unchanged.

## 12. Prototype Validation `[display + Blocks]`
Copy unchanged. **Elevate the glossary from a side-Block into evidence:**
🎨 VISUAL — **show the living glossary/intent doc itself (screenshot of a page of it, even blurred). A governance artifact almost nobody shows.**
> 🔍 NEEDS YOU: Did the glossary outlive the project — did PM/engineering keep using it? One sentence ("**it became the team's shared vocabulary through implementation**") upgrades it from artifact to influence.

## 13–14. Overview Prototypes 1 & 2 — Assumption → Finding → Decision `[SectionImg ×2]`
Untouchable content — this is where a HM decides you're real. One bug:
> 🔍 NEEDS YOU: The Geographic Filtering "Decision" card currently repeats the assumption text verbatim and states no decision. What did you actually do — drop regional segmentation for Phase 1? Gate it behind legal/data readiness? Jog: what shipped in the Overview's filter bar?

🎨 VISUAL — **interaction idea: assumption cards flip to reveal findings on hover/tap — the flip is the learning moment made physical. (Works within the existing Card component as a variant.)**

## 15. All Software View `[display]` — *absorbs "Core Attribute Intent"*
Keep the display copy; append the Core Attribute line as its support: "The challenge was defining the right row-level attributes so teams could find what they needed fast." **Delete Core Attribute Intent as a separate section.** Also delete the "With gaps identified…" transition display — fold its one useful line ("As I finalized Overview designs, I kicked off All Software and Profiles") into this section's Block.

## 16. All Software Prototype 1 `[SectionImg]`
**Keep only the cards carrying judgment: Spend-first Prioritization, Utilization Rate, Inactive (90-day), Renewal. Cut Identification Columns / Category / Total Spend / Licenses Purchased** — their content reappears in Row Anatomy.

## 17. Software Profile `[display]` + organizing question `[QuoteBlock]`
Keep the Profile display and the QuoteBlock ("What is this software costing us and is it actually being used?"). **Delete the Utilization & Cost Summary section** — fold its one keeper line into the Profile Block: "give stakeholders the evidence to justify a reclamation, challenge a renewal, or escalate a waste conversation."

## 18. Profile Prototype 1 `[SectionImg]`
Unchanged except: **cut the "Product Identity / publisher logos strengthen polish" card** (rationale repeats in Row Anatomy, and "polish" is the weakest why in the study).

## 19. Lifecycle Timeline + Generating Events `[display + What/When/Why/Who + SectionImg ×2]`
Keep all content. One rewrite — the display body currently *tells* the trait:
~~"I took the initiative to establish lifecycle event definitions independently."~~
→ **"Definitions were still pending from product and integration. Rather than wait, I established them myself"** — support: so a tangible prototype could power cross-functional conversations. (Same fact, situation shows it.)

## 20. Unifying Systems `[display]` — *absorbs "Setting a Blueprint"*
Keep the display; compress the method re-explanation to a clause: **"Using the same two-track prototyping approach as the Overview,"** I generated directional variations… Then the Blueprint copy ("The intent wasn't to present a solution, but to walk into leadership chats with a starting point…") joins as this section's Block. One section, not two.

## 21. Testing the Experience `[display + ImgCard]`
Copy unchanged.
> 🔍 NEEDS YOU: **The ImgCard is empty — and this is the climax of "prototyping as thinking."** Do you still have the connected Overview→Catalog→Profile prototype? Even a 15-second screen capture of clicking through it. If lost: a 3-frame storyboard (Overview → row click → Profile) labeled "the navigable path users tested."
🎨 VISUAL — **best case: embed the actual clickable prototype here. This page is the right place for the portfolio's one interactive artifact.**

## 22. Validation `[display]` — *merges "Two Track Validation" + cross-functional sessions; delete "Together these sessions gave me clarity"*
One header: Two Track Validation. Track 1 copy (Director of Product) unchanged; Track 2 copy (cross-functional sessions) unchanged, minus the résumé line — **cut "Bringing multiple perspectives at once is a strategy I rely on throughout my process"** and keep the substantive rest ("Each function experiences design through a different mental model…").

## 23. All Software: Issues → System Debt → Final `[display + SectionImg, restructured]`
- Keep "All Software: Issues Identified" (product-level) + its annotation cards.
- Rename the second issues beat to signal its real story: **"The table pattern wouldn't survive the platform's growth"** — body: While solving for All Software, I captured issues with our current table experience that would compound as more lifecycle data entered the platform.
- **Merge the issue cards (§ experience issues) with their fix cards (§ design system refinements) into ONE before/after section** — each pattern (Asset Count Badge, Region Filters, Table Headers, Row Heights, Side Scroll) gets a single card: problem clause → decision clause. Kills the 400-line echo.
- Keep "All Software: Final Design" display ("from data display to a decision-making surface") — **this is the only place the 'actionable at a glance' beat survives; it's been cut everywhere else.**

🎨 VISUAL — **before/after slider (drag handle) on the old vs final table. The redesign argument in one interaction.** Also: **recaption every final image — "All Software — Final Design", never "AI Prototype 02." Headers and captions must agree about who made it and whether it's done.**

## 24. Table Anatomy `[display + SectionImg]` — *absorbs Tooltips*
Row Anatomy cards: keep Publisher Logo, Utilization Tag, Opportunity, Renewal Date + Countdown, Supporting Baseline Metrics; **cut Vendor and Category cards** (rationale already given in §16's survivors or self-evident). Fold Tooltips in as a trust card:
**Card label: "Calculation Transparency."** Body: Tooltips surface metric definitions and calculation logic in context — so users can trust numbers unified from systems they don't control. (Reframed from widget to governance.)
🎨 VISUAL — **annotated hotspot image: numbered pins on one real row, each pin = one anatomy card. One image replaces seven separate cards' worth of pointing.**

## 25. A Configurable Surface `[display]` — *merges Customizable Columns + Drag-and-Drop*
**One beat, one header:** Column controls and drag-and-drop reordering let each team shape the table around their workflow — the surface adapts to the persona, not the other way around. Existing copy from both sections becomes two cards under it.
🎨 VISUAL — **this must be motion: a 5–8s clip of grabbing/dropping a column. Static JPGs of a drag interaction prove nothing about interaction craft.**

## 26. Software Profiles: Issues → Final `[display + SectionImg ×2]`
Keep both. Trim final-design cards from 8 → **keep Opportunity-First Framing, Explicit Reclaimable Total, Decision-Ready Renewal Context, Utilization Status; cut the rest** (restatements).
> 🔍 NEEDS YOU: One issue card ("Low Visibility of Underutilized Cost") has a body about tooltips that doesn't match its label — what was the real observation? Jog: what made underutilized cost hard to see in Prototype 1 — placement? no dollar translation?

## 27. Scope and Trade-Offs `[display + SectionImg]`
Unchanged — the Financial Tab descope card is the most senior call in the study. Tighten it by leading with the decision: **"Shipping with incomplete records would have cost XOPS customer trust during a critical evaluation period."** Contract terms, support costs, and historic spend lived in emails, invoices, and legal documents with no reliable integration path. (Cut the third sentence — implied.)

## 28. Inactive License Distribution `[display + SectionImg]` — *merge the three chart sections into one*
Keep the display + the Distribution Overview cards. **Merge the "by department" and "by cost center" sections into a single beat** — one card row: Operational vs Budget Ownership, Cost Breakdown, Employee Drill-Down (one card each; they're currently near-verbatim duplicates), plus the Former Employees card (genuinely distinct — keep whole).

## 29. Software Overview Revisit `[display + ImgCard]`
Unchanged. **Delete the completion QuoteBlock** ("With the overview refined…") — a status update in an emphasis slot.

## 30. Product & Business Impact `[display + goal-connections CardRows]`
Structure unchanged (impact cards → goal mapping, honest "Directional" on Goal 2 — keep that word).
> 🔍 NEEDS YOU — three insertions that change the interview:
> 1. **Velocity:** "From leadership ping to shipped Phase 1 in __ weeks/months." Jog: which quarter was the sales call? which release shipped the module?
> 2. **The Broadcom number** (or quote XOPS's public case-study language directly).
> 3. **One engineering moment:** the over-assignment finding became a new state "across the data model and all views" — did you spec it? Who implemented it? One named conversation is your technical-credibility evidence. Jog: who owned the utilization-state enum, and what did you hand them?

## 31. Reflection `[Cards ×3]`
**Merge "Tangible Artifacts" + "Parallel Prototyping as Velocity" into one card** (one lesson, two cards currently). Keep End-to-End Accountability — trim to its great line: every data point had to earn its place — **+ one concrete example of a metric that didn't earn its place** (🔍 NEEDS YOU: which one got cut? Jog: what died between prototype 1 and 2 — per-license expiration?). Keep Transparency as Trust.

## 32. Next Steps `[display]`
Unchanged.

---

### Visual storytelling summary (build priority order)
1. **Real hero image/recording** (flips the 15-second verdict)
2. **Full-prototype capture in §21** (proves the central claim)
3. **Data-uncertainty before/after or toggle in §10** (the thesis, made visible)
4. **Before/after slider on the table redesign (§23)**
5. **Drag-and-drop motion clip (§25)**
6. **Annotated hotspot row anatomy (§24)**
7. **Framework-inheritance entrance animation (§8)** — nice-to-have
