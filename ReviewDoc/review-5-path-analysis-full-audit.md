# Path Analysis (Auryc) — Full Case Study Audit + Migration Map

Same reviewer stance as reviews 1 and 3: hiring manager screening for Senior Product Designer, technical, product-led B2B SaaS, judging one impression — **end-to-end owner + systems thinker who prototypes to think and drives teams through ambiguity.**

Read basis: the legacy `PathAnalysis.html` content in full. Per scope: UI and markup ignored entirely — this audits the *content* and prescribes where each beat lands in the new component vocabulary (`LabelBlock display` / `Block` / `Card` / `QuoteBlock` / `MetricCard` / `InsightGoalRow` / `SectionImg` / `ImgCard`).

**The headline difference from your XOPS studies:** this one has everything they're missing — four hard metrics, verbatim customer quotes, a stated timeline (Q3–Q4 2021), a named team, a QA credit, and live production footage — and almost none of what they have: the *why* behind decisions. The XOPS audits were about cutting; this migration is mostly about **writing the reasoning that the 2021 format never asked for.** Reformatting the existing words into new components would produce a beautiful thin study.

---

## TL;DR — the 5 highest-leverage changes

1. **The four metrics are portfolio gold and indefensible as written.** "ARR increase of 20% from previous quarter" — company ARR or feature-attributed? "Increased retention rate to 92%" — of accounts, of feature users, from what baseline? These are the best numbers in your entire portfolio and the first thing an interviewer probes; as phrased, they collapse under one follow-up question. Each needs a scope and a mechanism ("adopted by 78% of accounts within X months of launch" is the defensible star — lead with it). And they appear verbatim twice (hero + Results) — same duplication tic as Data Health Monitor; the closing instance should *earn* the repeat by mapping each metric back to a goal, the way Software Observability's goal-connections section does.

2. **The reasoning debt: decisions appear without whys, and the hardest problem is a black box.** "After several team reviews and rounds of feedback I was able to deliver a final version of the chart" — that sentence skips the entire design of the most complex artifact in the project. What did the exercises teach? What broke in review? Why does the final chart look like it does (color logic, path collapsing, label truncation)? The exercise images exist — the reasoning is recoverable. Migration rule: every section that currently ends at *what* must gain its *why*, or the new format's Card vocabulary (built for discrete decisions) will have nothing to hold.

3. **The technical evidence is the strongest in your portfolio and it's one sentence long.** "Using developer tools I inspected several sankey charts looking for patterns" + QA listed as a contribution + a team of 2 devs and a backend engineer. This is the contributes-to-code proof both XOPS studies lack — reverse-engineering chart implementations via dev tools is exactly the "gets into the weeds" behavior the target role describes. Expand it: what did you find in the DOM/SVG structure, what constraint did the backend engineer put on the chart, what did you catch in QA. Three sentences each turns a claim into a scene.

4. **The customer quotes are the only real user voice in your entire portfolio — elevate and connect them.** Four verbatim quotes from shadowing sales/support calls. In the new format these are `QuoteBlock` material (the component's actual purpose, which the XOPS studies partly debased with self-authored lines). Give each a light attribution (role + company type) and — the bigger move — trace each quote to the design decision that answered it: rage-clicks quote → frustration events in Phase 2; replay quote → session replay integration; self-service quote → native query builder. Quote→decision traceability is the insight→goal spine the new format is built around, and the raw material is already here.

5. **The back third doesn't exist.** No reflection, no next steps, no post-launch learning beyond one buried gem — "after launch we decided to include a small info icon" is the study's only ship-then-learn beat and it's hiding inside a Cons paragraph. Expand it (what signal triggered it — support tickets? watching sessions in your own tool?), then write the Reflection and Next Steps sections the new format expects. A 2021 project has the advantage of hindsight — what did path analysis become after you left? Use it.

---

## Structural hierarchy audit + migration map

| # | Legacy section | Content verdict | New-format home | Why / what's missing |
|---|---------------|-----------------|-----------------|----------------------|
| 1 | Hero (title, one-liner, video, 4 metric cards) | **Keep — best hero in the portfolio** | `SectionIntroduction`: title + Block + meta LabelBlocks + impact LabelBlocks | A product video at the top is what reviews 2 and 4 begged the XOPS studies for. Metrics move to the impact blocks — rewritten per TL;DR #1. |
| 2 | About + project details (role, timeline, contribution, team) | **Keep every field** | Intro meta (`LabelBlock xs`) | Timeline and team are the exact fields the XOPS studies are missing — port this pattern *backwards* into them. |
| 3 | Background (feature gap, lost customers, broken Looker UX) | **Keep, add stakes numbers** | `LabelBlock display` ("The Problem") + Cards | "Loss of customers" — how many, or what deal size? One number makes the stakes real. The broken-Looker pain is the origin story; consider a concrete anecdote the way Software Observability uses the Slack thread. |
| 4 | Opportunity (HMW + More Control / More Value) | **Keep, sharpen** | display + 2 Cards | "More Control / More Value" is a genuine build-vs-integrate framing — say explicitly this was a *build-vs-buy* argument you helped make. That's product judgment, currently disguised as feature benefits. |
| 5 | What are we working with? (tool audit) | **Keep, retitle** | display ("Auditing the Existing Tool") + Cards | Key findings are good. The Components/Types cards are inventory — compress. Title is filler. |
| 6 | Goals (Easy / Insightful / Clear) | **Restructure into insight→goal pairs** | `InsightGoalRow` ×3 | The goals read as working notes ("Tooltips can lead to more path context…"). The audit findings + customer quotes are the insights; pair them: *finding → goal*, exactly like the XOPS Insights & Goals spine. The raw material for all three pairs already exists in sections 5 and 7. |
| 7 | Shadowing Sales & Support (4 quotes) | **Elevate — portfolio-unique** | display + `QuoteBlock` ×4 (or 2 QuoteBlocks + 2 Cards) | See TL;DR #4. Also name the method's virtue: you went to where customer pain was already being spoken instead of scheduling research — that's the moves-fast-in-ambiguity behavior, unnarrated. |
| 8 | Competitive Analysis + Areas of Opportunity | **Keep, merge to one beat** | display + `SectionImg` (competitor screenshots + opportunity/best-practice Cards) | Two sections, one beat. The competitor-gap findings (few surfaced frustration, replays separate from charts) are the differentiation argument — keep them; they set up Phase 2. |
| 9 | Research Conclusion (2 phases with PM) | **Elevate — this is the strategy beat** | display + CardRow (Phase 1 / Phase 2) | Foundation → Integrating Strengths is the same layered-breakpoint thinking as Data Health Monitor's "A Layered Approach" — and here the layers actually *shipped in order*. Claim the pattern in the same language so the portfolio reads as one designer with a repeatable method. Fix the typos ("Intergrating Strenghts") before anything else. |
| 10 | Query Builder V1/V2 | **Keep — the format's best fit** | `SectionImg` with pros/cons Cards | V1/V2/final with honest cons maps 1:1 onto the Assumption→Finding→Decision card pattern. Missing: who tested it and how ("tested internally", "users often missed the Include option" — how many users, what method?). One sentence of method makes the finding credible. |
| 11 | Final Query Builder | **Keep; expand the step-count story** | `SectionImg` | "I introduced an option to select the number of steps to collect the team's thoughts and effort estimate" — you designed a probe to elicit an engineering estimate. That's design-as-team-communication; give it two sentences instead of one clause. The post-launch info-icon fix moves to the back third (TL;DR #5). |
| 12 | Sankey Chart Design (table→chart exercise) | **Keep, narrate** | display + `SectionImg` (before/after) | The translation exercise is prototyping-as-thinking in its purest form. Currently: "I started with an exercise." Needed: what the exercise revealed about the data's shape. |
| 13 | More Chart Exercises (dev-tools inspection) | **Elevate hard** | display + Cards | See TL;DR #3. This is the portfolio's most literal "technical designer" evidence. |
| 14 | Final Sankey Chart | **Expand — the black box** | `SectionImg` with decision Cards | See TL;DR #2. The new format demands annotation cards on final designs; right now there are zero decisions to annotate. Write the chart's decision set: noise handling, path collapsing, color/label logic, hover states. |
| 15 | Excluding Events (2 methods, one descoped) | **Keep — honest descope** | `SectionImg` ×2 + descope Card | "Due to the time crunch, excluding from the chart was pushed to Phase 2" — real trade-off, kin to the XOPS descope beats. Add the *reasoning*: why toolbar-exclusion was the right MVP half. |
| 16–17 | Laying the Foundation / Integrating Strengths (phase lists + videos) | **Keep, close the loop** | CardRow + ImgCard per phase | The Phase 2 list is the payoff of the competitive gaps and customer quotes — say so explicitly (each Phase 2 item answers a named quote/gap). Lists alone read as release notes. |
| 18 | In Production | **Keep — precious** | ImgCard (video) | Live production footage is the "it actually shipped" proof neither XOPS study has. Caption it as production, with the ship date. |
| 19 | Results (4 metrics, verbatim repeat) | **Rebuild as goal-connections** | CardRow impact + goal-mapping rows | Don't repeat the hero cards — map each metric to a goal (Easy → adoption 78%; Insightful → expansion/retention; business case → ARR), with scope caveats per TL;DR #1. |
| — | *(absent)* Reflection | **Write it** | Cards ×3 | Candidates: designing a chart type you'd never built (learning in public), the shadowing method, what you'd do differently on the query builder. |
| — | *(absent)* Next Steps / afterlife | **Write it** | display | What Phase 3 would have been, or what the feature became. |

**Skim-layer verdict:** the legacy headers are utilitarian but mostly narrative ("Shadowing Sales & Support," "Laying the Foundation") — better bones than expected. Weak spots: "What are we working with?" (filler), "More Chart Exercises" (undersells the best section), and the story currently ends at "Results" with no reflective close. The bigger skim problem is what's *missing between* headers: a skimmer sees process step names, not decisions — because the decisions aren't written yet.

---

## Story gaps (ordered by damage)

1. **Metric attribution** (TL;DR #1). Four numbers, zero scopes, zero baselines, zero mechanisms. Interview-fatal as written.
2. **The sankey chart's design reasoning is absent** (TL;DR #2). The project's stated hardest problem has no visible decisions.
3. **No usability-testing method anywhere.** "Tested internally," "during testing users often missed" — who, how many, what protocol? One sentence per study.
4. **The build-vs-buy argument is implied, never made.** Replacing Looker with native was a significant engineering investment — who made that case, and were you part of it? "More Control / More Value" suggests you were.
5. **Engineering collaboration is a cast list, not a story.** 2 devs + 1 BE + QA credit, and the only trace is "the team saw the value… and considered it low effort." Which constraint from the backend shaped the chart? (The "collapsed repeated paths/events" Phase 1 item smells like exactly such a constraint — if so, that's a great beat.)
6. **No stakes number on the problem** — "loss of customers" begs one figure.
7. **Post-launch learning is one buried clause** (the info icon). What told you users were confused — support tickets, or did you watch sessions in your own session-replay product? (If the latter: dogfooding beat, take it.)
8. **Quote attribution** — four quotes with no speaker context (role/segment). Light attribution doubles their weight.

---

## Repetition map

Short study — the disease here is thinness, not repetition. Only two real entries:

| Beat | Where | Fix |
|---|---|---|
| The 4 result metrics | Hero + Results, verbatim | Keep both *positions*, differentiate the content: raw stats up top, goal-mapped analysis at the close |
| "At a glance" ×2 | Goals section (both in "Clear") | Keep one; it's also the XOPS studies' most-worn phrase — see portfolio note below |

**Portfolio-level repetition (matters more):** this study's phased-foundation strategy, descope-under-time-pressure, and audit-first opening are beats the XOPS studies also use. That's fine — it's a *method signature* — but only if the phrasing varies. If "laying the foundation" / "phase 1 focused on" language is copied across three studies, the method reads as a template instead of a habit.

---

## Impact & systems-thinking fixes

**Already strong — protect through migration:**
- Shadowing sales/support instead of scheduling research — scrappy, fast, evidence-producing.
- The two-phase build strategy with the second phase explicitly designed around the company's differentiators (replay, frustration signals, VoC) — that's *strategic* feature design, not feature building.
- Dev-tools reverse engineering; the table→chart translation exercise.
- Honest cons on every iteration including the final one.
- Shipped, in production, with adoption data.

**Push harder:**
- 78% adoption is the crown jewel — feature-level, plausible, defensible. Put it first everywhere the metrics appear.
- The Phase 2 items each answer a specific customer quote — draw those lines explicitly; it converts a feature list into demand-driven design.
- "Considered it low effort" — you shaped scope by packaging a design probe with an effort question. Name the skill.
- Say what YOU did in QA. It's claimed in the meta and never evidenced.

---

## Thin ice (the walls-of-text section, inverted)

The XOPS studies needed 30–50% cuts; this one needs targeted *expansion*. Passages currently too thin to survive the new format's card treatment — each needs its why, in your voice:

1. **"After several team reviews and rounds of feedback I was able to deliver a final version of the chart."** → The single most expensive sentence in the study. Direction: replace with 3–4 decision cards (noise, collapsing, labeling, interactivity) sourced from your own memory of those reviews.
2. **"Using developer tools I inspected several sankey charts looking for patterns and relationships."** → What patterns? Direction: one concrete finding (how competitors structured nodes/links, what you stole, what you rejected).
3. **"2 different versions were tested internally."** → Direction: one sentence of method (participants, task, what "missed the Include option" looked like).
4. **"The team saw the value in the flexibility it would provide and considered it low effort."** → Direction: expand into the scope-shaping move it actually was.
5. **Goals card bodies** ("Tooltips can lead to more path context than only the traffic count") → Direction: rewrite as outcome statements once restructured into InsightGoalRows.
6. **Hygiene:** "Intergrating Strenghts," stray spaces, encoding artifacts (â) — legacy-export damage; none of it may survive migration.

---

## What the HM says out loud

**After the 60-second skim:**
> "Product video up top, four numbers, real quotes in the middle, a live-production section — okay, this person *ships*. Sankey charts are genuinely hard to design. But it's reading like a sprint recap: step, step, step, results. And 'ARR increase of 20%' with no scope makes me trust the other three numbers less, not more. Verdict: credible shipper, unproven thinker — the opposite read from their XOPS studies."

**After the full read:**
> "The raw material here is the best in the portfolio: customer voice, a timeline, a team, honest cons, shipped outcomes with adoption data. What's missing is the layer this person's newer studies have too much of — the reasoning. The chart section literally skips from exercises to 'final version.' If they migrate this by reformatting, it'll be a pretty thin study; if they migrate it by writing the whys — especially the sankey decisions and the dev-tools findings — it becomes the proof study for everything the XOPS ones claim: ships, technical, customer-driven, fast. Interview: yes if the metrics survive one probing question. Fix the attributions before I get to ask."
