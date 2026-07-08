import styles from './QuoteBlock.module.css'

interface QuoteBlockProps {
  quote: string
  emphasis?: string
  className?: string
}

export default function QuoteBlock({ quote, emphasis, className }: QuoteBlockProps) {
  return (
    <div className={`${styles.quoteBlock}${className ? ` ${className}` : ''}`}>
      <div className={styles.quoteContent}>
        <img
          src="/icons/quote.svg"
          alt=""
          aria-hidden="true"
          className={styles.quoteMark}
          width={48}
          height={32}
        />
        <p className={styles.bodyDisplay}>{quote}</p>
      </div>
      {emphasis && (
        <div className={styles.quoteEmphasis}>
          <p className={styles.displayLg}>{emphasis}</p>
        </div>
      )}
    </div>
  )
}
