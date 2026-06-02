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

## Project Structure

```
portfolio/
├── .claude/skills/component-builder/SKILL.md
├── app/
│   ├── page.tsx          # Home — Nav + HeroSection wired; Work section 1/4 cards done
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
3. Work Section — 4 CaseStudyCards, 1/4 wired, **3 remaining**

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
| BounceCanvas | `components/BounceCanvas.tsx` | Two-canvas fixed layer; GSAP Draggable + d3-force graph; exclusion zones; passive + hover firing; villain + AutonomousCluster + FreeNode systems |
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
- Ready to wire into the Work section — see props in `components/components.md`

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

### BounceCanvas — full-page fixed layer ✅ ALL STAGES COMPLETE

**Packages installed:** `d3-force` + `@types/d3-force` (both in package.json).

**Architecture — two-canvas fixed layer:**
- **`networkCanvas`** (`styles.networkCanvas`) — `position: fixed; inset: 0; z-index: 1` — draws d3 network (connector lines + attached shapes). Sits behind `heroBottomWrapper` (z-index 1, later in DOM) so the subline text wins.
- **`.container`** — `position: fixed; inset: 0; z-index: 2` — holds the pellet canvas + robot img. Floats above the blue card and subline.
- `pointer-events: none` on both canvases and container; `pointer-events: auto` on robot `<img>` only.
- All mouse events at `window` level — canvas coords = viewport coords, no offset needed.

**Page stacking context (critical — do not change without understanding this):**
- `html` — `background: var(--surface-base)` — root layer
- `BounceCanvas networkCanvas` — `z-index: 1`, rendered **before** heroBottomWrapper in DOM → d3 network goes **behind** subline
- `.heroBottomWrapper` — `z-index: 1`, later in DOM → blue card + subline paint **above** network
- `BounceCanvas .container` — `z-index: 2` — robot + pellets + falling shapes above blue card
- `.heroTopContent` — `z-index: 3` — headline/role text above everything
- `.hero` — **no** `isolation: isolate`, **no** explicit `z-index` — children compete in root context
- Nav — `z-index: ~100` — always on top

**Exclusion zone system (dynamic DOM-measured bounds):**
- `textZones` — robot overlaps `overlapPx` (default 16px) into the zone edge (behind text)
- `gapZones` — robot stays `gapPx` (default 16px) clear of zone edge
- `activeZoneRef` — mouse entering triggers active firing mode
- `spawnZoneRef` — falling shapes spawn from top edge within this element's X bounds
- Bounds computed each frame via `getBoundingClientRect()` — fully responsive

**L-shape logic in `getEffectiveBounds(sx, sy)`:**
- For each zone ref, checks if robot's Y overlaps with zone's Y range
- Determines side (left/right) from zone center X vs canvas midpoint
- Left zone → constrains `minX`; right zone → constrains `maxX`
- Text zones use `r.right - overlapPx` / `r.left + overlapPx`; gap zones use `r.right + gapPx` / `r.left - gapPx`

**Active firing (window-level mousemove):**
- Tracks `isInActiveZone` by checking mouse coords vs `activeZoneRef.getBoundingClientRect()`
- Enter zone → `mode = "active"`; leave zone → `mode = "tapering"`

**`getEffectiveBounds(sx, sy, svy)` — Y lookahead:**
- Passes current `vy` as `svy` so the X constraint pre-activates 60px before zone entry
- Prevents jolts when zone boundary suddenly shifts and robot is already past the new X limit
- X violations resolve via lerp (`x += (target - x) * 0.18`) rather than hard-snap

**Current wiring (`HeroWithCanvas.tsx`):**
```
textZones   → [headlineZoneRef, sublineZoneRef]   // overlap 16px
gapZones    → [buttonGroupZoneRef]                 // 16px clearance
activeZone  → heroZoneRef (full hero section)      // entire hero triggers active firing
spawnZone   → heroZoneRef (full hero section)      // shapes fall within hero X bounds
```

**Pellet config (Cuphead-inspired):**
- `PELLET.speed: 8` px/frame
- `PASSIVE.rapidInterval: 300ms`, `rapidCount: 2`
- `ACTIVE_EVERY: 8` frames (~133ms)
- White capsule — no custom pellet props

**d3-force simulation constants (`SIM` block at top of BounceCanvas.tsx):**
- `linkDistance: 120` — spread out for full-viewport canvas
- `chargeStrength: -120` — strong repulsion keeps graph from clustering
- `collideRadius: 30` — wide personal space between nodes
- `alphaDecay: 0.02`, `alphaIdleTarget: 0.05` — keeps graph gently ticking

**Falling shapes — manual pool, 10 entries:**
- Add to `FALLING_SHAPES` array at top of file with `{ src, w, h }` — no code changes needed elsewhere
- Spawn top-edge only, X constrained to `spawnZoneRef` bounds (hero section)
- Falls back to full viewport width if `spawnZoneRef` not provided
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
- Canvas no longer draws villains — only tracks position/velocity/state

*Villain movement:*
- Size: 120×120px
- Enters from a random screen edge, travels straight across on one axis, dies when fully off-screen
- Rotation by entry edge: left/right → 0°, top → +90° (CW), bottom → −90° (CCW)
- No bouncing — strictly cross-screen travel
- Up to `maxCount: 2` active, one spawns every `spawnDelay: 6000ms`

*Pellet → villain hit animation:*
- Pellet AABB collision detected in the pellet loop (after shape-hit check)
- On hit: pellet dies, `v.isHit = true` (prevents re-triggering), `villainBabyRefs.current[v.slotIdx]?.triggerHit()` called
- **Hit animation sequence (BulletBaby):**
  1. Shake (whole SVG, ±4px, 5 cycles)
  2. Eye rect squishes (`scaleY → 0`, fades out) + wing highlight fades simultaneously
  3. Body fill → `#FF7878` (pink), bracket squint eyes appear — all via React state (`isHit`)
  4. Impact lines flash in then out
  5. **Recovers after 0.5s** — body returns to `#0B0B0D`, eye opens, wing returns, brackets hide
- Hit state is **temporary** — villain returns to original SVG after recovery
- When villain dies off-screen: `villainBabyRefs.current[v.slotIdx]?.reset()` resets the slot for reuse

*Robot contact → AutonomousCluster:*
- Villain overlaps robot → `spawnCluster(hitX, hitY)` called
- Picks the d3 node closest to the impact point as center, plus up to `CLUSTER.branchCount: 5` nearest neighbours
- All selected nodes detached from the main d3 network via `removeShapesFromNetwork()`
- Cluster gets random initial direction at `CLUSTER.speed`, bounces off all 4 viewport edges
- Internal layout: spring-force — each branch node pulled toward its `targetRelX/Y` offset from cluster center (`springK: 0.04`, `damping: 0.88`)
- Drawn with dashed yellow connector lines (star topology: center → each branch) + shape images with outline

*Villain contact with cluster → scatter:*
- Villain overlaps any cluster node → all cluster nodes ejected as `FreeNode[]`
- Each free node gets burst velocity outward from cluster center (`burstSpeed: 3` px/frame) + random variance
- Cluster marked dead, villain flashes

*Free nodes:*
- Drift with `vx *= 0.995` friction per frame, bounce off viewport edges
- Drawn at 65% opacity — permanently on screen (no re-attach)

*`hitCooldown: 45` frames* — prevents same villain from triggering again immediately

**Key config blocks (all at top of BounceCanvas.tsx):**
- `PELLET` — pellet size, speed, color
- `PASSIVE` — passive firing cadence timings
- `ACTIVE_EVERY` / `TAPER_SHOTS` — hover firing frame constants
- `CONNECTOR` — line style + topology rules
- `SIM` — force simulation constants
- `SHAPE_OUTLINE` — attached shape border color + width
- `SPAWN` — shape spawn timing + cap
- `VILLAIN` — villain size, speed, entry, flash/cooldown durations, burst speed
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
   - GSAP function-based values evaluated at tween init — natural positions guaranteed

**Collapse (reverse):**
1. heroBottomWrapper rises — `height: 0 → bottomHeightRef.current`, `clearProps:"height"` on complete
2. Chars roll CW back in — `x → 0`, `rotation → 0`, stagger `from: "start"` (left-to-right cascade)
3. Role row fades back in at `t=0.3` — `opacity → 1`, `y → 0`

**`EXPAND_ANIM` constants** (top of HeroSection.tsx):
```ts
charDuration: 0.6   // s — each char's roll
charStagger:  0.04  // s — between chars in a line
lineDelay:    0.18  // s — before each successive line starts
```

**`expandedRef`** — `useRef<boolean>` guards against double-clicks mid-animation. State `expanded` only flips in `onComplete`.

## What's Next

- [ ] Complete Work section — 3 more `CaseStudyCard` instances in `app/page.tsx` (1/4 wired)
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
