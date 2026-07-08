# Section Builder

Adds a new section to any case study page in the portfolio.

---

## Layout system

Every section uses the `Section` component as a shell. It applies `cs-grid` (12-col, `column-gap: --spacing-xl`, `padding-inline: --spacing-xl`) and `padding-block: --spacing-5xl`. Components inside are layout-agnostic — column placement comes from the page-level module CSS.

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
