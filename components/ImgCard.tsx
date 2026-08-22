import Card from './Card'
import styles from './ImgCard.module.css'

type ImageItem = {
  src: string
  alt?: string
  caption: string
}

interface ImgCardProps {
  children?: React.ReactNode
  caption?: string
  aspectRatio?: string
  height?: string
  className?: string
  images?: ImageItem[]
  layout?: 'row' | 'column'
  variant?: 'bare' | 'card' | 'embed'
  inverse?: boolean
  /** Lets content (e.g. a hotspot tooltip) render past the image wrapper's own
   *  edges instead of being clipped by its default `overflow: hidden`. */
  allowOverflow?: boolean
  /** variant="embed" only — total hotspot count, rendered as a segment track
   *  above the embed. Omit to hide the track entirely. */
  progressSteps?: number
  /** variant="embed" only — 0-based index of the current hotspot; segments up
   *  through this index render filled. undefined/-1 = none filled yet (the
   *  pre-walkthrough countdown state). */
  activeStep?: number
  /** variant="embed" only — seconds remaining before the walkthrough starts;
   *  null/undefined hides the countdown text. */
  countdownSeconds?: number | null
}

export default function ImgCard({
  children,
  caption,
  aspectRatio,
  height,
  className,
  images,
  layout = 'row',
  variant = 'bare',
  inverse = false,
  allowOverflow = false,
  progressSteps,
  activeStep,
  countdownSeconds,
}: ImgCardProps) {
  const captionClassName = `${styles.caption}${inverse ? ` ${styles.inverse}` : ''}`
  const imgWrapperClassName = `${styles.imgWrapper}${allowOverflow ? ` ${styles.imgWrapperOverflowVisible}` : ''}`
  const isEmbed = variant === 'embed'

  const content = images ? (
    <div className={`${styles.inner} ${styles.innerMulti} ${layout === 'column' ? styles.innerMultiColumn : ''}`}>
      {images.slice(0, 4).map((img, i) => (
        <div key={i} className={styles.imgColumn}>
          <div className={imgWrapperClassName}>
            <img src={img.src} alt={img.alt ?? ''} className={styles.imgFill} />
          </div>
          <div className={styles.labelWrapper}>
            <span className={captionClassName}>{img.caption}</span>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className={styles.inner}>
      {isEmbed && (
        <div className={styles.embedHeader}>
          <div className={styles.embedHeaderRow}>
            {caption && <span className={captionClassName}>{caption}</span>}
            {countdownSeconds != null && (
              <span className={styles.countdown}>
                Walkthrough starts in{' '}
                <strong className={styles.countdownValue}>
                  {String(countdownSeconds).padStart(2, '0')}
                </strong>
              </span>
            )}
          </div>
          {progressSteps != null && progressSteps > 0 && (
            <div className={styles.progressTrack}>
              {Array.from({ length: progressSteps }).map((_, i) => (
                <span
                  key={i}
                  className={`${styles.progressSegment}${
                    i <= (activeStep ?? -1) ? ` ${styles.progressSegmentFilled}` : ''
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
      <div
        className={imgWrapperClassName}
        style={{ ...(aspectRatio ? { aspectRatio } : {}), ...(height ? { height } : {}) }}
      >
        {children}
      </div>
      {!isEmbed && caption && (
        <div className={styles.labelWrapper}>
          <span className={captionClassName}>{caption}</span>
        </div>
      )}
    </div>
  )

  if (variant === 'card') {
    return (
      <Card variant="outline" className={`${styles.card}${className ? ` ${className}` : ''}`}>
        {content}
      </Card>
    )
  }

  return <div className={`${styles.bare}${className ? ` ${className}` : ''}`}>{content}</div>
}
