/**
 * SnapshotGallery — ⚑ NEW COMPONENT (built for /about, pending review)
 *
 * A row of playfully rotated "snapshot" photo cards with uppercase
 * caption plates — a personal, off-duty counterpoint to the case-study
 * ImgCard. Cards straighten and lift on hover.
 *
 * No Figma source — designed in code with existing tokens.
 * Tokens: surface.*, text.*, spacing.*, radius, label type.
 */

import styles from './SnapshotGallery.module.css'

export interface Snapshot {
  src: string
  alt: string
  caption: string
}

interface SnapshotGalleryProps {
  snapshots: Snapshot[]
  className?: string
}

export default function SnapshotGallery({
  snapshots,
  className,
}: SnapshotGalleryProps) {
  return (
    <ul className={`${styles.gallery}${className ? ` ${className}` : ''}`}>
      {snapshots.map((s, i) => (
        <li key={i} className={styles.snapshot}>
          <div className={styles.imgWrapper}>
            <img src={s.src} alt={s.alt} className={styles.img} />
          </div>
          <span className={styles.caption}>{s.caption}</span>
        </li>
      ))}
    </ul>
  )
}
