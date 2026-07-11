import styles from './CardRow.module.css'

type CardRowSize = 'fill' | 'span2'

interface CardRowProps {
  size?: CardRowSize
  className?: string
  children: React.ReactNode
}

export default function CardRow({ size = 'fill', className, children }: CardRowProps) {
  return (
    <div className={`${styles.cardRow} ${styles[size]}${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  )
}
