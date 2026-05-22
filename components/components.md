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
