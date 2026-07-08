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

## Component System — Standardized Primitives (completed this session)

`TextBlock` and `DetailBlock` were deleted and replaced with a unified token-driven primitive system. No hardcoding anywhere.

| Component | What it is |
|---|---|
| `Label` | Clash Display, semibold, uppercase. Sizes: xs\|sm\|md\|lg\|xl |
| `Title` | Cabinet Grotesk bold. Sizes: xs\|sm\|md\|lg |
| `Block` | Cabinet Grotesk regular. Sizes: xs\|sm\|md\|lg. Color: primary\|secondary(default)\|tertiary |
| `LabelBlock` | Label + optional Block(tertiary). Sizes: xs–lg. At `display`: Label(xl) + bold statement + bold support (separate color tokens) |
| `TitleBlock` | Title + optional Block(tertiary). Sizes: xs\|sm\|md\|lg |
| `Card` | variant: filled\|outline\|ghost. Optional label+labelSize, title+titleSize in header. Optional separator (border-bottom). gap prop (default md). Exposes `data-tb-heading` on header for SVG connector targeting |

**Gap rules:**
- Within a block (label/title → body): `--spacing-sm` (8px)
- Between Card header and content: `--spacing-sm` via `margin-top`
- Between Card children: one step up from child size (sm children → md gap)

`AnnotationCard` — rebuilt as thin wrapper: Card(filled, label-sm) + TitleBlock(sm) children. No own CSS.

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

## Next

- Share a Figma node to continue building sections
