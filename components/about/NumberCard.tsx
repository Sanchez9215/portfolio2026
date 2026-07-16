/**
 * NumberCard — ⚑ NEW COMPONENT (built for /about, pending review)
 *
 * An indexed statement card: oversized display numeral, uppercase
 * label heading, and body copy. Used for the "How I Operate" pillars
 * and the "Designing Systems with AI" practices on /about.
 *
 * No Figma source — designed in code with existing tokens.
 * Pattern: Card(outline) DNA with a display-metric numeral accent.
 */

import styles from './NumberCard.module.css'

interface NumberCardProps {
  index: string
  title: string
  children: React.ReactNode
  className?: string
}

export default function NumberCard({
  index,
  title,
  children,
  className,
}: NumberCardProps) {
  return (
    <div className={`${styles.numberCard}${className ? ` ${className}` : ''}`}>
      <span className={styles.index} aria-hidden="true">
        {index}
      </span>
      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.copy}>{children}</div>
      </div>
    </div>
  )
}
