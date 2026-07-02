# Build Progress — Case Study: Software Observability

## Status
**M4 COMPLETE**

---

## Latest Changes

### M1 — Design System
- Added `grey.650` primitive (#96A0B2)
- Display scale: 6 tokens → 3 (`display-lg/md/sm`), fluid clamp, semibold
- Label scale: removed `label-2xl`, added `label-lg` + `label-xs`, all labels `ls: -0.02em`
- Body scale: lg 18px, md 16px, sm 14px, added `body-xs` 12px
- `text.primary` → grey-650, `text.display` → grey-300, added `text.body-highlight` (grey-500)
- `nav.menu-item-text` + `action.secondary-text` → grey-300
- Removed semantic spacing: `section-padding-x`, `section-padding-top`, `card-padding`
- Added `word-spacing.display: 0.2em`

### M2 — Component Updates
- `MenuItem.module.css` — label-2xl → display-sm, word-spacing added
- `Button.module.css`, `CaseStudyCursor.module.css` — word-spacing added

### M3 — New Components
- `components/TextBlock.tsx` + `TextBlock.module.css`
- `components/ImgCard.tsx` + `ImgCard.module.css` (includes `aspectRatio` prop)

### M4 — Case Study Page
- `styles/globals.css` — `.cs-grid` utility (12-col, `repeat(12, 1fr)`, `column-gap --spacing-xl`, `padding-inline --spacing-xl`)
- `app/work/software-observability/page.tsx` — new route
- `components/case-studies/software-observability/SectionIntroduction.tsx` + `.module.css`
  - 12-col grid: `projectOverview` cols 1/7, `projectImpact` cols 8/13, `heroImage` full-width
  - Image placeholder in place — swap for real `<img>` when ready
- `app/page.tsx` — fixed CaseStudyCard href (`softwareobservability` → `software-observability`)

---

## What's Next

- Remaining case study sections (beyond SectionIntroduction)
- Mobile layout for SectionIntroduction
- Wire up remaining 3 case study routes

---

## Deferred

- **Token rename** — `--text-body-highlight` → `--text-highlight` in tokens.json, globals.css, and all component CSS. Do not do mid-build.
- `--text-editorial-primary`, `--text-editorial-detail` — define when we reach the editorial section
- Fluid typography for body tokens (body scale is currently static)
- Border token naming — `--border-card`, `--border-style-default`, `--surface-card-border` used together everywhere; consider a shorthand semantic token
- Push action.outline/ghost tokens + updated radius scale to Figma via Token Studio
