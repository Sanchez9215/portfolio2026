---
name: component-builder
description: Build React/Next.js components for Edgar Sanchez's portfolio from Figma layer structure and tokens.json as the source of truth. Use this skill whenever the user wants to build, generate, or translate a Figma component into code — especially when they mention layer names like div.fill, a.menu-item, label, icon, or reference components.md or tokens.json. Always use this skill when the user says "build this component", "generate the component", "translate to code", or shares a layer structure to implement.
---

# Component Builder

Builds Next.js + Tailwind components for Edgar Sanchez's portfolio using:

- Figma layer names as the DOM structure guide
- `tokens.json` as the single source of truth for all design values
- `components.md` as the component spec

## Source of Truth Priority

1. `tokens.json` — all values (color, spacing, typography, radius, border)
2. `components.md` — component spec, variants, behavior, token mappings
3. Figma layer names — DOM structure and element types
4. Never hardcode values. Every value must resolve to a CSS variable from tokens.json.

## Step 1 — Read Tokens

Before writing any code read:

- `design-system/tokens.json` — full token set
- `design-system/components.md` — component entry for the target component

Extract and map the following into CSS custom properties:

### Token Resolution Order

Tokens are organized in sets. Resolve in this order:

1. `Semantic` — use these for all component values (color, spacing, radius, border)
2. `Responsive/Desktop` and `Responsive/Mobile` — use for typography (font-size, line-height, letter-spacing)
3. `Primitives` — only referenced by Semantic tokens, never used directly in components

### CSS Variable Naming Convention

Convert token paths to CSS variables using kebab-case:

| Token path                                        | CSS variable                      |
| ------------------------------------------------- | --------------------------------- |
| `Semantic.nav.bg`                                 | `--nav-bg`                        |
| `Semantic.nav.menu-item-text`                     | `--nav-menu-item-text`            |
| `Semantic.spacing.nav-padding`                    | `--spacing-nav-padding`           |
| `Semantic.radius.pill`                            | `--radius-pill`                   |
| `Responsive/Desktop.typography.label-md.fontSize` | `--typography-label-md-font-size` |

Declare all used variables in `:root` or as a scoped block at the top of the component file.

## Step 2 — Read Layer Structure

Layer names map directly to HTML elements and CSS classes:

| Layer name          | HTML element        | Notes                                 |
| ------------------- | ------------------- | ------------------------------------- |
| `nav`               | `<nav>`             | top-level nav frame                   |
| `a.menu-item`       | `<a>`               | link, must have href                  |
| `a.menu-item-hover` | —                   | hover variant, not a separate element |
| `button.menu`       | `<button>`          | action trigger                        |
| `div.fill`          | `<div>`             | visual layer, aria-hidden             |
| `div.content`       | `<div>`             | layout wrapper                        |
| `div.brand`         | `<div>`             | semantic grouping                     |
| `div.meta`          | `<div>`             | semantic grouping                     |
| `label`             | `<span>`            | inline text, uppercase                |
| `icon`              | `<span>` or `<div>` | icon container                        |
| `p`                 | `<p>`               | body text                             |
| `h1`–`h4`           | `<h1>`–`<h4>`       | heading, match type scale role        |

Variants (`a.menu-item` vs `a.menu-item-hover`) are the same element — implement as a single element with CSS hover pseudo-class, not two separate elements.

## Step 3 — Map Typography

Typography requires values from two token sets combined:

```
font-family + font-weight  →  Primitives.typography.[role]
font-size + line-height + letter-spacing  →  Responsive/Desktop.typography.[role]
text-transform  →  Primitives.typography.[role].textTransform (labels only)
```

For responsive typography, apply `Responsive/Mobile` values inside a media query at the mobile breakpoint (`Semantic.breakpoint.mobile` = 393px).

## Step 4 — Build the Component

### File conventions

- Component files: PascalCase → `MenuNavItem.tsx`
- Located in: `components/`
- One component per file

### Component template

```tsx
// CSS variables declared at top — all values from tokens.json
const styles = {
  '--nav-menu-item-text': 'var(--color-nav-menu-item-text)',
  // ... all tokens used by this component
} as React.CSSProperties

export default function ComponentName({ href, children }: Props) {
  return (
    // DOM structure mirrors Figma layer hierarchy
  )
}
```

### Tailwind usage

Use Tailwind only for layout utilities (flex, grid, relative, absolute, overflow, z-index, transition). Use CSS variables for all token values (color, spacing, typography, radius, border).

```tsx
// Correct — layout in Tailwind, values from CSS vars
<a className="relative flex items-center overflow-hidden"
   style={{ borderBottom: '1px solid var(--nav-menu-item-border)' }}>

// Wrong — hardcoded values
<a className="border-b border-gray-800 flex items-center">
```

### Hover and animation

Implement hover states using CSS — either a `<style>` block in the component or a companion `.module.css` file. Never use JS for hover unless interaction requires state (e.g. toggling a menu open).

For `div.fill` slide-up animation:

```css
.fill {
  position: absolute;
  inset: 0;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  background: var(--nav-menu-item-bg-hover);
  z-index: 0;
}

.menu-item:hover .fill {
  transform: translateY(0);
}

.menu-item:hover .icon {
  opacity: 1;
}
```

### z-index layering

`div.fill` must sit behind `div.content`. Use `z-index: 0` on fill, `z-index: 1` on content. Root `a` must have `position: relative` and `overflow: hidden`.

## Step 5 — Responsive

Apply mobile typography tokens inside a media query. Layout changes (if any) are defined in `components.md`.

```css
@media (max-width: 393px) {
  .label {
    font-size: var(--typography-label-md-font-size-mobile);
    line-height: var(--typography-label-md-line-height-mobile);
  }
}
```

## Step 6 — Output Checklist

Before returning the component verify:

- [ ] No hardcoded color, spacing, radius, or typography values
- [ ] Every value traces back to a token in tokens.json
- [ ] Layer hierarchy matches Figma structure
- [ ] Variants implemented as CSS hover, not duplicate JSX
- [ ] `div.fill` has `aria-hidden="true"`
- [ ] Root `a` element has `href` prop
- [ ] Component file is PascalCase in `components/`
- [ ] Mobile typography tokens applied in media query

## Reference Files

- `design-system/tokens.json` — always read before building
- `design-system/components.md` — read the entry for the target component
