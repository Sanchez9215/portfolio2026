import styles from './QuoteBlock.module.css'

interface QuoteBlockProps {
  quote: string
  emphasis?: string
  attribution?: string
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
  className,
  markRef,
  quoteTextRef,
  emphasisRef,
  attributionRef,
}: QuoteBlockProps) {
  return (
    <div className={`${styles.quoteBlock}${className ? ` ${className}` : ''}`}>
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
