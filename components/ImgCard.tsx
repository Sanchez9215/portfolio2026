import styles from './ImgCard.module.css'

interface ImgCardProps {
  children: React.ReactNode
  caption?: string
  aspectRatio?: string
}

export default function ImgCard({ children, caption, aspectRatio }: ImgCardProps) {
  return (
    <div className={styles.imgCard}>
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
    </div>
  )
}
