# CLAUDE.md

## Agent Behaviour

- **Do not auto-invoke skills** unless the user explicitly asks for one by name (e.g. `/run`, `/component-builder`). Execute tasks directly with available tools.
- **Never build or make code changes until explicitly asked to.** Always ask clarifying questions first to verify alignment on intent and expected outcome before writing any code.
- **Every concrete token value requires explicit confirmation before being written — not just new token categories.** Proposing *that* a dimension needs a token (e.g. a new spacing step, a state-color layer) is a structural conversation. Choosing *which* value fills it (a specific ramp step, a px number, an opacity, a duration) is an equally real decision and must be proposed with brief reasoning and confirmed before it's written — never assumed as an "obvious default," even something as small as "one step darker on the ramp" or a raw number copied straight from a Figma layer. This applies in any design-system project (portfolio's own, XOPS, or future ones).

## Project Overview

Portfolio website for Edgar Sanchez — senior product designer, 5 years B2B/Enterprise. Built to attract recruiters and hiring managers for senior IC and lead roles at product-led companies. 4 selected case studies, an about page, and a resume page.

## Stack

- Next.js 14 (App Router) — TypeScript, no src/ dir
- Tailwind CSS — token-driven, all values from CSS custom properties
- GSAP — entrance and scroll animations
- MDX — structured case studies with live components
- Vercel — deployment
- Fonts — Clash Display (display/labels, self-hosted `/public/fonts/clash-display`), Cabinet Grotesk (body/headings, self-hosted `/public/fonts/cabinet-grotesk`), weights: 400/600/700
- Storybook 8 (`@storybook/react-vite`) — `npm run storybook` → `localhost:6006`
- Chromatic — visual regression (`npx chromatic --project-token=chpt_cc21e0fc930e5d6`)

## Project Structure

```
portfolio/
├── .claude/
│   ├── projects/              # Doc sets — one unified set for the whole portfolio, one per non-portfolio project
│   │   ├── portfolio/         # ALL portfolio-page work (case studies + Home/Nav/Footer/About) — PLAN.md, progress.md, DECISIONS.md
│   │   └── <name>/             # non-portfolio project, e.g. xops/ — same 3-file doc-set shape
│   └── skills/                 # Skill definitions (component-builder, section-builder,
│                                #   new-portfolio-page, new-nonportfolio)
├── app/
│   ├── page.tsx              # Home page
│   ├── layout.tsx            # Root layout
│   └── work/                 # Case study routes
├── components/
│   ├── built-components.md   # Registry — check before building anything new
│   └── components.md         # Layer structure + token mappings per component
├── design-system/
│   └── tokens.json           # Source of truth — all design tokens (shared by all portfolio pages)
├── design-systems/
│   └── <name>/                # Code + tokens only for a non-portfolio effort (e.g. xops/) —
│                               #   tokens.json, tokens.css, components/ — its doc set lives in .claude/projects/<name>/ instead
├── public/
│   ├── fonts/                # Self-hosted woff2 files
│   ├── icons/                # SVG icons
│   └── SVG/                  # Illustration assets
└── styles/globals.css        # All CSS custom properties (primitives + semantic + typography)
```

## Project Doc Sets

The whole portfolio site (every case study, plus Home/Nav/Footer/About) shares **one** doc set: `.claude/projects/portfolio/{PLAN.md, progress.md, DECISIONS.md}`. It was formerly split per-page (a standalone `software-observability/` doc set, a separate `portfolio-shell/` for Home/Nav/Footer/About) — collapsed into one, since it's one site being built by one person, not several independent efforts. Case-study content and shell content live as clearly-labeled top-level sections within the same files rather than duplicating the 3-file structure per page; add new space (a new page's section) as it's actually built, not pre-emptively.

A separate non-portfolio design-system effort (e.g. `xops`) gets its own distinct 3-file doc set: **PLAN.md** (roadmap/rationale), **progress.md** (build state), **DECISIONS.md** (the user's decisions and direction — never agent execution process), at `.claude/projects/<name>/`. Scaffold a new one with `/new-nonportfolio` rather than creating by hand. (`/new-portfolio-page` scaffolds a new page's *section* within the shared `portfolio` doc set instead of a new project directory.)

**Shared across all portfolio-page work** (case studies, About, Resume, Home): `design-system/tokens.json`, `styles/globals.css`, `components/built-components.md`, `components/components.md`, the `component-builder` skill, and — for narrative case studies specifically — the `section-builder` skill. These are global; a component built for one page is registered once and reused by every other page. Cross-cutting TODOs on a shared component/token (not specific to one page) belong in `built-components.md` itself, not in `portfolio`'s progress.md.

**Non-portfolio projects** (e.g. `design-systems/xops/`) share nothing with the above — their own tokens, components, and (once needed) a forked `<name>-component-builder` skill live under `design-systems/<name>/`, isolated deliberately so the two systems never resolve against each other. Only the doc set moved to `.claude/projects/<name>/`; the code stays fully separate.

## Pages

- `/` — Home: Nav, HeroSection, Work section with CaseStudyCards
- `/work/[case-study]` — Case study pages
- `/about` — Not yet designed
- `/resume` — Not yet designed

## Design System

- `design-system/tokens.json` — token source of truth (Primitives → Semantic → Responsive/Desktop → Responsive/Mobile)
- `styles/globals.css` — every token as a CSS custom property; resolve here before using in components
- `components/built-components.md` — registry of built components; always check before building
- `components/components.md` — full spec per component

## Skills

- `component-builder` — builds a component from a Figma node link; always requires a link before starting
- `section-builder` — adds a section to a case study page using the grid system and existing components
- `new-portfolio-page` — scaffolds a doc set for a new page in the main portfolio site (case study, About, Resume, Home addition); shares the existing design system
- `new-nonportfolio` — scaffolds a doc set (+ forked component-builder) for a project needing its own separate design system, isolated from the portfolio's
- `design-system-analysis` — studies an external design system (docs site or source repo) to find structural gaps and organizational patterns for a target project's own design system, via a live in-conversation dialogue; never copies naming/values, doesn't persist findings to a log. Agnostic across projects.

## Conventions

- Components: PascalCase → `HeroSection.tsx`, `CaseStudyCard.tsx`
- Files/folders: kebab-case
- All visual values via CSS custom properties — never hardcode color, spacing, radius, or typography
- Tailwind for layout only (`flex`, `grid`, `relative`, `overflow`, `z-index`)
- Figma layer names are DOM-semantic: `div.foo` → `<div>`, `a.foo` → `<a>`, `button.foo` → `<button>`, `p` → `<p>`, `label` → `<span>`, `icon` → `<span aria-hidden>`
