# Software Observability — Progress

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
5. Update this file

---

## Built sections (in page order)

Format: plain numbered list, `` `section.name` `` only — no inline structure/annotation notes. Anything worth recording about a section belongs in `## Deferred (Roadmap)` (future work) or `## Resume Context` (active mid-build state) instead — never appended to the list entry, since the actual structure is always in the code.

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
15. `section.overview-prototype-1`
16. `section.overview-prototype-2`
17. `section.gaps-identified`
18. `section.all-software-view`
19. `section.core-attribute-intent`
20. `section.all-software-prototype-1`
21. `section.software-profile`
22. `section.software-profile-quote`
23. `section.utilization-and-cost`
24. `section.profile-prototype-1`
25. `section.lifecycle-timeline`
26. `section.generating-events`
27. `section.event-iterations`
28. `section.final-lifecycle-timeline`
29. `section.unifying-systems`
30. `section.unifying-systems-prototype` (`section.final-prototype`, between this and #29 in Figma, intentionally skipped)
31. `section.testing-the-experience`
32. `section.two-track-validation`
33. `section.cross-functional-sessions`
34. `section.phase-one-clarity`
35. `section.all-software-direction-issues`
36. `section.direction-issue-annotations`
37. `section.all-software-experience-issues`
38. `section.experience-issue-annotations`
39. `section.all-software-final`
40. `section.all-software-final-design`
41. `section.table-anatomy`
42. `section.row-anatomy`
43. `section.tool-tips`
44. `section.tool-tips-final-design`
45. `section.design-system-refinements`
46. `section.refinement-annotations`
47. `section.custimizable-columns`
48. `section.custimizable-columns-final`
49. `section.Drag-and-Drop-Reordering`
50. `section.Drag-and-Drop-final`
51. `section.software-profile-issues`
52. `section.profile-issue-annotations`
53. `section.software-profile-final`
54. `section.profile-final-design`
55. `section.scope-tradeoffs`
56. `section.descoped-views`
57. `section.inactive-license-distribution`
58. `section.distribution-overview`
59. `section.inactive-by-departments`
60. `section.inactive-by-costCenter`
61. `section.overview-revisit`
62. `section.overview-final`
63. `section.completion`
64. `section.final-design`
65. `section.impact`
66. `section.goal-connections`
67. `section.reflection`
68. `section.next-steps`

---

## Deferred (Roadmap)

- **`section.insights-and-goals` scroll parallax** — insight column shifts `translateX(-8px)`, goal column shifts `translateX(+8px)`, driven by ScrollTrigger. Connector recalculates from base positions ± offset. Desktop only via `gsap.matchMedia`.
- **`Section` layout prop** — give `Section.tsx` a `layout="grid"|"flex"` prop so flex sections never receive `cs-grid` in the first place, instead of winning a specificity fight against it.

---

## Resume Context

Active mid-build or about-to-build state, keyed by keyword. Multiple sessions may run in parallel — keep one entry per active thread. Remove an entry once its section is complete and folded into `## Built sections`.

### `testing-the-experience`
Section is structurally complete in `page.tsx`/CSS (LabelBlock display + Block(lg) + full-width ImgCard). The ImgCard's "Full Prototype" caption has no image wired in yet — asset still pending. Next step: get the prototype image asset, drop it in `public/images/software-observability/`, wire it into the `ImgCard` as `src`/`alt`.
