# Software Observability — Progress

**Intent:** Status board only — what's built, what's not, what's next.

**Format rule (hard limit):** the Built sections list is a plain numbered list, `` `section.name` `` only — one line, no inline structure/annotation notes. Anything worth recording about a section belongs in `## Deferred (Roadmap)` (future work) or `## Resume Context` (active mid-build state) instead — never appended to the list entry, since the actual structure is always in the code.

## Session Workflow

1. Read this file + `guidelines.md` + `components/built-components.md` + `styles/globals.css` + `.claude/skills/component-builder/SKILL.md` + `.claude/skills/section-builder/SKILL.md`
2. User provides a Figma node + context — layer names follow component and DOM element naming conventions; existing tokens/components referenced where possible
3. **Before invoking any skill** — independently verify:
   - Read `components/built-components.md` — cross-reference every named component layer in the Figma against the registry
   - Read `design-system/tokens.json` and `styles/globals.css` — resolve all token bindings
   - Only the parent layer name is authoritative (e.g. `ImgCard`, `LabelBlock.Display`) — treat it as the component reference and look up its real prop API in the codebase. Do not derive structure from Figma's internal sub-layer tree. If it's unclear how content maps into the component's props, ask before building.
   - To resolve a token tier, match the Figma style's full combination of properties (font-family, weight, size, line-height) against the codebase's token definitions — not just the Figma style's name, and not just a single raw pixel value in isolation. If nothing lines up cleanly, ask which tier to use rather than guessing. Don't request a screenshot when metadata + design context already answer the question.
4. Branch on intent:
   - **New component** → run `/component-builder` — complete pre-build checklist, wait for confirm before writing code
   - **New section** → check registry for any new components first; run `/component-builder` for each, then `/section-builder`; before proposing any CSS, grep the stylesheet for existing structural patterns — reuse exact matches, present the closest match and ask if nothing fits exactly, only propose a new rule after confirming with the user that nothing existing covers it
5. Documentation (this file, `built-components.md`) is batched once at session end, not after each section.

---

## Built sections (in page order)

Format: plain numbered list, `` `section.name` `` only — no inline structure/annotation notes. Anything worth recording about a section belongs in `## Deferred (Roadmap)` (future work) or `## Resume Context` (active mid-build state) instead — never appended to the list entry, since the actual structure is always in the code.

1. `SectionIntroduction`
2. `section.brief`
3. `section.the-problem` (absorbed `section.support-metrics` AND `section.user-quote` — metric cards and the user quote now render as later beats inside `TheProblemPinnedScene` itself)
4. `section.research`
5. `section.insights-and-goals`
6. `section.framework-adaptation`
7. `section.observability-first`
8. `section.framework`
9. `section.data`
10. `section.modular-design-approach` (absorbed `section.data-ops`; label now "Designing for Data Uncertainty")
11. `section.parallel-prototyping`
12. `section.data-dictionary`
13. `section.prototype-validation`
15. `section.overview-prototype-2`
16. `section.gaps-identified`
17. `section.all-software-view`
18. `section.core-attribute-intent`
19. `section.all-software-prototype-1`
20. `section.software-profile`
21. `section.profile-prototype-1` (absorbed `section.software-profile-quote` — quote is now the left column, 1/7, beside the live hotspot embed on the right, 7/13)
22. `section.utilization-and-cost`
23. `section.lifecycle-timeline`
24. `section.generating-events` (absorbed `section.event-iterations` — both merged into one Figma-sourced section, `GeneratingEventsContent`)
25. `section.final-lifecycle-timeline`
26. `section.unifying-systems`
27. `section.unifying-systems-prototype` (`section.final-prototype`, between this and prior in Figma, intentionally skipped)
28. `section.testing-the-experience`
29. `section.two-track-validation`
30. `section.cross-functional-sessions`
31. `section.phase-one-clarity`
32. `section.all-software-direction-issues`
33. `section.direction-issue-annotations`
34. `section.all-software-experience-issues`
35. `section.experience-issue-annotations`
36. `section.all-software-final`
37. `section.all-software-final-design`
38. `section.table-anatomy`
39. `section.row-anatomy`
40. `section.tool-tips`
41. `section.tool-tips-final-design`
42. `section.design-system-refinements`
43. `section.refinement-annotations`
44. `section.custimizable-columns`
45. `section.custimizable-columns-final`
46. `section.Drag-and-Drop-Reordering`
47. `section.Drag-and-Drop-final`
48. `section.software-profile-issues`
49. `section.profile-issue-annotations`
50. `section.software-profile-final`
51. `section.profile-final-design`
52. `section.scope-tradeoffs`
53. `section.descoped-views`
54. `section.inactive-license-distribution`
55. `section.distribution-overview`
56. `section.inactive-by-departments`
57. `section.inactive-by-costCenter`
58. `section.overview-revisit`
59. `section.overview-final`
60. `section.completion`
61. `section.final-design`
62. `section.impact`
63. `section.goal-connections`
64. `section.reflection`
65. `section.next-steps`

---

## Deferred (Roadmap)

- **Prototype card pattern — 1 of 3 resolved** — `section.unifying-systems-prototype` swapped this session to `ImgCard`'s bare `images` row (no longer sticky/scrolling — cards now stack under the label/text block). `section.unifying-systems` and `section.parallel-prototyping` still inline their own copy of the sticky-label/image card CSS — same fold-into-`ImgCard`-or-`PrototypeCard` fix applies whenever those two stop needing the sticky-scroll behavior.
- **`ImgCard` `card`→`bare` migration** — `bare` is now the default variant; the ~27 pre-existing call sites were pinned to `variant="card"` to avoid a visual regression rather than migrated. Move them to `bare` (or drop the variant entirely) once their look is confirmed to still work without the border/padding.
- **Body text → 18px semibold** — `section.generating-events`'s Figma source shows all body copy (detail block, steps-intro block, step bodies) at 18px semibold; `Block` only supports regular weight today, so these currently render at regular. Add semibold support to `Block` (or a scoped override) and apply across this section once confirmed.
- **`Section` layout prop** — give `Section.tsx` a `layout="grid"|"flex"` prop so flex sections never receive `cs-grid` in the first place, instead of winning a specificity fight against it.
- **Rewrite visual track** (hero image/recording, full-prototype capture, before/after slider, drag-and-drop clip, annotated hotspot row anatomy) — see `PLAN.md`'s "Visual storytelling" section; not gating the content rewrite.
- **XOPS interactive modularity toggle** — the actual visual proof for the "Designing for Data Uncertainty" beat; lives in `xops/PLAN.md` item 12, depends on the (now built) source-tagged data model.
- **Spacing scale migration to XOPS's numeric shape** — portfolio's named scale (`--spacing-xs/sm/md/lg/xl/2xl/3xl/4xl/5xl`, 4/8/16/24/32/48/64/96/128) is missing intermediate steps XOPS's numeric scale has (e.g. 12px, `--xops-spacing-12`). Full rename touches ~394 call sites across 32 files (`styles/globals.css`, `design-system/tokens.json`, every component module). `HotspotOverlay.module.css`'s tooltip card padding is hardcoded to 12px in the meantime — see its inline comment.

---

## Resume Context

Active mid-build or about-to-build state, keyed by keyword. Multiple sessions may run in parallel — keep one entry per active thread. Remove an entry once its section is complete and folded into `## Built sections`.

### `gaps-identified` — hexagon honeycomb rebuild, not yet visually verified
`GapsIdentifiedHexScene.tsx` replaces the old centered LabelBlock intro with a Figma-sourced (`1472:4207`) freeform hexagon field: 11 pointy-top hexagons (filled = `--surface-card`, dashed outline = `--surface-card-border`), 3 carrying the split statement ("With gaps identified…" / "I had the confidence to kick off…" / "All Software and Profile designs."), scaled to fill a sticky 100vh stage. Sticky-stage mechanism (not GSAP pin), same convention as `FrameworkScene`/`DataScrollController`. Reveal is a scrubbed opacity stagger, top → down-left → out-right, starting at `"top top"` (matches the case study's standing sticky-scene convention).

An earlier pass in this session had 13 hexagons (2 extra ones bleeding above the section, meant to be visible only during the pre-pin scroll-in) with an 8px gap and a `"top 75%"` early trigger start to catch that bleed reveal. **Both were reverted this session** — the 2 overflowing hexagons are removed entirely (11 remain), gap is now 16px (uniform on all 6 sides via a center-scale on the shape layer, `HEX_GAP` in the .tsx), and the trigger start is back to `"top top"`. The 128px top padding + top-alignment (`.stage` in the CSS module, `--spacing-5xl`) stayed, so the top row sits flush against that padding.

**Next session starts here:** none of this has been visually verified in-browser yet — check the field scales/positions correctly at the stage width, the 16px gap reads evenly on all sides, the reveal stagger timing feels right, and the 3 text hexagons' copy doesn't overflow their shape at any viewport width.

### `unifying-systems` — converted to sticky scroll-scrub, now byte-for-byte matched to `parallel-prototyping`
Matches `section.parallelPrototyping`'s mechanism exactly: `position:sticky; height:100vh` section, wrapped in `DataScrollController fadeIn`, left column (`grid-column:1/7`, `display:grid; grid-template-columns:subgrid`, centred) holds the `LabelBlock` + a `Block` constrained to `grid-column:1/4` (`.unifyingSystemsDetailBlock`, mirrors `.parallelPrototypingDetailBlock`), right column (`grid-column:8/-1`, `data-scroll-body`) holds a vertical stack of 4 bare image cards (Claude Profile + 3 Figma tabs) with sticky per-card labels, scroll-scrubbed 1:1. This session aligned it to `parallel-prototyping`'s cleaned-up structure: scroll column widened from `7/-1` to `8/-1`; `<img>` no longer wrapped in a `.unifyingSystemsCardImg` div (classes moved directly onto the `<img>`); first card's image gets `padding-top:var(--nav-height)`; label spacing moved from card-level `gap` to `padding-block` on the label itself.

`unifying-systems-prototype` ("Setting a Blueprint") stayed on its static layout (left text wrapper + full-width multi-image `ImgCard`, not scroll-driven) — not part of this rework.

**Next session starts here:** verify `unifying-systems` pins/scrubs/releases cleanly (sticky labels park at `--nav-height`, gallery hands off card-to-card, `fadeIn` lands the right column in time with the left text reveal), and confirm the LabelBlock/Block copy still reads correctly now that the 4 images no longer include a distinct "top row" visual emphasis on the Claude prototype.

### `the-problem` sticky-stage sequence
`TheProblemPinnedScene.tsx` drives the whole section as one continuous scroll sequence. Full beat order: reveal (detail block text line-by-line, then message card fade + real-`height` grow, rows fade in per-row **geometrically gated** — each bubble only fades once the growing card's edge has passed its bottom + one gap) → `PIN_HOLD` → detail block exits → card grows to fullscreen via **real `width`/`height`/`x`/`y`** (not `transform:scale`) with bg color-transforming grey → `--accent-warning`, messages exit per-side → "The Problem" label/body/support fade in → hold → exit up as one group → `MetricCard`s fade in centered, values **count up in real time** (not scrubbed — a scrubbed count freezes misleadingly mid-scroll) → hold → exit → `QuoteBlock` fades in (mark → text → emphasis → attribution) → hold → stage scrolls away. Absorbs `section.support-metrics` + `section.user-quote`. All scroll-length/stagger constants at the top of the file with inline rationale; multi-item stagger values are *derived* so reveals finish exactly at each phase's end.

**Mechanism (rearchitected this session — was GSAP `pin`, now `position:sticky`):** `.scene` is a plain scroll-track with JS-set height `calc(100vh + RUNWAY)` (RUNWAY = sum of all beat lengths); a `.stage` (`position:sticky; top:0; height:100vh`) holds the content and sticks for exactly RUNWAY, then releases and scrolls away carrying the fullscreen quote up into the next section. The card grows *inside* the fixed-height stage, so its growth never changes `.scene`'s height → no pin-spacer desync, no reserved void, no overlap into the next section, no abrupt reset. The old `pin:true` approach reserved only the small mount-time height (→ overlap) and a `min-height:100vh` patch fixed overlap but left a visible void; sticky resolves both.

**Load-bearing, don't revert:** card grows via real box resize, not `transform:scale` — scale distorted descendants (text/grid/radius), off-center origin clipped by `html{overflow-x:clip}`, `scaleY` viewport-dependent. Two corollaries:
- **`messageScreenEl` is a sibling of `.messageCard`, not a child** — overlays the card's resting band; structurally immune to what the card does.
- **Label/body/support + quote lines are explicitly authored (not `SplitText` auto-wrap)** — the card's width changes continuously via scrub, so layout-detected wraps measure a stale width.

Official GSAP skills at `.claude/skills/gsap-{core,scrolltrigger,react,plugins,timeline,performance,frameworks,utils}` — read the relevant one before changing GSAP code here.

**Next session starts here:** sticky rearchitecture is a blind first pass (no visual verification). Verify: whole sequence plays, fullscreen card reaches true fullscreen without ancestor clipping, stage scrolls away cleanly into Research (no overlap/void), reveal-void below the small card during reveal (center content in stage if it reads empty). `markers:true` still on all three triggers — strip when done debugging. Known fit risk: with 24px bubble text / 20px padding / 24px gap / 64px top inset, the last message's (bottom + gap) may exceed the settled reveal height and clamp to fade at the card edge.

### `section.framework` — pinned spatial diagram
`FrameworkScene.tsx` — new section between `observability-first` and `data`. **ONE `pin:true` ScrollTrigger driving ONE scrubbed timeline** (the canonical ScrollTrigger pattern). Timing is off the real `<Section>` (padding-aware, `start: top top+=nav-height`) but the pinned element is `.scene` itself — our own simple `position:relative` div — never the shared, `display:grid` `<Section>` component. `pin:true` is correct here (unlike `TheProblemPinnedScene`, which grows a card and had to go `position:sticky`): `.scene`'s height is JS-set once to the full diagram height and never changes mid-animation, so the pin-spacer can't desync. `.scene`'s height is the FULL diagram (taller than one viewport) — not clamped — so after the pin releases, free scroll reveals the Insights star's lower portion with no extra mechanism.

Beats, all on the one timeline (Figma: start `1162:6244`, framework end `1188:6589`, final content `1313:3540`):
1. **Settle + unfurl** — Overview (heptagon), All Assets (circle), Profiles (pentagon) start stacked concentric with Insights (star) at the diagram center; Insights settles first (travels + scales in, so the inputs never track over it), then the 3 inputs unfurl overlapping-staggered (Overview → All Assets → Profiles), each fading its label/body in as it lands.
2. **Rise** — the whole `.content` wrapper (heading + SVG + labels) translates up by a measured `riseAmount` so the heading exits behind the fixed nav and the row's top locks `ROW_LOCK_TOP_MARGIN=48`px under the nav. One transform moves everything together.
3. **Connectors** draw in together, corner-to-corner.
4. Hold (`HOLD_AFTER_CONNECTORS=250`).
5. **Wipe + content swap** — all 4 shapes wipe to solid blue-500 top-to-bottom simultaneously, old (grey) label/body swapped for new (dark grey-900) content.
6. Hold (`HOLD_AFTER_WIPE=500`), then release.

**Architecture history — don't re-attempt:** an earlier draft tried to literally unpin-after-settle → free-scroll → re-pin, via TWO ScrollTriggers both pinning the same element. That's unsupported (one element = one pin-spacer) and blacked the whole scene out from load. The "heading away / row rises" beat is the rise translate (beat 2) inside the single pin — visually identical, structurally sound. A `.camera` vertical-pan layer was also tried and reverted (it caused shapes to shift during the connector beat and delayed pin engagement).

**Shapes:** all 4 + 3 connectors + 4 wipe fills in one shared inline SVG, viewBox fixed to the diagram's measured px size (1 unit = 1px) — shapes animate real geometry (radius / regenerated polygon-or-star points), never `transform:scale`, so the shared 1px/6-4-dashed round-cap stroke never scales. Stroke color tweens blue-500 → grey-900 (`getComputedStyle` at mount).

**Wipe mechanism:** a filled blue-500 twin of each shape's final geometry, clipped by a `<rect>` (per-shape `<clipPath>`) whose height grows 0 → full bounding box — top-to-bottom reveal. Content crossfades at the wipe's midpoint (old fades out, `textContent` + `.revealed` class swap in, new fades in). `.revealed` locally overrides `--text-primary`/`--text-tertiary` → `--text-inverse-primary` (grey-900) so the new copy reads on blue — same scoped-CSS-var technique as `TheProblemPinnedScene`'s `.messageCard`, not a new Label color variant.

**Label anchor transition (fixes stacked-labels-overlapping bug):** at the concentric start each label is anchored to its own shape's TOP edge (per Figma start `1313:3494`), so the 4 different-sized shapes' labels sit at different heights and stay legible while stacked. `anchorY()` interpolates label position from "near its top edge" (`anchor=1`) → "true center" (`anchor=0`) over each shape's move tween; the label+body wrap stays `translate(-50%,-50%)`, so growing the body's height on reveal re-centers and visually lifts the label ("push up") for free.

**Timeline-duration subtlety:** a trailing empty spacer tween pads the timeline to exactly `TOTAL_RUNWAY` — otherwise trailing empty time isn't counted in a timeline's duration and the scrub would stretch the wipe to the very end instead of leaving `HOLD_AFTER_WIPE` of held state.

**Spacing:** `GAP_HEADING_TO_ROW=64`, `GAP_ROW_TO_INSIGHTS=128` — computed at runtime into `rowCenterY`/`insightsCenterY` off the measured heading bottom, not hardcoded per-shape. Connectors corner-to-corner: Overview's bottom-right → star's farthest-left; Profiles' bottom-left → star's farthest-right; All Assets' bottom-center → star's top-center. Polygon corners via nearest-vertex-to-angle (45°/135°); star extremes are its outer vertices with min/max x or min y.

Establishes **100vh as the new default for section-building** — recorded in `section-builder`'s SKILL.md (Layout system) with the freeform/absolute-positioning departure for spatial-composition sections.

**Open / unverified:** Insights star `spikes:4, innerRatio:0.55` is a guess (Figma exported it only as a raster PNG, no vector to match). Tunable values not pixel-matched to Figma: row `endXPercent` (16/50/84), `ROW_LOCK_TOP_MARGIN`/`LABEL_TOP_PADDING`/`SCENE_BOTTOM_PADDING` (48/16/48), `RISE_LENGTH=400`, and connector line styling (defaulted to the shapes' 1px/6-4 dashed grey-900). The beat-length constants (`INSIGHTS_MOVE_LENGTH` etc.) are at the top of the file with inline rationale.

### `testing-the-experience` — `LegacyExperienceEmbed`, no ghost-cursor (correction)
This entry previously claimed a `GhostCursor` scripted autoplay was confirmed working on `LegacyExperienceEmbed` here — that was stale/inaccurate. No `GhostCursor.tsx` existed anywhere in the repo, and `LegacyExperienceEmbed.tsx`'s own comment says "Fully interactive on load — no ghost-cursor autoplay." `LegacyExperienceEmbed` itself (real `OverviewScreen` ⇄ legacy `AllSoftwareLegacy` → `SoftwareProfileLegacy`) is real and unchanged. The ghost-cursor work actually landed this session, on `SectionIntroduction`'s hero embed instead — see the new entry below.

**Known open items (still real, not part of this session's work):**
- Unrelated pre-existing console noise: a React key-spread warning + repeating GSAP `<line>` attribute errors (`x1`/`y1`/`x2`/`y2` "Unexpected end of attribute") from `FrameworkScene.tsx`'s connector-line code — confirmed this session as a one-time burst during initial `ScrollTrigger` setup (not an ongoing per-frame drain), not fixed.
- Deferred, not built: an exit/restart control for the 4 existing hotspot embeds (Overview 1/2, All Software, Profile) so a visitor who navigates out mid-sequence can back out and replay — flagged as real but lower priority than this section.

### `SectionIntroduction` — entrance choreography + ghost-cursor scripted walkthrough
Converted from a static server component to a client component with a real on-load entrance: title's two lines fade up staggered, description fades up as one unit, meta row (Company/Role/Timeline) and impact row fade up together in sequence, hero embed fades/translates up in parallel. Hidden-by-default CSS states (`opacity:0`/`translateY(24px)`) avoid FOUC.

`GhostCursor.tsx` (new, `components/case-studies/software-observability/`) — generic, `forwardRef`, position/rotation/opacity fully owned by a parent's GSAP calls, no built-in centering logic. Drop shadow reuses `--xops-elevation-1`'s five blur/opacity layers verbatim (design-systems/xops/tokens.css) redirected to a bottom-left 45° cast via `filter: drop-shadow()` chaining — a deliberate one-off crossing of the XOPS/case-study token line, not a new token.

`SoftwareExperienceEmbed.tsx` orchestrates a 3-phase scripted sequence (real dispatched `MouseEvent`s on real DOM targets, same "drives actual components underneath" approach `LegacyExperienceEmbed`'s ghost-cursor was meant to use): cursor fades in at a fixed 128px-from-top position → scrolls to reveal the Lifecycle Stage table → scrolls back → clicks Sidebar's "All Software" (`[data-hotspot="nav-all-software"]`, already present, no shared-component edits needed) → moves to the Adobe Acrobat Pro row (found by text match, confirmed rank 6/90 by opportunity — always page 1, no pagination needed) → clicks it open → hovers Inactive Waste stat → hovers Utilization Rate stat → scrolls the **panel's own internal scroll region** (distinct from the embed's outer scroll — different coordinate math) down to Inactive License Distribution → pauses → scrolls back up → unlocks real interaction.

**Load-bearing fix, don't re-break:** the first scroll (Overview → Lifecycle table) was stalling ~350ms, confirmed via real frame-timing instrumentation — the region had never been painted before, and browsers defer rasterizing off-screen content until it scrolls into view. Fixed with `primeScroll()` — an instant, invisible `scrollTop` jump-and-back that forces that paint to happen once, timed to run while the entrance animation still has the embed's opacity low (not the user's focal point). An earlier hypothesis (`gsap.ticker.lagSmoothing(0)`) was tried before this real cause was found, then **removed** — it's a *global* ticker setting, and it broke `SectionIntroduction`'s own timeline (main-thread congestion at mount + no lag smoothing = the timeline's first tick applies the full elapsed gap, jumping straight to the end state on the first frame — "no animation, it just appears"). Don't reintroduce a global lag-smoothing change for a local timing problem.

**Page-wide perf fix, same session:** real frame-jank instrumentation traced most of the remaining stutter to the other 12 heavy XOPS-driven sections further down `page.tsx` — `next/dynamic` (added earlier this session) only deferred their JS download, not their actual mount/render, so they were all doing full DOM-tree work in the background during the hero's critical entrance window. New `components/LazyMount.tsx` (generic, `IntersectionObserver`-gated, 600px `rootMargin`) now wraps all 14 usages of those 12 sections so they only mount once scrolled near.

**Timing is now live-tweakable:** both files expose a top-of-file `TIMING` object (edit + save via Fast Refresh) instead of inline magic numbers; user is mid-tuning values live, current numbers are experimental, not final. Also fixed a bug where the hero embed snapped back to its hidden `translateY(24px)` state right after fading in (a stray `clearProps` call) — removed.

**Next session starts here:** Layer Inspect's reveal sequence (cursor park/wiggle, bubble stack, CTA button) is built this session on `SoftwareExperienceEmbed` — see its entry in `built-components.md` and `PLAN.md`'s Layer Inspect section for the full mechanism. The 16px-radius-on-live-embed item is done (now lives on the component's own `.wrapper`, plus a `.screenClip` fix for a SidePanel corner-clip bug — see `built-components.md`). **User's stated next step: continue adjustments to the intro live embed / ghost-cursor experience** — none of Phase 4 has had a full end-to-end visual pass yet; several rounds of correction already happened this session (bubble positioning/text size, push-up motion, corner radius) but nothing is confirmed final.

### `framework-adaptation` → `observability` funnel/spine transition (rewrite Beat 8)
`FrameworkFunnelSpine.tsx` — one SVG overlay on a shared `.frameworkObservabilityWrap` spanning both sections. Grey-500 funnel morphs flat→shape at Framework top; a spine grows from its peak down to a second up-pointing funnel that morphs out of the big eye's almond (base sunk `FUNNEL_ALMOND_SINK=14`px in) and receives the line at its full-height tip (+`SPINE_FUNNEL_OVERLAP`). Whole line shares the measured almond-center x → one straight vertical. Z-order: wrapper `isolation:isolate` + blob `z-index:1` / overlay `z-index:2` / eyes `z-index:3` (added to the observability CSS block) so the grey line paints over the blue blob but behind the grey almond; all three grey-500, so they merge into one form. Ported from `InsightsGoalsContent` funnel/spine (MorphSVGPlugin + scrubbed ScrollTriggers), minus badges/connectors. Almond found via `querySelector('[data-eye="big"]')`, measured once at mount (stale on late layout shift — accepted, matches insights).

**Blind pass — verify:** seamless single stroke across the section boundary; line rides over the blob, hides behind the almond (never crosses the pupil); second funnel reads as growing organically out of the almond (tune `FUNNEL_ALMOND_SINK`); spine tip meets funnel tip cleanly when the almond centers. LabelBlock copy untouched. Supersedes the old "merge + promote observability-first heading" plan — observability-first is now the `ObservabilityEyes` eye-collage; the two sections stay separate, joined by this motif.

### `insights-and-goals` redesign — funnel/spine/badge/connector motion system
Full redesign done: inverted color scheme (new `--surface-section-inverse`, `--text-inverse-primary/secondary`, `--badge-fill/text` tokens; `Label`/`Title`/`Block`/`TitleBlock`/`LabelBlock` all gained an opt-in `inverse` color, default untouched everywhere else). New 12-col layout (header row 1/7 + 9/13, cards row 1/5 + 9/13) built in `InsightsGoalsContent.tsx`, which now owns the section's full scroll choreography:
- Funnel (`funnel-morph.svg`, native 256×128, centered at the section's top edge) morphs from a flat degenerate path to its real shape via `MorphSVGPlugin` over the section's first 25% of viewport entry.
- A vertical spine (starts 8px into the funnel's peak — `SPINE_FUNNEL_OVERLAP`) grows continuously, scrubbed, stopping exactly at each row's badge (badge Y is *derived*, not measured directly — divider Y − badge half-width − the connector curve's native 46px drop, so the connector's far end lands back on the divider).
- Each badge's reveal is scheduled to *finish*, not start, when the spine arrives.
- Left/right connectors are the real `connector-curve.svg` path at native size (no scaling — mirrored via `scale(-1,1)` for the left side, never stretched), revealed via `strokeDasharray`/`strokeDashoffset`, firing the instant the spine arrives, both sides in sync.
- Extension lines pick up exactly where each connector's native-length end lands and continue the same fill seamlessly out to the card's real outer edge (measured, pulled in by the card's own padding so it stops before entering it, not at the true column edge).
- Cards (fixed 76px heading box + 96px body, so insight/goal rows always align regardless of text length) fade up after their row's extension lands.

**Next session starts here:** same `MorphSVGPlugin` flat→shape technique will be reused for `section.framework-adaptation` next — check this file's `funnelEl`/`FUNNEL_FLAT_D`/`FUNNEL_SHAPE_D` pattern before rebuilding it there. Also still open: scroll-up should not reverse this section's animations (discussed, not yet implemented — needs a max-progress clamp on each `ScrollTrigger` here, scope was left undecided between just this new system vs. the whole section including the label/expert reveal).

### Rewrite content pass (`sw-observability-rewrite` branch)
Working sequentially through `PLAN.md`'s 32 beats. Beats 1–12 done (see `PLAN.md` for per-beat status). Beat 13–14 superseded by the hotspot annotation system below.

### Hotspot annotation system — now all 4 live embeds (beats 13–14, 16, 18; see `PLAN.md`)
Core infra: `OverviewLegacy`/`AllSoftwareLegacy`/`SoftwareProfileLegacy`/`OverviewScreen` embed live via `components/LiveEmbed.tsx` (ResizeObserver-scaled canvas). `components/HotspotOverlay.tsx` spotlights real DOM elements via a single SVG `<mask>` with one hole per cutout — a hotspot can target multiple elements at once without their masks compounding into a double-dark overlay, which independent box-shadow-spread cutouts did. `hooks/useScrollHotspotSequence.ts` flattens hotspots into "slots" (a hotspot's `subBeats`, default 1) so a hotspot can occupy multiple consecutive slots. `LiveEmbed` supports a pinned `viewportHeight` + `panTargetIds` so the canvas pans vertically to center whichever hotspot is active instead of cropping content below one viewport.

**Spotlight/tooltip rework this session (shared component — affects all 5 hotspot embeds, not just Prototype 1):** the grow→hold→shrink-to-zero spotlight scale is gone — the cutout now stays full-size and smoothly chases the live target rect via a per-frame lerp (`gsap.ticker.deltaRatio()` + `gsap.utils.interpolate`, `HotspotOverlay.tsx`'s `RECT_FOLLOW_SPEED`), so moving between hotspots (or panning within one) reads as one continuous glide instead of a shrink/regrow. The pulsing yellow dot marker is removed entirely. `useScrollHotspotSequence` no longer returns `spotlightScale` — only `activeIndex`/`subBeatIndex`/`settled` (still gates tooltip fade via `FADE_FRACTION`). Tooltip placement is now a per-hotspot `placement` field (`"top-left"|"top-right"|"bottom-left"|"bottom-right"`, default `"top-right"`) — the card's sharp (unrounded) corner always points back at the anchor (`sharpCornerClass`, `.corner-*` classes). Only `geographic-filtering` (Prototype 1) has an explicit placement set so far; every other hotspot rides the default and may need its own placement tuned once checked visually. Insight card recolored `--accent-primary` → `--surface-base` with `--text-secondary` text (was blue/grey-900); structure unchanged (title "Insight" + body, no separate label line) — `.tooltipTitle`/`.tooltipLabel`/`.tooltipText` stayed on their original fonts (title = Clash semibold uppercase, label = Cabinet bold), shared as-is by both cards so Insight already matches Assumption's typography without any font swap. (A font-swap was tried and reverted mid-session — wasn't asked for, don't repeat it.)

**Overview Prototype 2 tooltip placement — set this session, unverified in-browser:** `geographic-filtering`/`licensing-model-breakdown`/`lifecycle-stages`/`stage-level-alerting` → `"below-left"`; `compliance-granularity` → `"left-top"`; `expiring-licenses`/`inactivity-threshold` keep the default `"right-top"`. `licensing-model-breakdown` and `stage-level-alerting` cap their spotlight to header + first 3/5 table rows respectively via `targetSelectors` (comma-combined selector → one unioned cutout rect, same technique as All Software's column targeting). `inactivity-threshold` now hugs the forced-open Inactive tooltip panel's top edge instead of the card's top, via a new shared `"inactivity-threshold-tooltip"` id applied to the tooltip panel (new `Tooltip.tsx` `hotspotId` prop — portaled panels had no `data-hotspot` hook before) and the Inactive/Unassigned legend rows (`Legend`'s existing `hotspotId` prop), resolved together via `portalTargetIds` (document-scoped, since the panel lives outside the embed container). `lifecycle-stages` reordered to sit before `stage-level-alerting` in the hotspot sequence array.

**Round 2 fixes (same session, after first-pass visual check):**
- **`HotspotOverlay.tsx` gained two new `Hotspot` fields**, both generic/reusable beyond this one embed: `widthFromSelector` (a container-scoped selector whose own left/width overrides every cutout rect's left/width — for hugging a card's real edges instead of a row that can render wider, e.g. from the table's own horizontal scroll, and go off-screen) and `panTargetIds` (overrides `LiveEmbed`'s pan target when it must differ from the hotspot's own spotlight target — e.g. a hotspot spotlighting a portaled tooltip panel, which has no in-canvas position to pan to).
- **Overview Prototype 2:** `licensing-model-breakdown` and `stage-level-alerting` now also set `widthFromSelector` to their own card's `data-hotspot` id (fixes the row-width-overflow off-screen bug). `inactivity-threshold` now sets `panTargetIds: ["license-utilization-card"]` (previously fell through to `[active.id]`, which matches nothing, so the canvas incorrectly reset pan to 0 — literally the "hides the spotlight below the fold" bug). Removed the "13%" meta next to "Total Annual Spend" (`OverviewScreen.tsx`, unrequested stat, dropped on request).
- **All Software Prototype 1** (`AllSoftwareLegacyHotspots.tsx`): `spend-first-prioritization`/`total-spend` now use one comma-combined `targetSelectors` string (was two separate array entries → two disconnected cutouts, the second unioning *every* row in the column, not just the first 5) capped to the header + first 5 rows. `identification-columns` same technique across all 3 columns, placement `"below-left"`. `category`/`licenses-purchased`/`utilization-rate`/`inactive`/`renewal` all set `placement: "left-top"`.
- **New `Table.tsx` props** (shared XOPS component, additive): `disableVerticalScroll` (inline `overflowY:visible` override so row positions stay fixed for the overlay's nth-child targeting instead of drifting under the table's own internal scroll) and `scrollToX: "start"|"end"` (smooth-scrolls the body horizontally — scripted, not user-driven). Both threaded through `AllSoftwareLegacy.tsx` as same-named props. `AllSoftwareLegacyHotspots` sets `disableVerticalScroll` always on; `utilization-rate` got `subBeats: 2` — beat 0 auto-scrolls the table right (`scrollToX="end"`) with the overlay hidden (`overlayActive` null'd for that sub-beat, mirrors Prototype 1's `stage-level-alerting` modal-reroute pattern), beat 1 shows the normal highlight+tooltip; `inactive`/`renewal` inherit the scrolled-right state since they're further right on the same column set. **Deliberately scripted, not an interaction unlock** — user chose this over unlocking real pointer/scroll interaction at this beat (ties to the still-open "exit/restart control" backlog item below, not solved here).
- **`Tooltip.tsx`/`Legend.tsx`:** `Tooltip` gained a `hotspotId` prop (`data-hotspot` on the portaled panel — portaled panels had no hook before); `Legend`'s existing `hotspotId` prop is now actually used (Inactive + Unassigned rows share `"inactivity-threshold-tooltip"` with the tooltip panel, resolved together via `portalTargetIds` since `document.querySelectorAll` reaches both in-canvas and portaled elements).

**Next session starts here:** none of the above (either round) has been visually verified in-browser yet — check each hotspot's cutout/tooltip against its live target, especially the `widthFromSelector` card-hugging, the inactivity-threshold pan fix, and the utilization-rate auto-scroll beat (timing/smoothness of the `scrollTo` during a scrubbed pin is unverified — may need a non-"smooth" instant jump if the CSS smooth-scroll fights the scrub). Once confirmed, the rest of the still-open items stand: rect-chase smoothing speed across all 5 embeds, and `placement` tuning on the remaining embeds (Profile Prototype 1, Final Lifecycle Timeline) as they're reviewed (user has flagged alignment/placement "will vary" per hotspot, not a single global rule).

**Targeting mechanism has two modes**, both on `HotspotOverlay`'s `Hotspot` type: `targetIds` (default) resolves `[data-hotspot="id"]` — used everywhere a screen's own source is free to annotate (`OverviewLegacy`, `OverviewScreen`, `SoftwareProfileLegacy` all carry real `data-hotspot` attributes). `targetSelectors` (new, added for All Software) resolves a raw CSS selector scoped to the embed container instead — for `AllSoftwareLegacy`'s table, whose header/body cells come from the shared XOPS `Table.tsx` component, deliberately left untouched rather than adding a `hotspotId` prop to a core shared component. Columns are targeted structurally instead: `th:nth-child(n)`/`td:nth-child(n)` off the known column order. Both fields bound their full match set into one shared cutout per entry, same union-rect logic.

**Per-embed status:**
- **Overview Prototype 1** (`OverviewPrototypeHotspots.tsx`) — 7 hotspots (Over-Assignment skipped, no on-screen surface), label "Assumption". Stage-Level Alerting is a 3-slot hotspot (highlight → modal forced open via `OverviewLegacy`'s `forceAlertsOpen` → forced closed). `AlertsPanel` portals to `document.body` with a `boundsRef` so its backdrop matches the embed wrapper's edges.
- **Overview Prototype 2** (`OverviewPrototype2Hotspots.tsx`) — 7 hotspots, label "Decision", embeds the revised `OverviewScreen` (was a static image + Decision cards). Targets: geographic-filtering→PageHeader, licensing-model-breakdown→Top Spend card, expiring-licenses+inactivity-threshold→License Utilization card (shared target), compliance-granularity→Security Compliance card, stage-level-alerting→Lifecycle card, lifecycle-stages→its tabs. Inactivity-threshold force-opens the Inactive legend tooltip (`Tooltip.forceOpen` + `OverviewScreen.forceInactiveTooltip`). No publisher logos (`showLogos={false}`); also drops utilization tags + table scroll-fade — all gated behind props so `/xops-overview` + `/xops-overview-legacy` standalone routes stay untouched. **Was built but not wired into `page.tsx` until this session** — component existed, `section.overview-prototype-2` still rendered the old static block; fixed by swapping it in.
- **All Software Prototype 1** (`AllSoftwareLegacyHotspots.tsx`, beat 16) — 8 hotspots, label "Assumption", all kept (beat's original plan was to cut to 4 — superseded, same as beats 12/13–14/15). Spend-first Prioritization and Total Spend intentionally share the same Total Spend column target (`targetSelectors`, see above).
- **Profile Prototype 1** (`SoftwareProfileLegacyHotspots.tsx`, beat 18) — 5 hotspots, label "Assumption", all kept (beat's plan was to cut the Product Identity/logos card — superseded, kept instead). Absorbs the old `section.software-profile-quote` (quote now the left column, `.profilePrototype1Quote`, 1/7; embed right, 7/13). Renders `SoftwareProfileLegacy` (a side-panel body, not a freestanding screen) inside a manually-reproduced `SidePanel.module.css` chrome shell (padding/bg/border/radius/shadow only — no fixed-position/drag/transform, which only apply to the live overlay panel). `panTargetIds` wired to the active hotspot so the canvas pans to targets below the fold (e.g. Underutilized License Cost) instead of clipping them.

  **Load-bearing gotcha, don't repeat:** the section briefly had an explicit `height:100vh` on `section.profilePrototype1` — broke the pin. The embed's real content height (~6000px, the pin-spacer for 5 hotspots × 1200px) still forces the shared CSS grid row to that height regardless of the section's own fixed height, so the row's content overflowed past the section's box and the next section rendered on top of/over the pinned card. Every other hotspot section leaves its own height `auto` for exactly this reason. Fixed by dropping the explicit height and making the quote `position:sticky; top:var(--nav-height); height:calc(100vh - var(--nav-height)); justify-content:center` instead, so it stays centered in view for the whole pinned sequence without constraining the row.
- **`section.gaps-identified`** (`GapsIdentifiedHexScene.tsx`) — not a hotspot embed (no live embed involved), but same "built but not wired" gap as Overview Prototype 2 — fixed this session. See its own registry entry.
- **Final Lifecycle Timeline** (`LifecycleTimelineHotspots.tsx`, `section.final-lifecycle-timeline`) — 4 hotspots, label "Assumption", copy carried over from the section's old before/after `CardColumn`s. Embeds the real XOPS `LifecycleTimeline` (ZOOM-ONE data) in the same reproduced SidePanel chrome as Profile Prototype 1; targets via `targetSelectors` (component left untouched). Unlike every other embed here, the card hugs the panel's own natural width (580px) and height instead of full-bleed stretching, centered horizontally in the row.

**Next session starts here:** touch support still not started anywhere (see `PLAN.md`). Only Overview 1 has had any visual verification; Overview 2, All Software, Profile Prototype 1, and Final Lifecycle Timeline are all blind passes — verify each hotspot pans/spotlights the intended element, especially All Software's `targetSelectors` columns (nth-child is position-only, easy to silently drift if column order ever changes), Profile Prototype 1's SidePanel-chrome reproduction, and Final Lifecycle Timeline's hugged-card sizing.

### `section.lifecycle-timeline` — `LifecycleTimelineScene` (beat 19, partial)
Replaces the old static `LabelBlock` intro with a pinned word-reveal scene (same sticky-stage-in-a-tall-track pattern as the other pinned scenes, `PIN_HOLD_LEGIBILITY=500` matching `TheProblemPinnedScene`/`PrototypeValidationScene`'s legibility-hold convention): `LabelBlock` reveals via its own built-in trigger → hold → 4 words (What/When/Why/Who) fade up one by one, staggered → the "Who?" description fades in as its own trailing beat → hold → releases.

**Beat 19 status:** `final-lifecycle-timeline` is now the live `LifecycleTimelineHotspots` embed (see Hotspot annotation system above); `generating-events` now absorbs `event-iterations` via `GeneratingEventsContent` (see Built sections #23) — status of that merge/rewrite not verified in this session. No visual verification yet on this scene (blind pass).

### `data` + `parallel-prototyping` sticky-scroll scenes (`DataScrollController`)
Both are now 100vh `position:sticky` scenes wrapped in `DataScrollController` (sticky-stage-in-a-tall-track, **not** GSAP pin — matches `FrameworkScene`/`TheProblemPinnedScene` lesson; drives an inner `[data-scroll-body]` column's `scrollTop` 1:1 with page scroll, holds `HOLD=500`px at the bottom, then releases; reduced-motion keeps native scroll).
- **`data`:** left context (cols 1/5, centred), right hub column (cols 5/-1) scroll-scrubbed. `ContentHub` reworked — each hub is `width:80vw; aspect-ratio:2/1`; fit-to-box scales node positions (not text) to fill a 32px inset (no label clip, constant type); hub type = label-xl, leaves = body-lg semibold; 16px spoke-to-label gap.
- **`parallel-prototyping`:** left display block (cols 1/7, `LabelBlock` reveal) + detail Block, vertically centred; right gallery (cols 7/-1) = 3 **inline** bare cards (no border/padding, label-on-top sticky at `top:var(--nav-height)`), scroll-scrubbed. `DataScrollController fadeIn` scrubs the gallery opacity 0→1 over the approach so it lands with the text reveal.
- **`--nav-height` now accurate:** `Nav.tsx` writes the measured collapsed `offsetHeight` back to `--nav-height` on mount (was a static 80px token) so the sticky labels + every other consumer align to the real nav — fixed a couple-px label crop.

**Blind pass — verify:** both pin/scrub and release cleanly into the next section; sticky prototype labels park exactly at the nav's bottom edge and hand off card-to-card; gallery fade completes at pin; hub webs fill without any label clipping. **Chosen values to confirm:** sticky prototype label `background:var(--surface-base)`; gap tokens (hubs / prototype cards `--spacing-4xl`, left columns `--spacing-xl`). **Copy:** kept existing display-block wording (Figma had minor tweaks — "…the Overview. The entry point."). **Left inset:** Figma showed the prototype-left text inset 32px inside its 6 cols; aligned to col 1 instead.

### `section.data-dictionary` + `section.prototype-validation` — split apart this session (beat 12, see `PLAN.md`)
Previously one combined pinned scene (`PrototypeValidationScene`, phase 1 label + phases 2–5 table build) in a single section. Split into two sections, reordered: `section.parallel-prototyping` → **`section.data-dictionary`** → **`section.prototype-validation`** → `section.overview-prototype-1` (first hotspot). Requested because the old order sandwiched the table-build scene between Parallel Prototyping and the Prototype Validation label, when the label should instead lead straight into the first hotspot experience.

**`section.data-dictionary`** (`DataDictionaryScene.tsx`, was phases 2–5) — unchanged mechanics, just lifted out of the shared timeline into its own pinned scene with `RUNWAY` no longer including the old phase-1 hold/exit. Replaces the static `LabelBlock` + `DataGlossaryTable` (`DataGlossaryTable` now hidden, superseded — exports `glossaryRows`/`glossaryColumns` so this scene reuses its real data as the single source of truth). One continuous pinned `position:sticky` scene (same mechanism as `TheProblemPinnedScene`/`FrameworkScene`: JS-set `.scene` height `calc(100vh + RUNWAY)`, all timeline positions/durations in raw scroll-px, not 0–1 fractions — mixing those two scales was a real bug caught mid-session, before the split). `.stage` pins flush at true `top:0` (no `--nav-height` offset — an explicit correction; don't reintroduce nav padding here without asking, unlike every other pinned scene in this file).

**Beat order (now starts directly at the old phase 2):**
1. **Phase 2** — a 3-column scaffold table (header "The Data Dictionary" + 3 diagonal placeholder statements) builds in **strictly sequentially, column by column** (header fill wipe → divider draw → text fade, each column fully finishing before the next starts — not staggered/parallel).
2. **Phase 3** — the scaffold **shrinks in place** (no crossfade to a second table) to the real `DataGlossaryTable`'s measured corner geometry — text scales down to `--text-body-sm`/`--text-heading-xs`, columns/rows tween to real measured px. Column 1 is the one exception: its width is measured from its own explicitly-authored 2-line placeholder text (`STATEMENT_CELL1_LINES` — same "explicit lines, not auto-wrap" reasoning as `TheProblemPinnedScene`'s `PROBLEM_BODY_LINES`) and the header label, not the real table's column-1 width, so it never clips. `.tableWrap` anchors `align-self/justify-self:start` (top-left), not centered, so the shrink reads as collapsing into a corner.
3. **Phase 4** — columns 4–6 wipe in one by one (same pattern as phase 2), growing the table back to full width.
4. **Phase 5** — old placeholder content fades up/out; the table grows (from a **dynamically measured** row count — see below) more real rows; then column by column, each column's real header label + row values fade up top to bottom, sequential. Once rows finish growing, the **bottom 3 rows fade into the section background** via a `mask-image` gradient on `.tableWrap` (`fadeStartPercent` derived from real row heights) — this is the scene's permanent end state. No second/tail table; rows beyond what fits in one viewport are simply never rendered.

**Row count is measured, not fixed:** a hidden, always-mounted `DataGlossaryTable` instance (`.measureWrap`, opacity:0/out of flow) provides real header/row/column dimensions throughout. A first effect measures how many real rows fit in `window.innerHeight - navHeight - headerHeight` and calls `setVisibleRowCount`; a second effect (keyed on that state) builds the actual GSAP timeline once React has rendered that many row cells with refs. `RUNWAY`/`PHASE5_CONTENT_LENGTH` are computed at runtime from `visibleRowCount`, not top-level constants.

**`section.prototype-validation`** (was phase 1) — no longer a custom pinned component; now a plain `<Section>` + `<LabelBlock size="display">` (label="Prototype Validation", same merged statement), full-100vh (`min-height:100vh; align-content:center`, matching `.frameworkAdaptation`'s convention), revealed via `LabelBlock`'s own built-in scroll trigger — no GSAP pin/hold/exit of its own, since it no longer hands off into a table build. Sits between the data-dictionary section and the first hotspot section.

**Next session starts here:** the pre-split table-build scene went through many rounds of user-driven visual correction already, but hasn't had a final confirmed-good pass, and neither has this session's reorder/split — check both sections render and transition cleanly in the new order. Known open items on `DataDictionaryScene`: dynamic row count hasn't been checked at multiple real viewport heights; the mask fade's exact 3-row cutoff is unconfirmed as a "feels right" amount; phase timing/durations (`PHASE2_BUILD_LENGTH=900`, `SHRINK_DURATION=450`, etc.) are first-guess values, not tuned. Touch support not addressed (matches the same open item on the `overview-prototype-1` hotspot system above).
