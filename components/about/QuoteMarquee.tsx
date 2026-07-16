/**
 * QuoteMarquee — ⚑ NEW COMPONENT (built for /about, pending review)
 *
 * Horizontal auto-scrolling row of colleague-quote cards.
 * Content is duplicated once for a seamless CSS loop; the second
 * copy is aria-hidden. Pauses on hover. Honors prefers-reduced-motion
 * (falls back to a static, horizontally scrollable row).
 *
 * No Figma source — designed in code with existing tokens.
 * Reuses: Card (outline). Tokens: surface.*, text.*, spacing.*, label/body type.
 */

import Card from '../Card'
import styles from './QuoteMarquee.module.css'

export interface MarqueeQuote {
  quote: string
  name: string
  role: string
  href?: string
}

interface QuoteMarqueeProps {
  quotes: MarqueeQuote[]
  /** Scroll direction — alternate rows for a woven effect */
  direction?: 'left' | 'right'
  className?: string
}

export default function QuoteMarquee({
  quotes,
  direction = 'left',
  className,
}: QuoteMarqueeProps) {
  const renderCards = (hidden: boolean) =>
    quotes.map((q, i) => (
      <Card
        key={`${hidden ? 'dup-' : ''}${i}`}
        variant="outline"
        className={styles.quoteCard}
        gap="lg"
      >
        <p className={styles.quote}>&ldquo;{q.quote}&rdquo;</p>
        <div className={styles.attribution}>
          {q.href ? (
            <a
              href={q.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.name}
              tabIndex={hidden ? -1 : undefined}
            >
              {q.name}
            </a>
          ) : (
            <span className={styles.name}>{q.name}</span>
          )}
          <span className={styles.role}>{q.role}</span>
        </div>
      </Card>
    ))

  return (
    <div className={`${styles.marquee}${className ? ` ${className}` : ''}`}>
      <div
        className={`${styles.track}${direction === 'right' ? ` ${styles.reverse}` : ''}`}
      >
        {renderCards(false)}
        <div className={styles.duplicate} aria-hidden="true">
          {renderCards(true)}
        </div>
      </div>
    </div>
  )
}
