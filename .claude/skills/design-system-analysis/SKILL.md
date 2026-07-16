---
name: design-system-analysis
description: Studies external design systems (docs sites or source repos) to drive fast, guided component decisions for a target project's own design system. For each component analyzed it produces a scannable anatomy checklist — every structural piece the references account for, what each reference does, and a concise recommendation per piece — then walks the user through deciding each line in dialogue. Never imports a reference's actual token names or values — only the existence of a category, and the shape of how references organize it, as input to the target project's own synthesized direction. Agnostic to which project it's run against; works for XOPS or any future non-portfolio design system effort. Triggers on explicit /design-system-analysis invocation or when the user shares a design-system reference link/repo asking for structural analysis.
---

# Design System Analysis

Turns external references into fast, per-piece decisions for the target project's own components. The deliverable is not a comparison report — it's a scannable anatomy checklist with a recommendation per line, resolved live in dialogue with the user.

---

## Never do this

- **Never report a reference's actual token names, hex values, px values, or font names as something to adopt.** Only report that a category or dimension exists, and — when relevant — the *shape* of how a reference organizes it (e.g. "tiered-modifier naming vs. numbered-ramp naming" as two observed approaches), never the literal names or values within that shape.
- **Never decide on the user's behalf.** This skill is opinionated — it recommends per anatomy piece, with reasoning — but a recommendation is not a decision. The user picks per line, including hybrids (one reference's approach for one piece, a different reference's for another). Never mark anything Selected, write it to the log as decided, or proceed to build on the strength of a recommendation alone.
- **Never write to the target project's `tokens.json`/`tokens.css`/component files directly.** This skill's deliverable is the live anatomy-checklist dialogue — nothing persists to a dedicated log. Anything worth acting on moves to `PLAN.md` (roadmap-worthy) or `DECISIONS.md` (genuinely strategic) only when the user explicitly says so.

---

## Step 1 — Identify the target project

Ask if not already given: which project's doc set (`.claude/projects/<name>/`) this analysis is for. Read that project's current `tokens.json`/`tokens.css` (or equivalent), `progress.md`, and `DECISIONS.md` before anything else. Recommendations must be grounded in real current state: existing scales that could be extended, existing components that set precedent, and prior strategic decisions a new recommendation must not silently contradict.

## Step 2 — Intake the references

- **Docs site:** fetch the index/nav or component-overview page first — cheap, and on its own gives the full category taxonomy the reference accounts for. Then select specific pages to deep-dive, driven by structural significance (does this reveal a dimension the target project has no stance on?), not narrowly limited to whatever's on the immediate build roadmap.
- **Source repo (e.g. a GitHub link):** look at folder/file architecture instead of docs pages — how tokens are organized across files, how component files are structured, how variants/states are named at the file/export level. Different signal than docs prose — valuable specifically for "how do we structure this for scale" questions.
- **Multi-page or multi-reference work goes to a background research pass** (via the Agent tool), not inline fetching — keeps raw scraped content out of the main conversation. The agent gets the strict no-copy rule verbatim in its prompt, plus a summary of the target project's current token state, and returns only structural findings per anatomy piece — not prose.
- **Scope guidance:** 2–3 references gives strong cross-validation signal (a pattern appearing in multiple unrelated references is a real convention, not one system's idiosyncrasy); returns diminish sharply past 3–4. Prefer references structurally similar to the target project's actual UI over broad, dissimilar ones.

## Step 3 — Build the anatomy checklist (the deliverable)

For each component being analyzed, enumerate every structural piece that shows up across the references — header? footer? chrome/container type? sizing scale? state coverage? variant architecture (separate components vs. props)? slot/composition model? Anything at least one reference treats as a decided part of the component's anatomy gets a line.

Each line carries exactly three things:

1. **What the references do** — which references have this piece, which don't, and the exact structural shape each uses (shape only, never literal values). One line, not a paragraph.
2. **A recommendation with reasoning** — 1–2 sentences, drawing on all three of:
   - **Convergence strength, stated explicitly.** "All 3 references do X" is a different claim than "only Carbon does X" — never present a single-source finding with the confidence of a 3-way convergence.
   - **The target project's current state.** Prefer extending an existing token/scale over duplicating one; respect precedent set by already-built components; flag (don't silently override) any conflict with an existing strategic decision in `DECISIONS.md`.
   - **No component overkill.** Recommend what the project needs *now* — a shape that's easy to expand when real complexity and use-cases show up beats building every piece a reference happens to have just because it exists there. Simpler-but-extensible over comprehensive-but-premature.
3. **A clarifying question, only where needed** — when the right call hinges on a project constraint that isn't yet known (e.g. "will this ever hold interactive content?"), ask it briefly instead of guessing.

## Step 4 — Decide in dialogue, piece by piece

This is a back-and-forth, not a one-shot dump:

- Present the checklist: one line per anatomy piece — references' shapes, recommendation, question if any. No restated prose per item.
- No more than 2–3 clarifying questions per turn; hold the rest for the next round.
- The user decides per line — accepting a recommendation, overriding it, or mixing references (hybrid picks are expected, not exceptions).
- Continue the loop until every piece has a decision. Undecided pieces stay visibly open; they don't get defaulted.

Dispositions per piece, always the user's call:

- **Select** — pick one observed structural approach and execute it in the target project's own naming/values
- **Combine** — synthesize a new direction blending ideas from multiple observed approaches — still fully original to the target project
- **Declined** — recorded with reasoning, so the same question doesn't get re-asked next reference pass
- **Needs more data** — stays open, explicitly waiting on another reference to confirm a real pattern vs. one system's idiosyncrasy

## Step 5 — Graduate, don't log

Nothing from this dialogue persists to a dedicated log — the anatomy-checklist conversation itself is the deliverable, and once it's resolved, its job is done. Findings graduate only if they clear one of two bars:

- **Roadmap-worthy** (a Select/Combine disposition the user wants to act on) → propose it as a `PLAN.md` phase/item. From there, normal project flow applies: `PLAN.md` → `progress.md` (once work starts) → component registry (once built).
- **Genuinely strategic** (a real trade-off, pivot, or judgment call — not a routine anatomy-level pick) → note that it's `DECISIONS.md`-worthy and let the user decide whether to add it. This is the exception, not the default — most anatomy decisions (e.g. "this component's border is grey.200") don't rise to that bar and shouldn't be logged anywhere beyond the code itself once built.

`Declined` and `Needs more data` dispositions stay live only in conversation for that session — they're not failures, but they aren't persisted either. If a declined or open question is likely to recur across future reference passes, that's itself a signal it might be worth a `DECISIONS.md` note rather than being silently re-asked next time.
