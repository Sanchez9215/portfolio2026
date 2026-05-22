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
- Fonts — Clash Display (self-hosted in /public/fonts, weights: TBD),
  Cabinet Grotesk (self-hosted in /public/fonts, weights: TBD),
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

## What's Next

- [ ] Initialize Next.js 14 with App Router in Claude Code
- [ ] Configure Tailwind with tokens as CSS variables
- [ ] Build menu-item component
- [ ] Build Navigation component
- [ ] View in browser at localhost:3000

## What's Deferred (Post-Launch)

- [ ] Add motion tokens (duration, easing)
- [ ] Add opacity tokens
- [ ] Apply Figma variables to remaining components (CaseStudyCard, Hero)
- [ ] Name Figma layers for CaseStudyCard and Hero using DOM-semantic conventions
- [ ] Write components.md entries for remaining components
- [ ] Storybook setup
