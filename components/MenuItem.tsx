/**
 * MenuItem
 *
 * Full-width overlay navigation link.
 * Built from Figma node 218:247 — Claude-Code file.
 *
 * Layer structure (mirrors Figma):
 *   a.menu-item
 *   ├── div.fill        — animated blue bg, slides up on hover
 *   └── div.content     — flex row, left-padded
 *       ├── label       — uppercase Clash Display semibold, label-2xl
 *       └── icon        — 48×48 container, opacity 0 → 1 on hover
 *           └── goArrow — northeast arrow SVG (inlined for currentColor)
 *
 * Tokens: nav.menu-item-* + typography.label-2xl (design-system/tokens.json)
 * Spec:   components/components.md → menu-item
 */

import styles from './MenuItem.module.css'

interface MenuItemProps {
  /** Navigation target */
  href: string
  /** Link text — rendered uppercase via CSS */
  label: string
}

export default function MenuItem({ href, label }: MenuItemProps) {
  return (
    <a href={href} className={styles['menu-item']}>

      {/* div.fill — animated blue bg; overflow:hidden on root clips it below */}
      <div className={styles.fill} aria-hidden="true" />

      {/* div.content — layout row, left pad */}
      <div className={styles.content}>

        {/* label — uppercase, Clash Display semibold, label-2xl */}
        <span className={styles.label}>{label}</span>

        {/* icon — goArrow, hidden until hover */}
        <span className={styles.icon} aria-hidden="true">
          {/* goArrow SVG — inlined so currentColor resolves from parent */}
          <svg
            className={styles['go-arrow']}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <mask
              id="go-arrow-mask"
              style={{ maskType: 'alpha' }}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="48"
              height="48"
            >
              <rect width="48" height="48" fill="#D9D9D9" />
            </mask>
            <g mask="url(#go-arrow-mask)">
              <path
                d="M13.0825 36.9326L9.34996 33.2001L27.9 14.6501H11.6325V9.3501H36.9325V34.6501H31.6325V18.3826L13.0825 36.9326Z"
                fill="currentColor"
              />
            </g>
          </svg>
        </span>

      </div>
    </a>
  )
}
