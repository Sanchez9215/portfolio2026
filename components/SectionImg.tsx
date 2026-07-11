import Section from './Section'
import styles from './SectionImg.module.css'

type SectionImgLayout = 'row' | 'column' | 'corner'

interface SectionImgProps {
  layout: SectionImgLayout
  before?: React.ReactNode
  image: React.ReactNode | React.ReactNode[]
  after?: React.ReactNode
  className?: string
}

export default function SectionImg({ layout, before, image, after, className }: SectionImgProps) {
  const images = Array.isArray(image) ? image : [image]
  const imageEl = (
    <div className={styles.image}>
      {images.map((img, i) => (
        <div key={i} className={styles.imageItem}>{img}</div>
      ))}
    </div>
  )

  if (layout === 'corner') {
    return (
      <Section className={className}>
        <div className={styles.corner}>
          {before}
          <div className={styles.cornerRow}>
            {imageEl}
            <div className={styles.cornerAfter}>{after}</div>
          </div>
        </div>
      </Section>
    )
  }

  if (layout === 'column') {
    return (
      <Section className={className}>
        <div className={styles.column}>
          {before && <div className={styles.columnBefore}>{before}</div>}
          {imageEl}
          {after && <div className={styles.columnAfter}>{after}</div>}
        </div>
      </Section>
    )
  }

  return (
    <Section className={className}>
      <div className={styles.row}>
        {before && <div className={styles.rowBefore}>{before}</div>}
        {imageEl}
        {after && <div className={styles.rowAfter}>{after}</div>}
      </div>
    </Section>
  )
}
