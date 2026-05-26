## menu-item

### What it is

A full-width navigation link used inside the overlay menu. Responds to responsive typography tokens for desktop and mobile. Not mobile-only.

### Variants

- `a.menu-item` — default
- `a.menu-item-hover` — hover

### Layer structure

menu-item
├── a.menu-item / a.menu-item-hover ← root link frame
│ ├── div.fill ← animated bg fill, hidden in default via overflow
│ └── div.content ← padding wrapper prevents text shift on hover
│ ├── label ← link text, uppercase
│ └── icon ← fixed-width container for icon
│ └── goArrow ← arrow SVG asset

### Tokens

| Layer             | Token                        | Property      |
| ----------------- | ---------------------------- | ------------- |
| a.menu-item       | `nav.menu-item-text`         | color         |
| a.menu-item       | `nav.menu-item-border`       | border-bottom |
| a.menu-item       | `border.style-default`       | border-style  |
| a.menu-item       | `border.card`                | border-width  |
| div.fill          | `nav.menu-item-bg-hover`     | background    |
| icon              | opacity 0 default, 1 hover   | —             |
| a.menu-item-hover | `nav.menu-item-border-hover` | border-bottom |

### Typography

| Layer | Token                                          |
| ----- | ---------------------------------------------- |
| label | `label-md`, Clash Display, semibold, uppercase |

### Behavior

- `div.fill` sits behind `div.content` via z-index, hidden below the frame using `overflow: hidden` on the root `a`. On hover it slides up via `translateY` transition.
- `goArrow` opacity transitions from 0 to 1 on hover.
- Border color transitions from `nav.menu-item-border` to `nav.menu-item-border-hover` on hover.
- All transitions use a single easing — to be defined in motion tokens.

### Notes

- `div.content` exists solely to hold padding so the label does not shift horizontally when the icon appears.
- Used inside the overlay menu on both desktop and mobile.
- The root element is an `a` tag — it must receive an `href`.

## button

Global button component used across the entire portfolio experience.
Figma node 284:230 (Claude-Code file).

### Variants

| variant     | default                              | hover                                |
| ----------- | ------------------------------------ | ------------------------------------ |
| `primary`   | yellow bg, yellow border, dark text  | dark bg, yellow border, yellow text  |
| `secondary` | dark bg, dark border, white text     | white bg, white border, dark text    |
| `outline`   | dark bg, yellow border, yellow text  | yellow bg, yellow border, dark text  |
| `ghost`     | no bg/border, grey text              | no bg/border, yellow text            |

### Layer structure

button
└── span.label ← typography only

### Tokens

| Property         | Token                          |
| ---------------- | ------------------------------ |
| border-width     | `border.button` (4px)          |
| border-radius    | `radius.default` (16px)        |
| padding          | `spacing-md` × `spacing-xl`    |
| bg/border/color  | `action.[variant]-*`           |

### Typography

| Layer       | Token                                        |
| ----------- | -------------------------------------------- |
| span.label  | `label-xl`, Clash Display, semibold, uppercase |

### Behavior

- Renders as `<a>` when `href` prop is supplied, `<button>` otherwise.
- All hover states implemented via CSS `:hover` — no JS state.
- Transition: background-color, color, border-color — 200ms ease.
- Nav uses `variant="outline"` for MENU and `variant="ghost"` for CLOSE, toggled by nav state.

### Notes

- This component replaces `NavButton`. NavButton has been deleted.
- Do not create nav-specific or page-specific button components — extend this set with new variants as needed.

---

## nav

> Requires nav-button to be built first. Import it — do not rebuild.

Figma link: https://www.figma.com/design/rhdD9xQskHnJjGA5rC7LPk/Claude-Code?node-id=274-75

### What it is

Sticky full-width nav that stays fixed at the top of the viewport. Contains a header with branding on the left and a nav-button on the right. Expands to fill the viewport on open. All open/close state is managed within the nav component itself.

### Structure

- nav (sticky, full viewport width, fixed top)
  - div.nav-header (centered, 32px top/bottom, 16px left/right from nav edges)
    - div.brand (left)
    - NavButton (right, imported component)
  - div.menu-list (wrapper div, not a separate component)
    - MenuItem (repeated, imported component)

### Behavior — Collapsed (default)

- div.menu-list height is 0 and not visible.
- NavButton shows the default open variant.

### Behavior — Expanded (on button click)

Use GSAP for all animations. Use motion tokens for all duration, delay, and easing values.

Animation sequence on open:

1. NavButton transitions smoothly to close variant.
2. Nav container expands smoothly to fill the full viewport height.
3. After nav container has fully expanded, div.menu-list extends to its full height.
4. After menu-list is fully extended, each MenuItem animates in top to bottom:
   - Bottom border appears first
   - Immediately after, the label fades up
   - Each item staggers after the previous

Animation sequence on close:

- Nav container regresses smoothly to its original collapsed height.
- Interior elements do not animate out — they are hidden as the container shrinks.

All animations should feel swift and modern. The entire open sequence should complete quickly so the user is not waiting.

### Motion Tokens

All timing values must reference motion tokens — do not hardcode. Add the following to tokens.json before building if not already present:

- `motion.duration.nav-expand` — 700ms
- `motion.duration.nav-overlay` — 500ms
- `motion.duration.nav-items` — 500ms
- `motion.delay.nav-items` — 250ms
- `motion.stagger.nav-items` — 50ms
- `motion.easing.nav-expand` — cubic-bezier(0.4, 0, 0.2, 1)
- `motion.easing.nav-items` — cubic-bezier(0.4, 0, 0.2, 1)

These are your tweak points — adjust values in tokens.json to change the feel without touching component code.

### Notes

- Same behavior on mobile.
- div.menu-list is not a separate component — it will not be reused elsewhere.
- NavButton open/close variant is controlled by nav state passed as a prop.

---

## case-study-card

Figma nodes 321:357 (desktop) · 323:548 (mobile) — Claude-Code file.

### What it is

A full-width portfolio card linking to a case study page. The entire `<a>` element is the link. Two-column layout on desktop; stacked single-column on ≤768px.

### Layer structure

```
a.card  ← full card is the link
├── div.cardHeader
│   ├── div.titleWrapper
│   │   └── h2.title            ← display-xl, bold, uppercase, --text-display
│   └── div.overview            ← 436px fixed width desktop; full-width mobile
│       ├── div.overviewContent
│       │   ├── p.sectionLabel  ← heading-sm, bold, uppercase, --text-secondary
│       │   └── p.description   ← body-lg, regular, --text-secondary
│       └── div.metaGroup
│           └── div.metaItem × n
│               ├── p.metaLabel ← body-sm, bold, uppercase, --text-secondary
│               └── p.metaValue ← body-sm, regular, --text-secondary
└── div.cardContent
    ├── ul.impactList            ← DOM-first; 432px desktop; order:-1 mobile
    │   └── li.impactPoint × n
    │       ├── p.impactHeading  ← heading-md, bold, uppercase, --text-primary
    │       └── p.impactBody     ← body-lg, regular, --text-secondary
    └── div.imgContainer         ← flex-1 desktop; fixed 320px height mobile
```

### Variants / breakpoints

| Breakpoint | cardHeader | cardContent | imgContainer |
| --- | --- | --- | --- |
| Desktop (>768px) | flex-row | flex-row, pl-xl, gap-3xl | flex-1, h-fill, radius-lg tl+br |
| Stacked (≤768px) | flex-col | flex-col, imgContainer order:-1 | full-width, h-320px, radius-md tl+br |

### Tokens

| Layer | Token | Property |
| --- | --- | --- |
| a.card | `surface.card` | background |
| a.card | `surface.card-border` | border-color default |
| a.card | `surface.card-border-hover` | border-color hover |
| a.card | `radius.lg` | border-radius |
| h2.title | `text.display` | color |
| h2.title | `display-xl` | typography (Responsive/Desktop → Mobile) |
| p.sectionLabel | `text.secondary` | color |
| p.sectionLabel | `heading-sm` | typography |
| p.description | `text.secondary` | color |
| p.description | `body-lg` | typography |
| p.metaLabel | `text.secondary` | color |
| p.metaLabel | `body-sm` | typography |
| p.metaValue | `text.secondary` | color |
| p.metaValue | `body-sm` | typography |
| p.impactHeading | `text.primary` | color |
| p.impactHeading | `heading-md` desktop / `heading-sm` mobile | typography |
| p.impactBody | `text.secondary` | color |
| p.impactBody | `body-lg` | typography |
| div.imgContainer | `surface.base` | background |
| div.imgContainer | `radius.lg` (desktop) / `radius.md` (mobile) | tl+br corners |

### Props

```ts
href: string
title: string
category: string
description: string
meta: { label: string; value: string }[]
impactPoints: { heading: string; body: string }[]
imageSrc?: string
imageAlt?: string
className?: string
```

### Notes

- No `'use client'` — pure server component, no JS interactivity.
- `impactList` is DOM-first for correct reading order; CSS `order: -1` on `imgContainer` moves it above on mobile.
- `--text-primary` (grey-50) used for impact headings in place of pure white (#FFF); `--text-secondary` (grey-600) used for all muted text in place of `neutral/700` (grey-700) and raw `#b5c7e5`.
- Title typography (`display-xl`) automatically resolves to mobile values (32px) via globals.css `@media (max-width: 393px)` override.
