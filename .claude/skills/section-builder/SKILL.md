# Section Builder

Adds a new section to any case study page in the portfolio.

---

## Never do this

- **Never propose new CSS without grepping the stylesheet first.** Search for the structural pattern before writing any rule. Reuse an existing class if it applies.
- **Never put a grid-column rule on a child when the section's own class can handle it.** Use `> *` on the section class when all direct children share the same span. Only add `className` to a child for unique per-instance overrides.
- **Never use a wrapper div solely to apply a column span.** Use `> *` or `> :nth-child(n)` on the parent.
- **Never replace `grid-template-columns` on a Section.** Use `nth-child` column spans to position children within the 12-col grid.
- **Never use `!important` to force a layout override.** Win specificity with an element-qualified selector (e.g. `section.foo`).
- **Never derive a component's internal structure from Figma's sub-layer tree.** Only the parent layer name is authoritative. Look up the real prop API in the codebase.

---

## Layout system

Every section uses the `Section` component as a shell. It applies `cs-grid` (12-col, `column-gap: --spacing-xl`, `padding-inline: --spacing-xl`) and `padding-block: --spacing-5xl`. Components inside are layout-agnostic — column placement comes from the page-level module CSS.

**New default (as of `section.framework`, Software Observability): a new section's own content fills 100vh.** Not a change to `Section.tsx` itself (no height prop) — the section-owning component sets its own `height: 100vh` internally, same as `TheProblemPinnedScene`/`FrameworkScene` do, and is placed via `grid-column: 1 / -1` in the page module CSS if it's freeform (see below) or full-bleed.

A section whose content is a **spatial composition** (a diagram, not column-based text/cards) can go freeform — absolute-positioned, ignoring `cs-grid`'s column placement entirely for its internal layout — rather than being forced into 12 columns. Confirm this with the user before building; it's a real departure from every other section's convention, not a default to assume.

## Naming convention

`{sectionName}{ComponentType}{n}` — append index only when the same component type appears more than once in a section.

```css
/* ── section.context ── */
.contextTextBlock {
  grid-column: 1 / 7;
}
.contextImgCard {
  grid-column: 7 / -1;
}

/* ── section.insights ── */
.insightsTextBlock1 {
  grid-column: 1 / 5;
}
.insightsTextBlock2 {
  grid-column: 5 / 9;
}
```

## Steps to add a section

1. Check `components/built-components.md` — if a new component is needed, run `/component-builder` with the Figma node link first
2. Add a `<Section>` block in the case study `page.tsx`
3. Give each component a `className={styles.sectionNameComponentType}`
4. Add the placement rule to the case study `[name].module.css` under a comment matching the Figma section name
5. Update `components/built-components.md` with any new components
6. Update `progress.md` — add the section to the built list
   e
