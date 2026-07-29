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
  variant?: 'bare' | 'card'
  inverse?: boolean
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
}: ImgCardProps) {
  const captionClassName = `${styles.caption}${inverse ? ` ${styles.inverse}` : ''}`

  const content = images ? (
    <div className={`${styles.inner} ${styles.innerMulti} ${layout === 'column' ? styles.innerMultiColumn : ''}`}>
      {images.slice(0, 4).map((img, i) => (
        <div key={i} className={styles.imgColumn}>
          <div className={styles.imgWrapper}>
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
      <div
        className={styles.imgWrapper}
        style={{ ...(aspectRatio ? { aspectRatio } : {}), ...(height ? { height } : {}) }}
      >
        {children}
      </div>
      {caption && (
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
