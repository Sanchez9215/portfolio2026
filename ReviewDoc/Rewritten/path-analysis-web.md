# Path Analysis (Auryc) — WEB VERSION (scannable, HM-facing)

**Convention:** plain = your existing copy · **bold = Claude-written** · `🔍 NEEDS YOU` = memory required · `[component]` = structural weight · `🎨 VISUAL` = storytelling idea.
This study's portfolio job: **the proof layer — it shipped, was adopted, customers spoke, there's video.** The migration is mostly *expansion*: your legacy copy states whats; the new format needs whys. More bold here than in the XOPS docs — that's expected.

---

## 1. Intro `[SectionIntroduction]`
Title: Path Analysis. One-liner: Visualization of user journeys for product teams to understand how users truly interact with their product.
Meta: Company **Auryc — product analytics platform (session replay, behavioral analytics, voice of customer)** · Role Lead Product Designer · Timeline Q3–Q4 2021 · Team 1 PM, 2 developers, 1 backend engineer · Contribution: Research, Scoping & prioritization, Design, QA.
Impact blocks — **rescoped (the current phrasing collapses under one interview question):**
1. **Adopted by 78% of accounts** — lead with this; it's the defensible star. 🔍 NEEDS YOU: within what period post-launch? "within __ months" doubles its force.
2. ARR increase of 20% from previous quarter — > 🔍 NEEDS YOU: company ARR or attributable? If company-wide, rephrase: **"launched into a quarter of 20% ARR growth, with path analysis a named driver in [sales/CS reporting]"** — or drop it; three defensible numbers beat four soft ones.
3. Expansion rate of 15% on overall contract value · 4. Increased retention rate to 92% — > 🔍 NEEDS YOU: scope both (retention of accounts? from what baseline? measured how — you had Heap/analytics on this). Any metric that can't carry a scope gets cut.

🎨 VISUAL — keep the hero product video (the sankey in motion). **It's the only 15-second yes in the portfolio today — protect it.**

## 2. The Problem `[LabelBlock display + Cards]`
As Auryc scaled, path analysis became the most requested capability from customers and leads. Not having it created a feature gap and lost customers; the Looker integration we offered instead provided a broken user experience **— configuration lived behind support tickets, and results were unreadable without training.**
> 🔍 NEEDS YOU: one stakes number — a lost deal, a churned account, or "cited in _ of _ lost-deal reviews." Jog: what did sales say when they escalated this?

## 3. The Opportunity `[display + Cards ×2]`
How can we provide a more intuitive & differentiated path analysis experience? **This was a build-vs-buy argument:** More Control — a native tool gives us control over behavior and look, flow optimization, design consistency. More Value — integrating session replay, behavioral analytics, and feedback data gives users a complete picture of the digital journey **no competitor could match, because no competitor had all three data types.**
> 🔍 NEEDS YOU: were you part of making the build-vs-buy case to leadership, or was it decided before you? Either answer is fine — say which.

## 4. Auditing the Existing Tool `[display + Cards]`
I audited our Looker-based tool to understand how it worked and where it failed. Key findings: creating and editing charts required technical expertise or support; chart results were overwhelming and difficult to understand; it didn't surface Auryc's strengths.
🎨 VISUAL — the "before" screenshot with **3 numbered annotation pins on its failures (the new-format hotspot pattern).**

## 5. Insights & Goals `[InsightGoalRow ×3]` — *restructured: your Goals section + audit findings + quotes, paired*
- **Insight:** Non-technical users couldn't self-serve — building charts required support. → **Goal: Easy** — anyone can create all three analysis types (inbound, outbound, end-to-end) without help.
- **Insight:** Charts showed traffic counts and nothing else. → **Goal: Insightful** — surface the data we already collect (drop-off, conversion value, recordings) inside the path context.
- **Insight:** Paths were illegible at density. → **Goal: Clear** — event names, path weights, and interactivity readable at a glance.
(**Bodies rewritten from your notes-style originals; the Easy/Insightful/Clear names are yours — keep them.**)

## 6. Shadowing Sales & Support `[display + QuoteBlock ×2 + Cards ×2]`
Sales and support constantly engage with customers experiencing these problems — I joined their calls to collect pain firsthand and validate my audit findings. **Research where the pain was already being spoken, instead of scheduling it.**
Keep all four quotes verbatim. **Promote two to QuoteBlocks** (the rage-click ask; the replay-from-path ask), two as Cards.
> 🔍 NEEDS YOU: light attribution per quote — segment level is enough ("support call, enterprise retail customer"). Jog: which calls were these — renewals? onboarding escalations?
🎨 VISUAL — **quote→decision traceability diagram: the four quotes on the left, Phase 1/2 features on the right, lines connecting each ask to what shipped. This single diagram converts "we did research" into "demand drove the roadmap." Strong candidate for the section's closing image.**

## 7. Competitive Analysis `[display + SectionImg]` — *merges "Areas of Opportunity"*
Keep: competitor screenshots + your matrix (**carry the CompetitiveChart artifact itself as an ImgCard — it's evidence of structured synthesis, don't summarize it away**). Findings kept: limited tooltip data; replays separate from charts; few surfaced frustration. Best practices: Sankey diagrams; charts must give users control over noisy data. **The gaps map 1:1 to Auryc's existing strengths — that's the differentiation thesis in one observation.**

## 8. Two Phases `[display + CardRow]`
I synthesized findings with my PM and split the MVP: Phase 1 — Laying the Foundation (read-only inbound/outbound/end-to-end, noise controls, defined events only). Phase 2 — Integrating Strengths (tooltips with supporting metrics, session replay, frustration events, event definition). **Foundation first, differentiation second — ship the table stakes, then ship what only Auryc could.** (Fix the typos: "Integrating Strengths.")
🎨 VISUAL — the research-synthesis photo (`Research Synth.jpg`) belongs here — **physical synthesis artifacts are ambiguity-wrangling texture the XOPS studies can't offer.**

## 9. Query Builder: three attempts `[SectionImg ×3 with pros/cons Cards]`
Keep V1 (easy to implement, unreadable queries) and V2 (accessible copy, but users missed "Include" in testing) with your pros/cons.
> 🔍 NEEDS YOU: one sentence of testing method — who and how many ("tested with _ internal users across _ sessions"). "Tested internally" reads as anecdote without it.
Final: keep your copy — exposed analysis options for discoverability; grouped path-specific parameters; **plus the step-count control, expanded:** I introduced a step-count selector partly **as a probe — packaging the design with an effort question so engineering could size it in the same review. The team saw the value and called it low effort; it shipped.** Post-launch info icon note moves to §14.
🎨 VISUAL — keep the final-query video. **Caption iterations V1 → V2 → Shipped (not "final") — versions that name their fate.**

## 10. Learning the Sankey `[display + SectionImg]` — *merges "Sankey Chart Design" + "More Chart Exercises," retitled*
The chart was the hardest problem in the project. I started by translating the old table view of an outbound analysis into a chart by hand — **forcing myself to understand what each row actually represented before styling anything.** Then, using developer tools, I inspected competitors' sankey implementations, looking for patterns in how paths and events related.
> 🔍 NEEDS YOU: what the dev-tools inspection actually taught — one concrete finding (how nodes/links were structured? how they handled path collapsing?). Jog: what did you steal, what did you reject? **Present this as learning a hard form by reading real implementations — not as an engineering claim.**

## 11. The Final Chart `[display + SectionImg with decision Cards]` — **the black box, opened**
**Current copy ("after several team reviews I delivered a final version") skips the entire design of the project's hardest artifact. Replace with 3–4 decision cards — reconstruct from the artifact itself, not from memory of meetings:**
> 🔍 NEEDS YOU — one card each (hints from what's visible in your final chart/video):
> - **Noise:** how does the chart keep 20+ paths readable — top-N paths with an "other" bundle? minimum-traffic cutoff?
> - **Repeats:** "collapsed repeated paths/events" is a Phase 1 list item — that's a real design decision; what did collapsing look like and why?
> - **Legibility:** how are event labels kept readable at density (truncation? hover reveal?) — this was your "Clear" goal; close the loop.
> - **Traffic weight:** how is volume difference made visible at a glance (band thickness scale? color?).
🎨 VISUAL — **annotated hotspot image of the final chart: one pin per decision card. The exact pattern your XOPS studies use — this section should look like they do.**

## 12. Excluding Events `[SectionImg ×2 + descope Card]`
Keep both methods with your copy (toolbar = visible, for users who know what to exclude; on-chart = in-flow, no interruption). Keep the descope honestly: **on-chart exclusion was pushed to Phase 2 under the timeline — the toolbar covered the core need; the in-flow refinement was additive, not blocking.**

## 13. Shipped `[display + CardRow ×2 + ImgCard video]` — *merges Phase 1 / Phase 2 / In Production*
Phase lists kept — **but tie Phase 2 items to their sources: each feature answers a named quote or competitive gap (the §6 diagram pays off here).** Production video kept, **captioned: "In production — [ship date]."**
> 🔍 NEEDS YOU: the actual ship dates for each phase.

## 14. Ship, watch, fix `[Block or Card]` — **NEW beat, promoted from a buried Cons clause**
After launch, analysis terminology confused users unfamiliar with it — we added info icons with definitions and examples.
> 🔍 NEEDS YOU: what told you users were confused? **If you watched Auryc session replays of users using path analysis — say so. Dogfooding (your product watching your feature) is a beat no other study can offer.** Jog: support tickets? CS flags? your own replay watching?

## 15. Results `[display + goal-mapped CardRows]` — *rebuilt; don't repeat the hero cards verbatim*
**Map each metric to the goal it validates** (the Software Observability goal-connections pattern):
- Easy → 78% account adoption **(non-technical users self-serving was the bet; adoption is its proof)**
- Insightful → expansion +15% / retention 92% **(scoped per §1 notes)**
- The business case → ARR context **(per §1 decision)**
> 🔍 NEEDS YOU: same scoping asks as §1 — this section is where the caveats live in full.

## 16. **Reflection** `[Cards ×3]` — **NEW (drafts to rewrite in your voice)**
1. **"Go where the pain is already being spoken."** Shadowing sales and support produced better evidence in days than scheduled research would have in weeks.
2. **"Learn the form before styling it."** Hand-translating tables into charts and reading competitors' implementations in dev tools is how I earn complex visualization problems.
3. **"Foundation, then differentiation."** Phase 1 shipped table stakes; Phase 2 shipped what only Auryc's data could do. **(This phasing instinct became the layered architecture I later used at XOPS — the portfolio's method thread, stated once.)**

## 17. **Next Steps / Afterlife** `[display]` — **NEW**
> 🔍 NEEDS YOU: what happened after? Phase 3 plans, and — the big one — **Heap acquired Auryc; your replay-context expertise from this project is what you carried into the Heap session replay work. One cross-reference line here ("this expertise is what Heap acquired — see Session Replay") makes the portfolio read as a career arc. No other pair of your studies can corroborate each other like this.**

---

### Visual storytelling summary (build priority order)
1. **Quote→decision traceability diagram (§6)** — converts research into demand-driven roadmap
2. **Annotated final-chart hotspots (§11)** — opens the black box
3. **Rescoped metric cards (§1/§15)** — the credibility engine
4. **Before-tool annotated failures (§4)**
5. **Competitive matrix as artifact (§7)** + research-synthesis photo (§8)
6. Keep every existing video (hero, final query, exclusion methods, production) — **this study's motion inventory is its superpower.**
