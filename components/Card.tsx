import Label from './Label'
import Title from './Title'
import styles from './Card.module.css'

import type { LabelSize } from './Label'
import type { TitleSize } from './Title'

type GapSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface CardProps {
  variant?: 'filled' | 'outline' | 'ghost'
  label?: string
  labelSize?: LabelSize
  title?: string
  titleSize?: TitleSize
  separator?: boolean
  gap?: GapSize
  className?: string
  children?: React.ReactNode
}

export default function Card({
  variant = 'ghost',
  label,
  labelSize = 'sm',
  title,
  titleSize = 'md',
  separator = false,
  gap = 'md',
  className,
  children,
}: CardProps) {
  const hasHeader = label || title

  return (
    <div className={`${styles.card} ${styles[variant]}${className ? ` ${className}` : ''}`}>
      {hasHeader && (
        <div
          className={`${styles.header}${separator ? ` ${styles.separator}` : ''}`}
          data-tb-heading
        >
          {label && <Label size={labelSize}>{label}</Label>}
          {title && <Title size={titleSize}>{title}</Title>}
        </div>
      )}
      {children && (
        <div className={`${styles.content} ${styles[`gap-${gap}`]}${hasHeader ? ` ${styles.hasHeader}` : ''}`}>
          {children}
        </div>
      )}
    </div>
  )
}
