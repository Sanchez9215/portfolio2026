# CLAUDE.md

## Agent Behaviour

- **Do not auto-invoke skills** unless the user explicitly asks for one by name (e.g. `/run`, `/component-builder`). Execute tasks directly with available tools.
- **Never build or make code changes until explicitly asked to.** Always ask clarifying questions first to verify alignment on intent and expected outcome before writing any code.

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
│   ├── progress.md           # Current build state — read at start of each session
│   └── skills/               # Skill definitions (component-builder, section-builder)
├── app/
│   ├── page.tsx              # Home page
│   ├── layout.tsx            # Root layout
│   └── work/                 # Case study routes
├── components/
│   ├── built-components.md   # Registry — check before building anything new
│   └── components.md         # Layer structure + token mappings per component
├── design-system/
│   └── tokens.json           # Source of truth — all design tokens
├── public/
│   ├── fonts/                # Self-hosted woff2 files
│   ├── icons/                # SVG icons
│   └── SVG/                  # Illustration assets
└── styles/globals.css        # All CSS custom properties (primitives + semantic + typography)
```

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

## Conventions

- Components: PascalCase → `HeroSection.tsx`, `CaseStudyCard.tsx`
- Files/folders: kebab-case
- All visual values via CSS custom properties — never hardcode color, spacing, radius, or typography
- Tailwind for layout only (`flex`, `grid`, `relative`, `overflow`, `z-index`)
- Figma layer names are DOM-semantic: `div.foo` → `<div>`, `a.foo` → `<a>`, `button.foo` → `<button>`, `p` → `<p>`, `label` → `<span>`, `icon` → `<span aria-hidden>`
