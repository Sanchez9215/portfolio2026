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
  className?: string
  images?: ImageItem[]
}

export default function ImgCard({ children, caption, aspectRatio, className, images }: ImgCardProps) {
  return (
    <Card variant="outline" className={className}>
      {images ? (
        <div className={`${styles.inner} ${styles.innerMulti}`}>
          {images.slice(0, 4).map((img, i) => (
            <div key={i} className={styles.imgColumn}>
              <div className={styles.imgWrapper}>
                <img src={img.src} alt={img.alt ?? ''} className={styles.imgFill} />
              </div>
              <div className={styles.labelWrapper}>
                <span className={styles.caption}>{img.caption}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.inner}>
          <div className={styles.imgWrapper} style={aspectRatio ? { aspectRatio } : undefined}>
            {children}
          </div>
          {caption && (
            <div className={styles.labelWrapper}>
              <span className={styles.caption}>{caption}</span>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
