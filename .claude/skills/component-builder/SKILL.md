---
name: component-builder
description: Build React/Next.js components for Edgar Sanchez's portfolio from a Figma node link, using tokens.json and globals.css as the source of truth. Triggers when the user says "build this component", "generate the component", "translate to code", shares a Figma link, or references a layer structure to implement. Always requires a Figma link before starting.
---

# Component Builder

Builds Next.js + Tailwind components for Edgar Sanchez's portfolio using:

- Figma MCP to read layer structure, hierarchy, and bound variables from the provided node
- `design-system/tokens.json` as the single source of truth for all design tokens
- `styles/globals.css` as the single source of truth for all declared CSS custom properties
- `components/components.md` for layer structure, behavior, and variants (token references optional)
- `components/built-components.md` as the registry of already-built components

---

## Before Writing Any Code — Required Gate

**Do not write any code until the following checklist is completed and confirmed by the user.**

### Step 0 — Require a Figma Link

If no Figma node link has been provided, stop immediately and ask:

> "Please share the Figma link to the component node before I start building."

Do not proceed until a link is provided.

---

### Step 1 — Read Reference Files

Read the following files before doing anything else:

1. `components/built-components.md` — registry of already-built components
2. `design-system/tokens.json` — full token set (Primitives, Semantic, Responsive/Desktop, Responsive/Mobile)
3. `styles/globals.css` — all declared CSS custom properties
4. `components/components.md` — find the entry for the target component (if present)

---

### Step 2 — Fetch the Figma Node

Use Figma MCP to fetch the provided node. Extract:

- Full layer hierarchy and layer names
- For each layer: all bound Figma variables and their values
- Any SVG assets (icons, decorative elements)

---

### Step 3 — Output the Pre-Build Checklist

Before writing any code, output the following summary and wait for user confirmation:

```
## Pre-Build Checklist — [ComponentName]

### Layers
[List every layer name and its mapped HTML element]

### Reused Components
[List any layers that match an entry in built-components.md, or state "None"]

### Token Bindings
[List every Figma variable found → its resolved CSS custom property]
[Flag any variable that cannot be resolved in globals.css]

### Missing or Unresolved
[List any token, layer type, or asset that could not be resolved, or state "None"]

### components.md entry found?
[Yes / No — if No, note that structure will be inferred from Figma layers only]

Ready to build. Confirm to proceed.
```

**Wait for the user to confirm before writing any code.**

---

## Token Resolution — Source of Truth Chain

Figma variables, tokens.json, and globals.css are three representations of the same data, pushed from Token Studio. Always resolve in this order:

```
Figma variable (e.g. nav/menu-item-text)
  → tokens.json path (e.g. Semantic.nav.menu-item-text)
  → CSS custom property (e.g. --nav-menu-item-text in globals.css)
```

### Rules

- **Never copy a raw value from Figma** (hex, px, rem). Always resolve to the CSS custom property.
- **Never reference Primitives tokens directly** in components. All values must come from Semantic tokens. If no Semantic token exists for a value, flag it in the checklist — do not reach into Primitives.
- **Never hardcode** any color, spacing, radius, font-size, line-height, letter-spacing, or border value. Every visual value must reference a CSS custom property declared in `globals.css`.
- **Verify before writing**: if a token path from Figma cannot be found in `tokens.json` or its CSS property cannot be found in `globals.css`, flag it — do not invent a fallback.
- Tokens are global and can be used across any component or element. All entries in `tokens.json` are available to every component.

### CSS Variable Naming Convention

Convert token paths to CSS variables using kebab-case. Strip the `Semantic.` prefix. Convert remaining dots and camelCase to kebab-case:

| Token path                                        | CSS variable                      |
| ------------------------------------------------- | --------------------------------- |
| `Semantic.nav.menu-item-text`                     | `--nav-menu-item-text`            |
| `Semantic.spacing.nav-padding`                    | `--spacing-nav-padding`           |
| `Semantic.radius.pill`                            | `--radius-pill`                   |
| `Responsive/Desktop.typography.label-md.fontSize` | `--typography-label-md-font-size` |

### Typography Token Sources

Typography requires values combined from two token sets:

```
font-family + font-weight  →  Primitives.typography.[role]
font-size + line-height + letter-spacing  →  Responsive/Desktop.typography.[role]
text-transform  →  Primitives.typography.[role].textTransform (labels only)
```

For responsive typography, declare `Responsive/Desktop` values as the default and apply `Responsive/Mobile` values inside `@media (max-width: 393px)`.

### Motion Tokens

Motion tokens (duration, easing) are not yet defined in `tokens.json`. If a transition or animation is required:

- Use a clearly named CSS variable placeholder: `var(--motion-easing-default)`, `var(--motion-duration-default)`
- Leave a `// TODO: define motion token` comment
- Never hardcode easing or duration values

---

## Layer → DOM Mapping

Layer names are DOM-semantic. The prefix determines the HTML element. The suffix becomes the CSS class name.

### Mapping Rules

| Layer prefix | HTML element | Notes                                             |
| ------------ | ------------ | ------------------------------------------------- |
| `div.foo`    | `<div>`      | Layout or visual wrapper                          |
| `a.foo`      | `<a>`        | Must receive an `href` prop                       |
| `button.foo` | `<button>`   | Action trigger                                    |
| `label`      | `<span>`     | Inline text, typically uppercase                  |
| `p`          | `<p>`        | Body text                                         |
| `h1`–`h4`    | heading tag  | Match level to type scale role                    |
| `icon`       | `<span>`     | Generic icon wrapper, always `aria-hidden="true"` |
| `nav`        | `<nav>`      | Top-level navigation landmark                     |

### Named SVG Assets

Named SVG layers (e.g. `goArrow`, `logoMark`) are SVG assets, not layout elements. They do not follow the prefix mapping rule. Resolve them as follows:

1. Check `public/icons/` — if the file exists, import it
2. If not found, fetch the asset from Figma MCP and save it to `public/icons/[name].svg` before using it
3. Always wrap in an `<span className="icon" aria-hidden="true">` container

### Variants

Figma variants (e.g. `a.menu-item` vs `a.menu-item-hover`) are the same HTML element. Implement as a single element with CSS `:hover` pseudo-class. Never create duplicate JSX for variants.

### Layers with No Prefix

If a layer has no recognized prefix and is not a named SVG asset, flag it in the pre-build checklist. Do not guess the element type.

---

## Reusing Built Components

Before writing any code, check `components/built-components.md`. If a layer in the new component matches a registry entry:

- Import the existing component — do not rebuild it
- List the match in the Pre-Build Checklist under "Reused Components"

### Registry Format

```md
| design-system name | file                    |
| ------------------ | ----------------------- |
| menu-item          | components/MenuItem.tsx |
```

---

## Building the Component

### File Conventions

- Component files: PascalCase → `MenuItemList.tsx`
- CSS module: same name → `MenuItemList.module.css`
- Location: `components/`
- One component per file

### Tailwind Usage

Use Tailwind **only** for layout utilities: `flex`, `grid`, `relative`, `absolute`, `overflow`, `z-index`, `transition`, `gap`.

Use CSS custom properties for all token values (color, spacing, typography, radius, border):

```tsx
// Correct
<div className="relative flex flex-col overflow-hidden"
     style={{ background: 'var(--nav-bg)', padding: 'var(--spacing-nav-padding)' }}>

// Wrong — hardcoded values
<div className="bg-black p-6 flex flex-col">
```

### Hover and Animation

Implement hover states in CSS (`.module.css` or a `<style>` block). Never use JS for hover unless toggling open/closed state is required.

---

## Flagging and Communication

When something cannot be resolved, stop and report using this format before continuing:

```
⚠ MISSING TOKEN — Figma variable `[name]` could not be resolved in tokens.json or globals.css. Add the token or confirm a placeholder.

⚠ MISSING ASSET — Layer `[name]` has no file in public/icons/. Fetching from Figma MCP node [id] — confirm before saving.

⚠ UNRESOLVED LAYER — Layer `[name]` has no recognized prefix and no match in built-components.md. Confirm the HTML element type before proceeding.

⚠ PRIMITIVE LEAK — Value for `[property]` resolves to a Primitive token. No Semantic token found. Flag for token system — do not use the Primitive directly.
```

Always wait for user confirmation after flagging. Do not make a judgment call and continue.

---

## After Building — Update the Registry

After a component is successfully built, add it to `components/built-components.md`:

```md
| [design-system name] | components/[ComponentName].tsx |
```

---

## Output Checklist

Before returning the component, verify:

- [ ] No hardcoded color, spacing, radius, font-size, or border values
- [ ] Every visual value traces to a CSS custom property in `globals.css`
- [ ] No Primitive tokens used directly — all values come from Semantic tokens
- [ ] Layer hierarchy matches Figma structure
- [ ] Variants implemented as CSS `:hover`, not duplicate JSX
- [ ] Root `<a>` element (if present) receives an `href` prop
- [ ] Named SVG assets imported from `public/icons/` or fetched and saved there
- [ ] `components/built-components.md` updated with the new entry

---

## Reference Files

| File                             | Purpose                                              |
| -------------------------------- | ---------------------------------------------------- |
| `design-system/tokens.json`      | Token source of truth — read before every build      |
| `styles/globals.css`             | CSS custom property declarations — verify vars here  |
| `components/components.md`       | Layer structure and behavior specs (optional tokens) |
| `components/built-components.md` | Registry of built components — check before building |
