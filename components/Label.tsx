import { forwardRef } from 'react'
import styles from './Label.module.css'

export type LabelSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type LabelColor = 'default' | 'inverse' | 'secondary' | 'tertiary'

interface LabelProps {
  size: LabelSize
  color?: LabelColor
  children: string
  className?: string
}

const Label = forwardRef<HTMLSpanElement, LabelProps>(function Label(
  { size, color = 'default', children, className },
  ref
) {
  return (
    <span ref={ref} className={`${styles.label} ${styles[size]} ${styles[color]}${className ? ` ${className}` : ''}`}>
      {children}
    </span>
  )
})

export default Label
