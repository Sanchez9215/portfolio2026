import Label from './Label'
import Title from './Title'
import styles from './Card.module.css'

import type { LabelSize } from './Label'
import type { TitleSize } from './Title'

export type CardSize = 'xs' | 'sm' | 'md' | 'lg'
type GapSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface CardProps {
  variant?: 'filled' | 'outline' | 'ghost'
  size?: CardSize
  label?: string
  labelSize?: LabelSize
  title?: string
  titleSize?: TitleSize
  separator?: boolean
  gap?: GapSize
  headerGap?: GapSize
  className?: string
  children?: React.ReactNode
}

export default function Card({
  variant = 'ghost',
  size,
  label,
  labelSize,
  title,
  titleSize,
  separator = false,
  gap = 'md',
  headerGap = 'sm',
  className,
  children,
}: CardProps) {
  const hasHeader = label || title
  const resolvedLabelSize: LabelSize = labelSize ?? size ?? 'sm'
  const resolvedTitleSize: TitleSize = titleSize ?? size ?? 'md'

  return (
    <div className={`${styles.card} ${styles[variant]}${className ? ` ${className}` : ''}`}>
      {hasHeader && (
        <div
          className={`${styles.header}${separator ? ` ${styles.separator}` : ''}`}
          data-tb-heading
        >
          {label && <Label size={resolvedLabelSize}>{label}</Label>}
          {title && <Title size={resolvedTitleSize}>{title}</Title>}
        </div>
      )}
      {children && (
        <div className={`${styles.content} ${styles[`gap-${gap}`]}${hasHeader ? ` ${styles[`header-gap-${headerGap}`]}` : ''}`}>
          {children}
        </div>
      )}
    </div>
  )
}
