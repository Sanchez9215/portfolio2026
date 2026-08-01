import { forwardRef } from 'react'
import styles from './Label.module.css'

export type LabelSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type LabelColor = 'default' | 'inverse' | 'secondary' | 'tertiary' | 'accent'

interface LabelProps {
  size: LabelSize
  color?: LabelColor
  children: string
  className?: string
}

// CSS class selectors can't start with a digit — '2xl' maps to the 'size2xl' class.
const sizeClassName = (size: LabelSize) => (size === '2xl' ? styles.size2xl : styles[size])

const Label = forwardRef<HTMLSpanElement, LabelProps>(function Label(
  { size, color = 'default', children, className },
  ref
) {
  return (
    <span ref={ref} className={`${styles.label} ${sizeClassName(size)} ${styles[color]}${className ? ` ${className}` : ''}`}>
      {children}
    </span>
  )
})

export default Label
