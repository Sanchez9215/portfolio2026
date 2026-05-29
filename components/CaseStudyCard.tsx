/**
 * CaseStudyCard — portfolio case study card
 *
 * Built from Figma nodes 321:357 (desktop) · 323:548 (mobile) — Claude-Code file.
 * Tokens: surface.*, text.*, radius.*, spacing.* (design-system/tokens.json)
 *
 * Layout:
 *   a.card (flex-col, full card is the link)
 *     div.cardHeader  ← flex-row desktop / flex-col ≤768px
 *       div.titleWrapper → h2.title
 *       div.overview
 *         div.overviewContent → p.sectionLabel + p.description
 *         div.metaGroup → div.metaItem × n (label + value)
 *     div.cardContent  ← flex-row desktop / flex-col ≤768px
 *       ul.impactList → li.impactPoint × n (heading + body)  ← DOM-first
 *       div.imgContainer  ← flex-1 desktop; order:-1 on ≤768px = visual top
 *
 * Token decisions (from pre-build checklist):
 *   - section labels & metadata: --text-secondary (grey-600)
 *   - impact headings:           --text-primary   (grey-50)
 *   - impact body:               --text-secondary (grey-600)
 */

import styles from './CaseStudyCard.module.css'

export interface CaseStudyMeta {
  label: string
  value: string
}

export interface CaseStudyImpactPoint {
  heading: string
  body: string
}

export interface CaseStudyCardProps {
  /** Case study page route — entire card is the link */
  href: string
  /** Display-xl headline, e.g. "XOPS — Software Intelligence" */
  title: string
  /** Section label rendered above the description, e.g. "Product Design" */
  category: string
  /** Short overview paragraph */
  description: string
  /** Metadata pairs, e.g. [{label:"Role", value:"Lead Designer"}] */
  meta: CaseStudyMeta[]
  /** Key impact highlights — Figma spec shows 3 items */
  impactPoints: CaseStudyImpactPoint[]
  /** Optional cover image URL */
  imageSrc?: string
  imageAlt?: string
  className?: string
}

export default function CaseStudyCard({
  href,
  title,
  category,
  description,
  meta,
  impactPoints,
  imageSrc,
  imageAlt = '',
  className = '',
}: CaseStudyCardProps) {
  return (
    <a href={href} className={[styles.card, className].filter(Boolean).join(' ')} data-case-study-card>

      {/* ── Card header: title + overview ─────────────────────── */}
      <div className={styles.cardHeader}>

        {/* Case study title — split on \n to support intentional line breaks */}
        <div className={styles.titleWrapper}>
          <h2 className={styles.title}>
            {title.split('\n').map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </h2>
        </div>

        {/* Overview: category label, description copy, metadata */}
        <div className={styles.overview}>
          <div className={styles.overviewContent}>
            <p className={styles.sectionLabel}>{category}</p>
            <p className={styles.description}>{description}</p>
          </div>

          {meta.length > 0 && (
            <div className={styles.metaGroup}>
              {meta.map((item, i) => (
                <div key={i} className={styles.metaItem}>
                  <p className={styles.metaLabel}>{item.label}</p>
                  <p className={styles.metaValue}>{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Card content: impact points + cover image ──────────── */}
      <div className={styles.cardContent}>

        {/*
          Impact list is DOM-first (correct reading order).
          On ≤768px it receives order: 2, pushing the imgContainer (order: -1) above it.
        */}
        <ul className={styles.impactList}>
          {impactPoints.map((point, i) => (
            <li key={i} className={styles.impactPoint}>
              <p className={styles.impactHeading}>{point.heading}</p>
              <p className={styles.impactBody}>{point.body}</p>
            </li>
          ))}
        </ul>

        {/* Cover image — fills remaining width on desktop; fixed height on mobile */}
        <div className={styles.imgContainer} aria-hidden="true">
          {imageSrc && (
            <img src={imageSrc} alt={imageAlt} className={styles.img} />
          )}
        </div>
      </div>
    </a>
  )
}
