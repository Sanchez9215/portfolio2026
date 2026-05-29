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

### BounceCanvas — graph system (PIVOTING TO d3-force)

**Decision made:** The current rules-based placement system in `BounceCanvas.tsx` cannot reliably prevent crossing lines, overlapping shapes, or lines passing through the SVG body. These are layout problems — best solved by a force-directed simulation, not placement rules. **Next session starts the d3-force rewrite on branch `feature/d3-force-graph`.**

---

**Current state of `master` (rules-based approach — preserved as fallback)**

All tuning constants live in the `CONNECTOR` block at the top of `BounceCanvas.tsx`. The system works but has unresolvable layout issues at scale.

- `AttachedShape` fields: `id`, `depth`, `lx/ly`, `rlx/rly`, `parentHeadIdx`, `parentShapeIds`
- Draw order: connector lines (Pass 1, explicit edges only) → shape images (Pass 2)
- Rules in `connectShape()`: directional gate on heads + child shapes, `HEAD_MAX_CHILDREN: 3`, `SHAPE_MAX_CHILDREN: 2`, `CHAIN_MAX: 3`, `HEAD_BIAS: 0.6`, sibling angular spread, ripple settle

---

**d3-force rewrite — what to build next session**

**Branch:** `feature/d3-force-graph` (already created, checked out from master)

**Install first:** `npm install d3-force` — only this package, not full d3

**What stays (do not rewrite):**
- GSAP bouncing SVG, Draggable, InertiaPlugin
- Pellet firing system — passive bursts, active mouse-tracking, taper mode
- Falling shape spawn logic and AABB collision detection
- Custom SVG rendering — `object.svg` and `object2.svg` (not circles)
- The topology rules: directional gate, head caps, chain max, shape children cap — these control *who connects to who*, d3-force only controls *where nodes end up*

**What gets replaced:**
- Manual snap position calculation (attachment angle + exclusion zone + elastic tween)
- `lx/ly` + `rlx/rly` position storage on `AttachedShape`
- The `ripple settle` GSAP tweens (d3-force continuous simulation replaces this)

**How the hybrid works:**
1. d3-force simulation runs in **local coordinates** (relative to SVG top-left). Nodes follow the SVG as it bounces — each draw frame, add SVG world position to all node positions when rendering.
2. **4 head nodes are fixed** — use `fx/fy` (d3 fixed position) pinned to EMITTER offsets. They never move in the simulation.
3. **Forces to configure:**
   - `forceManyBody` — charge repulsion, nodes push apart (prevents overlaps)
   - `forceLink` — edges pull connected nodes to a target distance (controls arm length)
   - `forceCollide` — hard collision radius = half the largest shape diameter (no visual overlap)
   - `forceCenter` (weak) — keeps graph from drifting; center = SVG local center (60, 60)
   - Do NOT use `forceRadial` — it creates circular layouts, we want organic
4. **On shape capture** (pellet hits falling shape): add new d3 node + link to simulation via `simulation.nodes([...])` and `forceLink.links([...])`, then call `simulation.alpha(0.3).restart()` — graph breathes open to accommodate the new node
5. **Drawing each frame:** iterate `simulation.nodes()` for positions, draw lines then shapes on canvas

**Visual requirements confirmed:**
- Custom SVG shapes (object.svg, object2.svg) — not circles
- All nodes connected to one of the 4 SVG heads — no floating disconnected groups
- Organic overall shape — NOT a perfect circle (avoid forceRadial; topology drives shape)
- No overlapping connections — forceCollide handles this
- No lines crossing through SVG body — forceLink distance + charge keeps nodes outward

**Key constraint:** The SVG bounces continuously. Fixed head nodes must update their `fx/fy` every tick to follow the SVG's current world position... actually NO — keep everything in local coords, only convert to world coords when drawing. Simulation is unaware of the SVG's world position.

## What's Next

- [ ] Build Work section in `app/page.tsx` with 4 `CaseStudyCard` instances
- [ ] Wire up case study routes in `app/work/`
- [ ] Design About and Resume pages
- [ ] **Fluid typography** — replace all static `font-size` token values in `globals.css` with `clamp()` expressions and remove the `@media (max-width: 393px)` font-size overrides

### Fluid typography — ready to implement

**Decisions already made:**
- Viewport range: `390px` (min) → `1920px` (max)
- Scope: all token groups — Display, Heading, Body, Label
- Line-height: not yet decided (fixed ratio vs. fluid)
- Approach: two anchor sizes per token → linear `clamp()` formula auto-calculated

**What's needed to start:**
- Edgar to supply expected `font-size` per token at 390px and 1920px as a table — OR confirm using existing `globals.css` values as the two anchors (current `@media (max-width: 393px)` override = min, current desktop value = max) and adjust after seeing it live
- Decide on line-height strategy before generating

**How clamp() will be applied:**
- Token names in `globals.css` stay identical — all component CSS modules require zero changes
- Formula per token: `clamp(minPx, intercept + slope*vw, maxPx)` — slope and intercept derived from the two anchor sizes
- The `@media (max-width: 393px)` font-size block gets deleted once clamp is in place

## Deferred (Post-Launch)

- [ ] Push action.outline/ghost tokens + updated radius scale to Figma via Token Studio
- [ ] Apply Figma variables to CaseStudyCard and HeroSection
- [ ] Write components.md entries for HeroSection and BounceCanvas
- [ ] MDX case study content
- [ ] Add opacity tokens
- [ ] Storybook
