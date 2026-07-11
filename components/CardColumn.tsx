import styles from './CardColumn.module.css'

interface CardColumnProps {
  className?: string
  children: React.ReactNode
}

export default function CardColumn({ className, children }: CardColumnProps) {
  return (
    <ol className={`${styles.cardColumn}${className ? ` ${className}` : ''}`}>
      {children}
    </ol>
  )
}
