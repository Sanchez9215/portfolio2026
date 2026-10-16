import styles from './QuoteBlock.module.css'

interface QuoteBlockProps {
  quote: string
  emphasis?: string
  attribution?: string
  /** "compact": the smaller stacked layout from Figma node 1:63 — 24px quote
   *  (530px wide) with the 24px uppercase emphasis below it instead of beside
   *  it, smaller quote mark. Default layout unchanged. */
  variant?: 'default' | 'compact'
  className?: string
  markRef?: (el: HTMLImageElement | null) => void
  quoteTextRef?: (el: HTMLParagraphElement | null) => void
  emphasisRef?: (el: HTMLParagraphElement | null) => void
  attributionRef?: (el: HTMLParagraphElement | null) => void
}

export default function QuoteBlock({
  quote,
  emphasis,
  attribution,
  variant = 'default',
  className,
  markRef,
  quoteTextRef,
  emphasisRef,
  attributionRef,
}: QuoteBlockProps) {
  return (
    <div
      className={`${styles.quoteBlock}${variant === 'compact' ? ` ${styles.compact}` : ''}${className ? ` ${className}` : ''}`}
    >
      <div className={styles.quoteRow}>
        <div className={styles.quoteContent}>
          <img
            ref={markRef}
            src="/icons/quote.svg"
            alt=""
            aria-hidden="true"
            className={styles.quoteMark}
            width={48}
            height={32}
          />
          <p ref={quoteTextRef} className={styles.bodyDisplay}>{quote}</p>
        </div>
        {emphasis && (
          <div className={styles.quoteEmphasis}>
            <p ref={emphasisRef} className={styles.displayLg}>{emphasis}</p>
          </div>
        )}
      </div>
      {attribution && <p ref={attributionRef} className={styles.attribution}>{attribution}</p>}
    </div>
  )
}
