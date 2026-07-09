# Software Observability — Progress

## Session Workflow

1. Read this file + `components/built-components.md` + `styles/globals.css`
2. User provides a Figma node + context — layer names follow component and DOM element naming conventions; existing tokens/components referenced where possible
3. **Before invoking any skill** — independently verify:
   - Read `components/built-components.md` — cross-reference every named component layer in the Figma against the registry
   - Read `design-system/tokens.json` and `styles/globals.css` — resolve all token bindings
4. Branch on intent:
   - **New component** → run `/component-builder` — complete pre-build checklist, wait for confirm before writing code
   - **New section** → check registry for any new components first; run `/component-builder` for each, then `/section-builder`
5. Update this file

## Mistake Patterns & Inefficiencies

| # | Pattern | Impact | Fix applied |
|---|---------|--------|-------------|
| 1 | Jumped to a downstream step without completing the prerequisite gate | Required user correction mid-session | Always complete prerequisite checks in order before advancing to the next step |
| 2 | Read a reference source but didn't apply it to validate the current task — treated it as a formality | Missed existing built components; required correction | Reading a registry or doc means actively cross-referencing it against every decision in the task, not skimming it |
| 3 | Chose an incorrect anchor point for an insertion, placing content in the wrong position | User had to correct placement | Always use the most stable, unambiguous anchor for insertions — prefer a structural boundary over a sibling element |
| 4 | Applied an abbreviated form of a name instead of following the established naming convention | User correction | Never shorten names. Use the full form as specified by the convention, derived directly from the source (e.g. Figma layer name) |
| 5 | Widened the scope of analysis beyond what the task required — audited unrelated parts of the codebase when the task was purely additive | Introduced confusion; required user redirection | If the task is additive, touch only what is needed. Do not audit unrelated internals |
| 6 | Proposed a value for a shared property that deviated from the established convention without a documented reason | User correction | Always default to the convention already in use for a shared property. Only deviate when the design explicitly documents a reason |
| 7 | Used a wrapper div + CSS class solely to apply a grid column span to a child component | Extra DOM node, unmaintainable class name | Use a parent child selector (`> *`) when all siblings share the same span; use `className` on the component only for unique per-instance overrides |
| 8 | Proposed new CSS rules for a layout already covered by existing classes — did not grep the stylesheet or cross-reference the existing section pattern before planning | User had to redirect; extra unnecessary work | Before proposing any new CSS rule, search the stylesheet for the structural pattern first. If an existing class covers the layout, reuse it. |

## Component System — Standardized Primitives (completed this session)

`TextBlock` and `DetailBlock` were deleted and replaced with a unified token-driven primitive system. No hardcoding anywhere.

| Component | What it is |
|---|---|
| `Label` | Clash Display, semibold, uppercase. Sizes: xs\|sm\|md\|lg\|xl |
| `Title` | Cabinet Grotesk bold. Sizes: xs\|sm\|md\|lg |
| `Block` | Cabinet Grotesk regular. Sizes: xs\|sm\|md\|lg. Color: primary\|secondary(default)\|tertiary |
| `LabelBlock` | Label + optional Block(tertiary). Sizes: xs–lg. At `display`: Label(xl) + bold statement + bold support (separate color tokens) |
| `TitleBlock` | Title + optional Block(tertiary). Sizes: xs\|sm\|md\|lg |
| `Card` | variant: filled\|outline\|ghost. `size` (xs\|sm\|md\|lg) sets default labelSize+titleSize for header. `labelSize`/`titleSize` as explicit overrides. `headerGap` (xs\|sm\|md\|lg\|xl, default sm) controls header→content spacing independently from `gap` (children spacing, default md). Exposes `data-tb-heading` on header. |

**Gap rules:**
- Within a block (label/title → body): `--spacing-sm` (8px)
- Between Card header and content: `headerGap` prop (default sm = 8px)
- Between Card children: `gap` prop (default md)

`AnnotationCard` — **deleted**. Was a redundant wrapper; replaced everywhere with `Card + TitleBlock` children directly.

`InsightGoalRow` — rebuilt using Card(ghost, separator). API changed from `insight`/`goal` named props to `items: [Item, Item]`. SVG connector still targets `[data-tb-heading]` on Card headers.

All usages in `page.tsx` and `SectionIntroduction.tsx` updated to new primitives.

## Built sections (in page order)

1. `SectionIntroduction`
2. `section.brief`
3. `section.the-problem`
4. `section.user-quote`
5. `section.support-metrics`
6. `section.research`
7. `section.insights-and-goals`
8. `section.framework-adaptation`
9. `section.observability-first`
10. `section.data`
11. `section.data-ops`
12. `section.modular-design-approach`
13. `section.parallel-prototyping`
14. `section.prototype-validation`
15. `section.gaps-identified`
16. `section.all-software-view`
17. `section.core-attribute-intent`
18. `section.software-profile`
19. `section.software-profile-quote`
20. `section.utilization-and-cost`
21. `section.software-profile-prototype-1`
22. `section.lifecycle-timeline`
23. `section.generating-events`
24. `section.event-iterations`
25. `section.unifying-systems` — LabelBlock(display) + Block(lg) + ImgCard(single: Claude Profile Prototype) top row; ImgCard(3-image: Employee/Financial/Devices tab prototypes) bottom row. **Note:** User specified this comes after `section.final-lifecycle-timeline`, which has not yet been built. Appended to end for now; reorder when that section is added.

## New tokens

- `display-metric` — 72px/79px/-0.02em desktop · 40px/44px mobile
- `title-xs/sm/md/lg` — Cabinet Grotesk Bold, static. 12/14/16/18px. LS: -0.01em.

## Pending — Design System token updates

Not yet applied. Require explicit go-ahead before touching any file.

| Token | Change | New value |
|---|---|---|
| `--text-primary` | update | grey-650 `#96A0B2` |
| `--text-display` | update | grey-300 `#E6EFFE` |
| `--nav-menu-item-text` | update | grey-300 `#E6EFFE` |
| `--action-secondary-text` | update | grey-300 `#E6EFFE` |

New typography tokens pending sizes from Edgar: `body-xl`, `caption-label`, `caption-body`

## Deferred

- **`section.insights-and-goals` scroll parallax** — insight column shifts `translateX(-8px)`, goal column shifts `translateX(+8px)`, driven by ScrollTrigger. Connector recalculates from base positions ± offset. Desktop only via `gsap.matchMedia`.

## Next — `section.final-lifecycle-timeline`

Slots between `section.event-iterations` (#24) and `section.unifying-systems` (#25 → becomes #26).

**Figma:** node `2-47797`, file `C3PsgZV3jZMHgm4bFZJOVP`

**Layout:** `Label(xl)` stacked above a 3-column row: left `ol.decisions` | center `ImgCard(flex-1)` | right `ol.decisions`.

**No new CSS needed for the 3-column layout** — reuse existing classes:
- `styles.prototypeValidationContainer` → outer row wrapper (`div.wrapper`)
- `styles.prototypeValidationColumn` → both `ol` columns (203px, flex-col, gap-xl, no list-style)
- `styles.prototypeValidationImgCard` → center ImgCard (flex-1)

**Open question:** Does the Section need a new class for the flex-column stack (Label above row)? `styles.prototypeValidation` would work structurally but uses `--spacing-5xl` (128px); Figma gap is 64px (`--spacing-3xl`). Confirm before writing.

**Image:** `/images/software-observability/timeline-prototype-2.jpg` — caption "Profile Prototype 02"

**Cards — both columns use `title` prop (Cabinet Grotesk Bold), not `label` (Clash Display):**

Left `ol`:
1. `Card(filled, sm)` `title="Event Search"` + `Block(sm, tertiary)` — "Enables users to instantly locate specific lifecycle events without manually scrolling through long timelines."
2. `Card(filled, sm)` `title="Event Filtering by Type"` + `Block(sm, tertiary)` — "Reduces noise by allowing teams to focus only on events relevant to their role or task."

Right `ol`:
1. `Card(filled, sm)` `title="Timeline Navigation"` + `Block(sm, tertiary)` — "Built for enterprise customers managing multi-year subscription histories, enabling effortless navigation across extensive event timelines."
2. `Card(filled, sm)` `title="Milestone Based Events"` + `Block(sm, tertiary)` — "Milestone events reduce noise and surface lifecycle moments that provide operational insights. I proposed introducing custom configuration in a future iteration so enterprises could define milestone triggers that reflect their unique workflows and performance measures."

**Import needed:** Add `Label` to page.tsx imports.

**Mistake pattern #8 to add:** Proposed new CSS rules for a layout already covered by existing classes; did not cross-reference the stylesheet before planning. Fix: grep for structural patterns before proposing any new rule.
