# CLAUDE.md

## Project Overview

<!-- What is this project? Who is it for? What is the goal?        -->
<!-- 2-3 sentences max. Be specific — vague descriptions hurt you. -->

This is a portfolio website for Edgar Sanchez, a senior product designer
with 5 years of experience in B2B/Enterprise Products. It is built to attract top talent recruiters and hiring managers for senior IC and lead design roles at product-led companies. The site showcases 4 selected case studies,an about page and a resume page.

## Stack

<!-- List every major technology and what it is responsible for.   -->
<!-- Claude should never have to guess what you are using.         -->

- Next.js 14 (App Router) —Application routing and asset optimization.
- Tailwind CSS — Token-driven styling framework matching your exact spec.
- GSAP — scroll-based and entrance animations
- MDX — Writing structured case studies embedded with live components.(written in Markdown, renders as React)
- Vercel — deployment and hosting
- Fonts — Clash Display (self-hosted in /public/fonts, weights: TBD),
  Cabinet Grotesk (self-hosted in /public/fonts, weights: TBD),
  fallback: system-ui

## Project Structure

<!-- Your folder layout. Update this as you create new folders.    -->
<!-- Claude uses this to know where to put new files.              -->

portfolio/
├── app/ # Next.js App Router pages
│ ├── page.tsx # Home page
│ ├── work/ # Case study routes
│ └── layout.tsx # Root layout
├── components/ # Reusable UI components
├── content/ # MDX case study files
├── design-system/ # tokens.md and components.md live here
├── public/ # Static assets (images, fonts, icons)
├── styles/ # Global CSS and Tailwind config
└── CLAUDE.md # This file

## Pages

<!-- Every page in the site, its route, and its sections in order. -->
<!-- Update this as new pages are added.                           -->

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

<!-- Tell Claude where your design documentation lives             -->
<!-- and what is in each file so it knows where to look.          -->

- design-system/tokens.md — all design tokens: color, typography, spacing,
  border, radius, shadow, and iconography
- design-system/components.md — component inventory, variants, usage rules,
  and token mappings

## Conventions

<!-- How you name things. Consistency here prevents Claude from    -->
<!-- inventing its own naming patterns that clash with yours.      -->

- Components: PascalCase → HeroSection.tsx, CaseStudyCard.tsx
- Files and folders: kebab-case → project-card.tsx, hero-section.tsx
- CSS / Tailwind classes: kebab-case → text-heading-lg, bg-surface-primary
- Token naming:
  - Colors/surfaces: category-variant-state → --surface-card, --text-primary
  - Typography: role-size → display-2xl, body-lg, label-md
  - Spacing: category-size → spacing-xl
  - Radius: category-size → radius-lg
  - Border: category-size → border-sm

## What's Done

- [x] CLAUDE.md written
- [x] tokens.md written (color, typography, spacing, radius,
      border, z-index, breakpoints)
- [x] Landing page designed in Figma (nav, hero, work section)
- [x] CaseStudyCard designed in Figma

## What's Next

- [ ] Add spacing, z-index, breakpoint tokens to tokens.json
- [ ] Convert tokens.md to tokens.json for GitFig sync
- [ ] Push tokens to Figma as variables via GitFig
- [ ] Apply Figma variables to all components
- [ ] Name all Figma layers using conventions in this file
- [ ] Convert nav and CaseStudyCard to proper Figma components with variants
- [ ] Initialize Next.js 14 with App Router in Claude Code
- [ ] Configure Tailwind with tokens as CSS variables
- [ ] Write component generation skill
- [ ] Write components.md for Navigation
- [ ] Build Navigation component
- [ ] View in browser at localhost:3000

## What's Deferred (Post-Launch)

- [ ] Add mobile values to tokens.md
- [ ] Add motion tokens (duration, easing)
- [ ] Add opacity tokens
- [ ] Storybook setup
