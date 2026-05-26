# CLAUDE.md

## Agent Behaviour

- **Do not auto-invoke skills** unless the user explicitly asks for one by name (e.g. `/run`, `/component-builder`). Execute tasks directly with available tools.

## Project Overview

Portfolio website for Edgar Sanchez — senior product designer, 5 years B2B/Enterprise. Built to attract recruiters and hiring managers for senior IC and lead roles at product-led companies. 4 selected case studies, an about page, and a resume page.

## Stack

- Next.js 14 (App Router) — TypeScript, no src/ dir
- Tailwind CSS — token-driven, all values from CSS custom properties
- GSAP — entrance and scroll animations
- MDX — structured case studies with live components
- Vercel — deployment
- Fonts — Clash Display (display/labels, self-hosted `/public/fonts/clash-display`), Cabinet Grotesk (body/headings, self-hosted `/public/fonts/cabinet-grotesk`), weights: 400/600/700

## Project Structure

```
portfolio/
├── .claude/skills/component-builder/SKILL.md
├── app/
│   ├── page.tsx          # Home — Nav + HeroSection wired; Work section TODO
│   ├── layout.tsx        # Root layout
│   └── work/             # Case study routes (empty)
├── components/
│   ├── components.md     # Component inventory, layer structure, token mappings
│   └── built-components.md  # Registry — check before building anything new
├── content/              # MDX case study files (empty)
├── design-system/
│   ├── tokens.json       # Source of truth — all design tokens
│   └── tokens.md         # Human-readable token docs
├── public/
│   ├── fonts/            # Self-hosted woff2 files
│   ├── icons/            # icon.svg (logo mark), go-arrow.svg
│   └── SVG/happyAgents.svg
├── styles/globals.css    # All CSS custom properties (primitives + semantic + typography)
└── tailwind.config.ts    # Token-driven config
```

## Pages

### Home (/)
1. Nav — sticky overlay, built ✓
2. HeroSection — desktop + tablet (768px) + mobile (393px), built ✓
3. Work Section — 4 CaseStudyCards, **TODO**

### About (/about) — not yet designed
### Resume (/resume) — not yet designed

## Design System

- `design-system/tokens.json` — source of truth (Primitives, Semantic, Responsive/Desktop, Responsive/Mobile)
- `styles/globals.css` — every token declared as a CSS custom property; mobile typography overrides at `@media (max-width: 393px)`
- `components/components.md` — full spec for every built component
- `components/built-components.md` — registry; always check before building

## Skills

- `.claude/skills/component-builder/SKILL.md` — builds components from a Figma node link. Always requires a Figma link. Reads layer hierarchy + bound variables → resolves to CSS custom properties → writes TSX + CSS Module.

## Conventions

- Components: PascalCase → `HeroSection.tsx`, `CaseStudyCard.tsx`
- Files/folders: kebab-case
- All visual values via CSS custom properties — never hardcode color, spacing, radius, or typography
- Tailwind for layout only (`flex`, `grid`, `relative`, `overflow`, `z-index`)
- Figma layer names are DOM-semantic: `div.foo`, `a.foo`, `button.foo`, `p`, `label`, `icon`

## Built Components

| Component | File | Notes |
| --- | --- | --- |
| MenuItem | `components/MenuItem.tsx` | Nav overlay link, label-2xl, GSAP hover fill |
| Button | `components/Button.tsx` | 4 variants × 2 sizes |
| Nav | `components/Nav.tsx` | GSAP open/close, imports Button + MenuItem |
| HeroSection | `components/HeroSection.tsx` | GSAP entrance animation, imports Button + BounceCanvas |
| BounceCanvas | `components/BounceCanvas.tsx` | GSAP Draggable, bouncing SVG toy |
| CaseStudyCard | `components/CaseStudyCard.tsx` | Full-card `<a>`, desktop + mobile layout |

### Button — critical notes
- **4 variants:** `primary`, `secondary`, `outline`, `ghost`
- **2 sizes:** `lg` (default — 16px/32px padding) · `md` (8px/24px padding)
  - `lg` padding lives in `.btn` base class — always applied unless `.md` overrides it
  - `.md` class adds the override; only applied when `size="md"` is passed
- **Nav** uses `size="md"` on both MENU (outline) and CLOSE (ghost) buttons
- **HeroSection** buttons use default `lg` — no `size` prop needed

### CaseStudyCard — critical notes
- Root is `<a href>` — entire card is the link
- Desktop (>768px): two-column — title/overview left, impactList + imgContainer right
- Stacked (≤768px): single column — imgContainer moves to top via `order: -1`
- Typography token decisions: `--text-primary` for impact headings, `--text-secondary` for all muted text
- Ready to wire into the Work section — see props in `components/components.md`

## What's Next

- [ ] Build Work section in `app/page.tsx` with 4 `CaseStudyCard` instances
- [ ] Wire up case study routes in `app/work/`
- [ ] Design About and Resume pages

## Deferred (Post-Launch)

- [ ] Push action.outline/ghost tokens + updated radius scale to Figma via Token Studio
- [ ] Apply Figma variables to CaseStudyCard and HeroSection
- [ ] Write components.md entries for HeroSection and BounceCanvas
- [ ] MDX case study content
- [ ] Add opacity tokens
- [ ] Storybook
