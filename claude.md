# CLAUDE.md

## Project Overview

This is a portfolio website for Edgar Sanchez, a senior product designer
with 5 years of experience in B2B/Enterprise Products. It is built to attract top talent recruiters and hiring managers for senior IC and lead design roles at product-led companies. The site showcases 4 selected case studies, an about page and a resume page.

## Stack

- Next.js 14 (App Router) — Application routing and asset optimization.
- Tailwind CSS — Token-driven styling framework matching your exact spec.
- GSAP — scroll-based and entrance animations
- MDX — Writing structured case studies embedded with live components (written in Markdown, renders as React)
- Vercel — deployment and hosting
- Fonts — Clash Display (self-hosted in /public/fonts/clash-display, weights: Regular 400, Semibold 600, Bold 700),
  Cabinet Grotesk (self-hosted in /public/fonts/cabinet-grotesk, weights: Regular 400, Medium→Semibold 600, Bold 700),
  fallback: system-ui

## Project Structure

portfolio/
├── .claude/
│ └── skills/
│ └── component-builder/
│ └── SKILL.md
├── app/ # Next.js App Router pages
│ ├── page.tsx # Home page
│ ├── work/ # Case study routes
│ └── layout.tsx # Root layout
├── components/ # Reusable UI components
│ └── components.md # Component inventory, variants, token mappings
├── content/ # MDX case study files
├── design-system/
│ ├── tokens.json # Source of truth for all design tokens
│ └── tokens.md # Human-readable token documentation
├── public/ # Static assets (images, fonts, icons)
├── styles/ # Global CSS and Tailwind config
└── CLAUDE.md # This file

## Pages

### Home (/)

1. Navigation — desktop and mobile
2. Hero — desktop and mobile
   - Hero Message 1 (primary headline)
   - Contact Button
   - View Work Button
   - Hero Message 2 (supporting text)
3. Work Section — desktop and mobile
   - 4 Case Study Cards

### About (/about)

- To be designed

### Resume (/resume)

- To be designed

## Design System

- design-system/tokens.json — source of truth for all design tokens (color, typography, spacing, border, radius, z-index, breakpoints). Used by Token Studio and Claude Code.
- design-system/tokens.md — human-readable token documentation
- components/components.md — component inventory, variants, layer structure, behavior, and token mappings

## Skills

- .claude/skills/component-builder/SKILL.md — instructs Claude Code to build components using Figma layer names as DOM structure and tokens.json as the single source of truth. Triggers when building any component.

## Conventions

- Components: PascalCase → HeroSection.tsx, CaseStudyCard.tsx
- Files and folders: kebab-case → project-card.tsx, hero-section.tsx
- CSS / Tailwind classes: kebab-case → text-heading-lg, bg-surface-primary
- Figma layer names: DOM-semantic → nav, a.[name], button.[name], div.[name], label, icon, p
- Token naming:
  - Colors/surfaces: category-variant-state → --surface-card, --text-primary
  - Typography: role-size → display-2xl, body-lg, label-md
  - Spacing: category-size → spacing-xl
  - Radius: category-size → radius-lg
  - Border: category-size → border-sm

## What's Done

- [x] CLAUDE.md written
- [x] tokens.md written (color, typography, spacing, radius, border, z-index, breakpoints)
- [x] tokens.json created with Primitives, Semantic, Responsive/Desktop, Responsive/Mobile token sets
- [x] Tokens pushed to Figma as variables via Token Studio
- [x] Landing page designed in Figma (nav, hero, work section)
- [x] CaseStudyCard designed in Figma
- [x] Figma variables applied to nav menu-item component
- [x] Figma layers named using DOM-semantic conventions
- [x] menu-item component built in Figma with Default and Hover variants
- [x] component-builder skill written (SKILL.md)
- [x] components.md started with menu-item entry
- [x] Next.js 14.2.35 scaffolded with App Router, TypeScript, Tailwind, ESLint (no src/ dir)
- [x] styles/globals.css — all tokens.json values declared as CSS custom properties (primitives + semantic); mobile typography overrides at @media (max-width: 393px)
- [x] tailwind.config.ts — full token-driven config; colors replace default Tailwind palette; typography scale (text-display-2xl → text-label-sm) wired to CSS vars; font-display / font-body; spacing, radius, borderWidth, zIndex, icon sizes, screens (mobile: 393px, desktop: 1440px)
- [x] app/layout.tsx — clean root layout importing styles/globals.css; Geist fonts removed; body uses font-body bg-surface-base text-primary
- [x] app/page.tsx — minimal placeholder (no components yet)
- [x] Clash Display + Cabinet Grotesk self-hosted in /public/fonts (woff2; Regular, Semibold/Medium, Bold)
- [x] @font-face declarations added to styles/globals.css (font-display: swap)
- [x] Figma MCP authenticated and connected (OAuth)
- [x] MenuItem component built from Figma node 218:247 — components/MenuItem.tsx + MenuItem.module.css
  - label-2xl typography (40px desktop / 24px mobile), spacing-3xl padding, radius-default border-radius
  - div.fill slide-up hover animation, goArrow opacity transition, border-color transition
  - goArrow SVG inlined as currentColor (source: Figma MCP asset)
- [x] goArrow SVG asset saved to public/icons/go-arrow.svg
- [x] MenuItem verified in browser at localhost:3001

## What's Next

- [ ] Build Navigation component (provide Figma link)
- [ ] Build Hero section (provide Figma link)
- [ ] Build CaseStudyCard component (provide Figma link)
- [ ] Wire up app/page.tsx with real Navigation + Hero + Work section

## What's Deferred (Post-Launch)

- [ ] Add motion tokens (duration, easing)
- [ ] Add opacity tokens
- [ ] Apply Figma variables to remaining components (CaseStudyCard, Hero)
- [ ] Name Figma layers for CaseStudyCard and Hero using DOM-semantic conventions
- [ ] Write components.md entries for remaining components
- [ ] Storybook setup
