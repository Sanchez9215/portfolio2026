# Software Observability — Rewrite Plan

**Intent:** Roadmap + rationale for the concise rewrite (`ReviewDoc/Rewritten/SW-observability-web.md`) — 32 target beats replacing the current 68-entry section list, in place, on `sw-observability-rewrite`. Status per beat only; content decisions go in `DECISIONS.md` once made (create when the first one lands).

**Source doc:** `ReviewDoc/Rewritten/SW-observability-web.md` — treat as the spec for copy/structure per beat. Current-section mapping below is a starting read; confirm against `page.tsx` when a beat is actually worked.

**Status legend:** ⬜ not started · 🔶 in progress · ✅ done

---

| # | Beat | Action | Current section(s) | 🔍 Needs you | Status |
|---|------|--------|---------------------|---------------|--------|
| 1 | Intro | keep copy, swap hero visual | `SectionIntroduction` | ~~real impact figure~~ (kept, no hard number available), ~~timeline dates~~ (Q2 2025) | 🔶 content done; hero visual now a real entrance animation + scripted ghost-cursor walkthrough (`software-experience-embed`, `ghost-cursor`) — see progress.md and "Layer Inspect" below. Timing not yet tuned |
| 2 | Brief | unchanged | `section.brief` | — | ✅ verified unchanged |
| 3 | The Problem | unchanged | `section.the-problem` | — | ✅ verified unchanged |
| 4 | User voice | unchanged copy | `section.user-quote` | ~~quote attribution~~ (added: sentiment, not a real single source) | ✅ |
| 5 | Stakes | unchanged | `section.support-metrics` | ~~stat source citation~~ (Nexthink 50%, Zylo $19.8M — replaced $45M) | ✅ |
| 6 | Research | cut 3 empty xs labels | `section.research` | — | ✅ |
| 7 | Insights & Goals | tighten Goal 2 body | `section.insights-and-goals` | — | ✅ |
| 8 | Observability First | merge + promote to display beat, cut hedge line | `section.framework-adaptation`, `section.observability-first` | — | 🔶 framework-adaptation trimmed; observability-first is now the `ObservabilityEyes` collage; sections kept separate, joined by a funnel/spine transition motif (`FrameworkFunnelSpine`, blind pass — see progress.md) |
| 9 | Data. Data. Data | unchanged | `section.data` | — | ✅ copy unchanged; reworked into a 100vh sticky-scroll scene (centred context + scroll-scrubbed hub column) — see progress.md |
| 10 | **Designing for Data Uncertainty** (new labeled beat) | merge two one-liners into one thesis beat | `section.modular-design-approach` (absorbed `section.data-ops`) | ~~which data category fell through~~ (proof deferred to XOPS's planned interactive modularity toggle, `xops/PLAN.md` item 12) | ✅ merged + trimmed to one line each |
| 11 | Parallel Prototyping | unchanged | `section.parallel-prototyping` | — | ✅ copy unchanged; reworked into a 100vh sticky-scroll scene (left display block + scroll-scrubbed prototype gallery with sticky top labels + fade-in) — see progress.md |
| 12 | Prototype Validation | elevate glossary as evidence | `section.data-dictionary`, `section.prototype-validation` | — | 🔶 split into two sections this session: `section.data-dictionary` (`DataDictionaryScene`, the pinned scaffold→real-table build, was phases 2–5 of the old combined scene) now sits right after Parallel Prototyping; `section.prototype-validation` (plain full-100vh `LabelBlock` reveal, was phase 1) now sits after it, leading into the first hotspot section; see progress.md Resume Context |
| 13–14 | Overview Prototypes 1 & 2 | superseded — see "Hotspot Annotation System" below | `section.overview-prototype-1`, `section.overview-prototype-2` | — | 🔶 both prototypes now live-embed hotspot experiences (Proto 1: 7 Assumption hotspots; Proto 2: 7 Decision hotspots, blind pass); touch support still open |
| 15 | All Software View | merge, delete Core Attribute Intent + gaps-identified transition | `section.all-software-view`, `section.core-attribute-intent`, `section.gaps-identified` | — | 🔶 `gaps-identified` superseded — rebuilt as a kept hexagon honeycomb scene (`GapsIdentifiedHexScene`), not deleted; see progress.md. All Software View / Core Attribute Intent merge still open |
| 16 | All Software Prototype 1 | cut to 4 judgment cards | `section.all-software-prototype-1` | — | 🔶 superseded — live hotspot experience built (`AllSoftwareLegacyHotspots`), all 8 cards kept as hotspots instead of cutting to 4; blind pass, see progress.md |
| 17 | Software Profile | delete Utilization & Cost Summary, fold line into Profile Block | `section.software-profile`, `section.software-profile-quote`, `section.utilization-and-cost` | — | ⬜ |
| 18 | Profile Prototype 1 | cut "Product Identity/logos" card | `section.profile-prototype-1` | — | 🔶 superseded — live hotspot experience built (`SoftwareProfileLegacyHotspots`), all 5 cards kept as hotspots instead of cutting Product Identity; absorbs `section.software-profile-quote`; blind pass, see progress.md |
| 19 | Lifecycle Timeline + Generating Events | keep all, rewrite one display line | `section.lifecycle-timeline`, `section.generating-events`, `section.event-iterations`, `section.final-lifecycle-timeline` | — | 🔶 `lifecycle-timeline` rebuilt as a pinned word-reveal scene (`LifecycleTimelineScene`); other 3 sections + the display-line rewrite still open, see progress.md |
| 20 | Unifying Systems | merge with Setting a Blueprint, compress method clause | `section.unifying-systems`, `section.unifying-systems-prototype` | — | ⬜ |
| 21 | Testing the Experience | copy unchanged | `section.testing-the-experience` | — | 🔶 live connected embed (`LegacyExperienceEmbed`) replaces the static image plan, fully interactive, no ghost-cursor here — the ghost-cursor walkthrough actually lives on beat 1's hero embed instead (prior status here was stale, corrected in progress.md) |
| 22 | Validation | merge Two Track Validation + cross-functional sessions, cut résumé line | `section.two-track-validation`, `section.cross-functional-sessions`, `section.phase-one-clarity` | — | ⬜ |
| 23 | All Software: Issues → System Debt → Final | restructure — merge issue/fix cards into before/after pairs | `section.all-software-direction-issues`, `section.direction-issue-annotations`, `section.all-software-experience-issues`, `section.experience-issue-annotations`, `section.design-system-refinements`, `section.refinement-annotations`, `section.all-software-final`, `section.all-software-final-design` | — | ⬜ |
| 24 | Table Anatomy | cut Vendor/Category cards, fold Tooltips in as trust card | `section.table-anatomy`, `section.row-anatomy`, `section.tool-tips`, `section.tool-tips-final-design` | — | ⬜ |
| 25 | A Configurable Surface | merge Customizable Columns + Drag-and-Drop into one beat | `section.custimizable-columns`, `section.custimizable-columns-final`, `section.Drag-and-Drop-Reordering`, `section.Drag-and-Drop-final` | — | ⬜ |
| 26 | Software Profiles: Issues → Final | trim final cards 8 → 4 | `section.software-profile-issues`, `section.profile-issue-annotations`, `section.software-profile-final`, `section.profile-final-design` | one issue card's body doesn't match its label — real observation? | ⬜ |
| 27 | Scope and Trade-Offs | unchanged, lead with the decision | `section.scope-tradeoffs`, `section.descoped-views` | — | ⬜ |
| 28 | Inactive License Distribution | merge 3 chart sections into 1 | `section.inactive-license-distribution`, `section.distribution-overview`, `section.inactive-by-departments`, `section.inactive-by-costCenter` | — | ⬜ |
| 29 | Software Overview Revisit | delete completion QuoteBlock | `section.overview-revisit`, `section.overview-final`, `section.completion`, `section.final-design` | — | ⬜ |
| 30 | Product & Business Impact | unchanged structure | `section.impact`, `section.goal-connections` | velocity (ping→ship timeline), Broadcom number, named engineering moment | ⬜ |
| 31 | Reflection | merge 2 cards into 1, add concrete cut-metric example | `section.reflection` | which metric got cut between prototype 1 and 2 | ⬜ |
| 32 | Next Steps | unchanged | `section.next-steps` | — | ⬜ |

---

## Hotspot Annotation System (beat 13, supersedes prior ✅ status)

Replaces the static Assumption/Finding cards under Overview Prototype 01 with a scroll-driven interaction on the live `OverviewLegacy` embed (Figma node `914:5296`, file `C3PsgZV3jZMHgm4bFZJOVP`): the embed grows from small → full-width as the section scrolls into view, then pins to the top of the viewport. While pinned, a spotlight overlay dims everything except the target UI element(s) for the active hotspot; a pulsing circular hotspot marks it, and a yellow-accent (case study's own yellow/500) tooltip card ("Assumption" label) surfaces the original assumption behind that design choice. Scrolling advances the sequence — current hotspot/tooltip fades out, the next fades in — until the pin releases and normal scroll resumes.

**Status — all 7 hotspots built, mechanism complete:** Geographic Filtering, Licensing Model Breakdown, Expiring Licenses, Inactivity Threshold, Compliance Granularity, Lifecycle Stage Terms, Stage-Level Alerting. Over-Assignment intentionally skipped. Every hotspot's body is the original Assumption line from the Assumption/Finding cards, except Geographic Filtering (keeps its own already-final line). The 8 hidden static cards' fate (delete vs. keep as recap) is still undecided.

Two mechanism extensions beyond the original single-target/single-beat design:
- **Multi-target spotlight** — `HotspotOverlay` accepts `targetIds: string[]`; each id gets its own cutout via a single SVG `<mask>` (one dark fill, multiple holes) instead of one box-shadow-spread div per cutout, which compounded darkness across cutouts when a hotspot had more than one target.
- **Multi-beat hotspots** — `useScrollHotspotSequence` flattens hotspots into "slots" (`subBeats`, default 1); Stage-Level Alerting uses 3: highlight (button + flagged rows, via `Table`'s `dangerHotspotId` prop) → modal forced open → modal forced closed, ending the sequence, via `OverviewLegacy`'s `forceAlertsOpen` prop.

**Pinned-viewport panning:** the embed's true content height exceeds one viewport once nothing gets cropped, so `pin:true` alone made anything below the fold unreachable. `LiveEmbed` now supports a fixed `viewportHeight` + `panTargetIds`: the container stays a fixed height (viewport minus nav, measured live) and the canvas pans vertically to center whichever hotspot is active, scrubbed by the same slot-local progress as the spotlight (no independent timer). `AlertsPanel` needed a portal to `document.body` — its `position:fixed` backdrop was getting trapped inside the transformed (scaled + panned) canvas, which becomes the containing block for fixed descendants per spec — plus a `boundsRef` so the backdrop matches the embed wrapper's exact edges, with the panel inset 32px inside via padding.

**Mechanism history:** tried wheel-jacked stepping (capturing `wheel` events, blocking native scroll, one gesture = one step) to guarantee a single scroll gesture never skips past a hotspot — reverted after repeated breakage (pin not engaging, page scroll getting stuck, animations killed mid-flight) traced to GSAP `pin:true`'s async `onEnter`/`onLeave` racing against manual `preventDefault()`. Currently on the scroll-scrubbed `ScrollTrigger` (`scrub` + `snap`) approach in `hooks/useScrollHotspotSequence.ts`: pin holds for a fixed scroll distance per slot (1200px), each grows (15%) → holds → shrinks (15%) with no gap, overlapping directly into the next. Known accepted trade-off: a fast/momentum scroll can still carry through more than one hotspot in a single gesture — not solved, deliberately deprioritized after the wheel-jack rebuild proved worse than the problem it fixed.

**Known gap — touch support:** not started. Needs its own pass.

## Layer Inspect (hero embed mechanic, beat 1)

**Why this exists:** the case study's audience needs proof of systems thinking and technical building ability, not just product design — a mechanic that lets a visitor "peel back the layers" of a real screen doubles as that proof. Rather than building XOPS's two separate deferred ideas — a code-reveal toggle and a static "plugs into real systems" architecture diagram — as two disconnected features, both are absorbed into one unified interaction: **XOPS `PLAN.md` items #6 (code-reveal toggle) and #11a (config-as-YAML + plugs-into-real-systems visual) are superseded by this and no longer separately planned there.**

**Flow:**
1. The hero embed (`software-experience-embed`) loads on Overview and auto-navigates itself (scripted `ghost-cursor`) to Software Profile — **built this session**, see progress.md.
2. Once there, the visitor is offered a choice: use the prototype normally, or enter Layer Inspect — **not built yet**. Wording/UI for this choice still open.
3. Layer Inspect fades out everything except the selected screen and drops into a stacked-card view (hand-sketched reference: numbered cards fanned behind the front/rendered view) the visitor can step through: **Design System** (component + token boundaries) → **Data** (which source table/join computed this number — ties into `xops/PLAN.md` #11's source-tagged model) → **Systems** (which real-world upstream system this would come from in production — absorbs #11a) → **Code** (the literal source — absorbs #6).
4. **First-pass scope: Software Profile only.** The screen-selector step doesn't offer All Software yet — that's future work once the pattern is proven on one screen.

**Not yet built:** the two-button choice UI, the stacked-layer view itself for any layer, and the All Software variant. Ghost-cursor auto-navigation (step 1) is the only piece built so far.

## Visual storytelling (separate track, build priority order)

Not gating the copy/structure rewrite — tackle after content lands, or opportunistically per beat if cheap.

1. Real hero image/recording (beat 1)
2. Full-prototype capture (beat 21) — already an open Resume Context item
3. Data-uncertainty before/after or live toggle (beat 10)
4. Before/after slider on table redesign (beat 23)
5. Drag-and-drop motion clip (beat 25)
6. Annotated hotspot row anatomy (beat 24)
7. Framework-inheritance entrance animation (beat 8) — nice-to-have

## Deferred

- **Animations from `casestudiesv2`** — revisit after this rewrite's content/images are complete; not part of this plan.

## Resume Context

Active mid-build or about-to-build state. Remove once folded into `progress.md`.

### Beat 8 (observability-first)
Framework-adaptation trimmed/de-hedged; observability-first is the `ObservabilityEyes` collage. Sections stay separate, joined by the `FrameworkFunnelSpine` funnel/spine transition motif (built, blind pass — full mechanism + verify checklist in `progress.md` Resume Context).
