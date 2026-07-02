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
- Storybook 8 (`@storybook/react-vite`) — design system stories; `npm run storybook` → `localhost:6006`
- Chromatic — visual regression (`npx chromatic --project-token=chpt_cc21e0fc930e5d6`); requires `npm run build-storybook` first

## Project Structure

```
portfolio/
├── .claude/skills/component-builder/SKILL.md
├── app/
│   ├── page.tsx          # Home — Nav + HeroWithCanvas + all 4 CaseStudyCards wired
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
├── tailwind.config.ts    # Token-driven config
├── .storybook/
│   ├── main.ts           # @storybook/react-vite framework; staticDirs → public/ (fonts)
│   └── preview.ts        # imports globals.css; dark background default
└── stories/
    └── Typography.stories.tsx  # Two stories: Specimen (full type scale) + Proposed Changes (Step 1 colors before/after, Step 2 new tokens)
```

## Pages

### Home (/)
1. Nav — sticky overlay, built ✓
2. HeroSection — desktop + tablet (768px) + mobile (393px), built ✓
3. Work Section — all 4 CaseStudyCards wired ✓

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
| HeroSection | `components/HeroSection.tsx` | GSAP entrance + expand animations, zone refs as props |
| HeroWithCanvas | `components/HeroWithCanvas.tsx` | Client boundary — owns all zone refs, renders BounceCanvas + HeroSection |
| BounceCanvas | `components/BounceCanvas.tsx` | Two-canvas layer; robot roams full viewport freely; passive firing only; falling shapes on background canvas; d3-force graph; villain + AutonomousCluster + FreeNode systems |
| BulletBaby | `components/BulletBaby.tsx` | Inline SVG villain renderer; GSAP hit animation (squish + shake + pink flash); exposes `VillainHandle` via `forwardRef` |
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

### BulletBaby — villain hit animation component

- **File:** `components/BulletBaby.tsx`
- Inline SVG component — both normal and hit state elements live in the DOM simultaneously
- Exposes `VillainHandle` via `forwardRef`: `{ triggerHit: () => void; reset: () => void }`
- Used exclusively by BounceCanvas villain overlay system — not a standalone UI component

**State model:**
- `isHit: boolean` (React state) — controls permanent visual switch: body color, wing, eye, brackets
- `isFiringRef` (ref) — debounce guard, prevents re-triggering mid-animation
- Hit state is **temporary** — `recover()` fires after 0.5s hold, restoring all elements to normal

**Animation sequence on `triggerHit()`:**
1. t=0: Shake SVG (±4px, 5 cycles, 0.2s total)
2. t=0: Eye rect squishes (`scaleY → 0`, `opacity → 0`, 0.08s) + wing fades out
3. t=0.08: `setIsHit(true)` → body turns `#FF7878`, brackets appear, eye removed from DOM
4. t=0.08: Impact lines flash in → fade out over 0.18s
5. t=0.08+0.5s: `recover()` → body back to `#0B0B0D`, eye re-opens, wing returns, brackets hide

**SVG assets:**
- Normal state: `public/SVG/bullet-baby.svg` (dark body, light blue accents, wing highlight, dark eye rect at 80,41)
- Hit state elements baked into component: `#FF7878` body, bracket squint paths at (53–67, 25–38)
- `bullet-baby-hit.svg` in `public/SVG/` — reference design only, not loaded at runtime

**`VillainHandle` API:**
- `triggerHit()` — starts animation; no-op if already firing or in hit state
- `reset()` — kills timeline, sets `isHit → false`, clears GSAP transforms; called by BounceCanvas when villain dies off-screen

### BounceCanvas — hero-confined animation layer ✅

**Packages installed:** `d3-force` + `@types/d3-force` (both in package.json).

**Architecture — two-canvas system:**
- **`bgCanvas`** (`styles.bgCanvas`) — `position: fixed; inset: 0; z-index: 0` — draws falling shapes only. Sits behind all page content.
- **`.container`** — `position: fixed; inset: 0; z-index: 2` — holds the main canvas (robot, pellets, d3 network, clusters, free nodes) + robot `<img>`.
- `pointer-events: none` on both canvases and container; `pointer-events: auto` on robot `<img>` only.
- All mouse events at `window` level — canvas coords = viewport coords, no offset needed.

**Page stacking context (critical — do not change without understanding this):**
- `html` — `background: var(--surface-base)` — root layer
- `BounceCanvas bgCanvas` — `z-index: 0` — falling shapes, behind all page content
- `.heroBottomWrapper` — `z-index: 1` — subline + buttons paint above bgCanvas (heroBottomContent background is currently `transparent` — no blue card)
- Work `<section>` — `position: relative; z-index: 1` — paints above bgCanvas, case study cards never obscured by falling shapes
- `BounceCanvas .container` — `z-index: 2` — robot + pellets + d3 network above hero content
- `.heroTopContent` — `z-index: 3` — headline/role text above everything
- `.hero` — **no** `isolation: isolate`, **no** explicit `z-index` — children compete in root context
- Nav — `z-index: ~100` — always on top

**Robot — unconfined (as of this session):**
- Robot bounces freely within the full viewport using only the hard viewport walls (top, bottom, left, right)
- No `activeZoneRef` wired — `getEffectiveBounds` falls back to `minY=0, maxY=H-SVG_H`
- No `textZones` or `gapZones` wired — robot ignores all UI elements
- Boundary design is intentionally deferred; zone infrastructure in BounceCanvas is intact and ready to re-wire

**Exclusion zone system (infrastructure exists, nothing currently wired):**
- `textZones` — robot overlaps `overlapPx` (default 16px) into the zone edge (behind text)
- `gapZones` — robot stays `gapPx` (default 16px) clear of zone edge
- `activeZoneRef` — defines hero Y bounds for robot confinement; not currently wired
- `spawnZoneRef` — falling shapes spawn from this element's top edge within its X bounds; still wired to `heroZoneRef`
- Bounds computed each frame via `getBoundingClientRect()` — fully responsive

**Current wiring (`HeroWithCanvas.tsx`):**
```
textZones   → (none)
gapZones    → (none)
activeZone  → (none) — robot uses full viewport height
spawnZone   → heroZoneRef (full hero section) — shapes spawn from hero top edge, fall full page
```

**Firing status:**
- `MOUSE_FIRING_ENABLED = false` (const at top of file) — mouse/active/taper firing paused
- Passive firing active: `PASSIVE.rapidInterval: 300ms`, `rapidCount: 2`, `longCooldown: 2800ms`
- To re-enable mouse firing: set `MOUSE_FIRING_ENABLED = true`

**`getEffectiveBounds(sx, sy, svy)` — zone bounds helper:**
- When `activeZoneRef` is wired: `minY = max(0, heroEl.top)`, `maxY = min(H - SVG_H, heroEl.bottom - SVG_H)`
- When not wired (current state): falls back to full viewport `minY=0, maxY=H-SVG_H`
- Y lookahead: passes current `vy` as `svy` so X zone constraints pre-activate 60px before zone entry
- X violations resolve via lerp (`x += (target - x) * 0.18`) rather than hard-snap

**d3-force simulation constants (`SIM` block at top of BounceCanvas.tsx):**
- `linkDistance: 120` — spread out for full-viewport canvas
- `chargeStrength: -120` — strong repulsion keeps graph from clustering
- `collideRadius: 30` — wide personal space between nodes
- `alphaDecay: 0.02`, `alphaIdleTarget: 0.05` — keeps graph gently ticking

**Falling shapes — manual pool, 10 entries:**
- Add to `FALLING_SHAPES` array at top of file with `{ src, w, h }` — no code changes needed elsewhere
- Spawn from hero section top edge, X constrained to `spawnZoneRef` bounds
- Rendered on `bgCanvas` (z-index: 0) — behind all page content including case study cards
- Falls to viewport bottom then dies; connects to robot network on contact (transitions to main canvas)
- `SPAWN.maxActive: 4`, speed: 1.5 px/frame
- Current pool (8→56px range):
  ```
  object.svg (40×40), object2.svg (20×20),
  bullet-baby.svg (8×8), baby-star.svg (16×16), baby-diamond.svg (20×20),
  baby-clover.svg (24×24), baby-pieChart.svg (28×28), baby-pieChart-1.svg (32×32),
  double-diamond.svg (44×44), beach-ball.svg (56×56)
  ```

**Villain system (`VILLAIN` + `CLUSTER` config blocks):**

*Villain rendering — DOM overlay (not canvas):*
- Villains are rendered as `BulletBaby` React components in fixed-position `<div>` overlays
- BounceCanvas renders `VILLAIN.maxCount` (2) overlay slots in its JSX, each initially `display: none`
- Each frame, the animation loop updates `el.style.transform` and `el.style.display` directly (no React re-render)
- Villains are assigned a `slotIdx` (0 or 1) on spawn; slots are freed when villain dies off-screen

*Villain movement:*
- Size: 120×120px; `maxCount: 0` (disabled — set to enable)
- Enters from a random screen edge, travels straight across on one axis, dies when fully off-screen
- Rotation by entry edge: left/right → 0°, top → +90° (CW), bottom → −90° (CCW)

*Robot contact → AutonomousCluster:*
- Villain overlaps robot → `spawnCluster(hitX, hitY)` called
- Picks the d3 node closest to the impact point as center, plus up to `CLUSTER.branchCount: 5` nearest neighbours
- Cluster gets random initial direction at `CLUSTER.speed`, bounces off all 4 viewport edges
- Internal layout: spring-force (`springK: 0.04`, `damping: 0.88`)

*Villain contact with cluster → scatter → FreeNodes:*
- Each free node gets burst velocity outward from cluster center (`burstSpeed: 3` px/frame)
- Free nodes drift with friction, bounce off viewport edges, drawn at 65% opacity

**Key config blocks (all at top of BounceCanvas.tsx):**
- `PELLET` — pellet size, speed, color
- `PASSIVE` — passive firing cadence timings
- `MOUSE_FIRING_ENABLED` — set to `true` to re-enable mouse/active/taper firing
- `CONNECTOR` — line style + topology rules
- `SIM` — force simulation constants
- `SHAPE_OUTLINE` — attached shape border color + width
- `SPAWN` — shape spawn timing + cap
- `VILLAIN` — villain size, speed, entry, flash/cooldown durations, burst speed (`maxCount: 0` = disabled)
- `CLUSTER` — autonomous cluster speed, branch count, spring stiffness, damping

### HeroSection — expand / collapse animation ✅ COMPLETE

**Char wrapping (runs before entrance animation on mount):**
- `headlineCharsByLineRef` — `HTMLSpanElement[][]`, index 0/1/2 = line 1/2/3
- Each `headlineLine` split into per-char `span.headlineChar` (`display: inline-block; white-space: pre`)
- Line 2 (`in Data-rich`): plain text chars + `headlineAccent` wrapper preserved with its chars split inside
- Char wrapping `useEffect` declared before entrance animation effect → fires first

**Expand animation (button in imgContainer bottom-right):**
All three run in one GSAP timeline from `t=0`:
1. Role row — `opacity → 0`, `y → -16px`, `duration: 0.4s`, `ease: power2.in`
2. heroBottomWrapper — height snapshotted via `getBoundingClientRect()` into `bottomHeightRef`, locked with `gsap.set`, tweened to `0`, `duration: 0.55s`
3. Headline chars — CCW wheel-roll off left edge, line by line with `EXPAND_ANIM.lineDelay` stagger
   - Per-char: `x = -(rect.left + rect.width + 20)`, `rotation = -(exitDist / (height/2)) × (180/π)`
   - `charDuration: 0.6s`, `charStagger: 0.04s`, `ease: power2.in`

**Collapse (reverse):**
1. heroBottomWrapper rises — `height: 0 → bottomHeightRef.current`, `clearProps:"height"` on complete
2. Chars roll CW back in — `x → 0`, `rotation → 0`, stagger `from: "start"` (left-to-right cascade)
3. Role row fades back in at `t=0.3` — `opacity → 1`, `y → 0`

**`expandedRef`** — `useRef<boolean>` guards against double-clicks mid-animation. State `expanded` only flips in `onComplete`.

## What's Next

- [ ] **Robot boundary design** — decide what areas (if any) to confine the robot to and how; zone infrastructure in BounceCanvas is ready. Key open questions: wire `activeZoneRef` to confine to hero? Add `textZones` back for headline only? Decide before adding more canvas interactions.
- [ ] **heroBottomContent visual** — currently `background-color: transparent`; subline text uses `--text-display` (#D6E5FE) so it's readable on the dark surface. Decide if transparent stays or a new treatment is designed.
- [ ] Wire up case study routes in `app/work/`
- [ ] Design About and Resume pages
- [ ] **Fluid typography** — replace all static `font-size` token values in `globals.css` with `clamp()` expressions and remove the `@media (max-width: 393px)` font-size overrides
- [ ] Re-evaluate BounceCanvas mouse interactions (re-enable `MOUSE_FIRING_ENABLED`, mouse tracking) once scroll behaviour is validated

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

## Design System Update — In Progress

All decisions confirmed. Do not re-litigate. Execute in this exact order.

**Status:**
- [ ] Step 1 — Token changes — **not yet applied. Requires explicit go-ahead before touching any code file.**
- [ ] Step 2 — New typography tokens — **not yet applied. Requires explicit go-ahead. Blocked on `caption-label`/`caption-body` sizes from Edgar.**
- [x] Step 3 — Figma layer renames — **DONE** (39 sections + 9 layer-level fixes applied to original `4:3936`)
- [x] Step 4 — `case-study.v2` duplicate — **DONE** (node `17:518`, positioned x=1540 y=0, 1440×50955px, 43 sections verified)

---

### Step 1 — Token changes (tokens.json + globals.css)

**New primitive — add to `Primitives.color.grey` in tokens.json:**
```json
"650": { "value": "#96A0B2", "type": "color" }
```

**Semantic text token changes:**

| Token | Change | New value |
|---|---|---|
| `--text-primary` | update | grey-650 `#96A0B2` — body copy default, global `html` color |
| `--text-display` | update value | grey-300 `#E6EFFE` — headings, titles, display text |
| `--text-secondary` | no change | grey-600 |
| `--text-body-highlight` | **new** | grey-500 `#D6E5FE` |
| `--text-editorial-primary` | **new** | grey-500 `#D6E5FE` |
| `--text-editorial-detail` | **new** | grey-700 `#808998` |
| `--nav-menu-item-text` | update | grey-300 `#E6EFFE` (was grey-50) |
| `--action-secondary-text` | update | grey-300 `#E6EFFE` (was grey-50) |
| `--action-primary-text` | no change | grey-1100 — dark on yellow |
| `--action-outline-text` | no change | yellow-500 |
| `--action-ghost-text` | no change | grey-600 |

Also update `--color-grey-650: #96A0B2` in the primitives block of globals.css.

---

### Step 2 — New typography tokens

**`body-xl`** — Cabinet Grotesk, regular (400), static
- Desktop + Mobile: 18px / lh 27px / ls 0
- Add to `Responsive/Desktop` and `Responsive/Mobile` in tokens.json
- Add to globals.css: `--text-body-xl-size: 18px`, `--text-body-xl-lh: 27px`, `--text-body-xl-ls: 0`

**`editorial-lg`** — new category, Cabinet Grotesk, bold (700)
- Desktop: 52px / lh 57px / ls -0.02em
- Mobile: 26px / lh 29px
- Fluid clamp: `clamp(26px, 19.37px + 1.70vw, 52px)` / lh `clamp(29px, 21.86px + 1.83vw, 57px)`
- Add to tokens.json as its own category (alongside Display, Heading, Body, Label)
- CSS vars: `--text-editorial-lg-size`, `--text-editorial-lg-lh`, `--text-editorial-lg-ls`
- Color tokens already covered by `--text-editorial-primary` and `--text-editorial-detail` above

**`caption-label` / `caption-body`** — new small text concept for project metadata (role, timeline, team)
- Sizes not yet confirmed — **ask Edgar before implementing**

---

### Step 3 — Figma layer renames ✅ DONE

**File:** `https://www.figma.com/design/FinQu7hxM5evUqMKBxLqGD/Software-Observability`
**Root node:** `4:3936` — `case-study`, 1440 × 50955px

All 39 sections renamed to `section.*` convention. Layer-level fixes applied: typos (`div. messaage-*`), trailing spaces, `InsightS & Goals` → `heading-lg`, `text-primary` frame → `div.body-text`, `impactPoint` → `li.impact-point`.

---

### Step 4 — `case-study.v2` duplicate ✅ DONE

**Node:** `17:518` — `case-study.v2`, x=1540 y=0, 1440×50955px (Page 1)

43 sections verified. Direct children of all `section.*` frames renamed (`Frame XXXXXXX` → `div.wrapper`, `Container` → `div.container`). Content-as-name text nodes fixed (`heading-lg`, `p`). Generic `List` frame → `ul`.

**Naming conventions reference:**
```
section.name               ← top-level page section
div.container              ← max-width content wrapper
div.wrapper                ← generic layout wrapper
div.label-container        ← section label + heading area
div.img-container          ← image/prototype placeholder
figure.annotated           ← image + leader line annotations
div.annotation-group       ← group of annotations on one image
div.annotation             ← single annotation (line + label)
line.leader                ← connecting leader line
div.annotation-label       ← text block at end of leader
p.annotation-text          ← annotation text
h1 h2 h3                  ← headings by hierarchy
p                          ← standard body (grey-650)
p.highlight                ← highlighted body (grey-500)
p.secondary                ← muted text (grey-600)
p.detail                   ← detail text (grey-700)
p.editorial-primary        ← lead-in main message (grey-500)
p.editorial-detail         ← lead-in detail (grey-700)
label                      ← uppercase label
caption-label              ← small metadata label (new — size TBD)
caption-body               ← small metadata body (new — size TBD)
display-2xl                ← text layer using display-2xl token
heading-lg heading-md      ← text layers using heading tokens
body-xl                    ← text layer using body-xl token (18px)
```

## Deferred (Post-Launch)

- [ ] Push action.outline/ghost tokens + updated radius scale to Figma via Token Studio
- [ ] Apply Figma variables to CaseStudyCard and HeroSection
- [ ] Write components.md entries for HeroSection and BounceCanvas
- [ ] MDX case study content
- [ ] Add opacity tokens
- [x] Storybook — set up with `@storybook/react-vite` (Vite, not webpack — avoids Next.js webpack conflict on Node 25); Typography story covers full specimen + proposed DS changes
