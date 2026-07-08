import styles from './Label.module.css'

export type LabelSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface LabelProps {
  size: LabelSize
  children: string
  className?: string
}

export default function Label({ size, children, className }: LabelProps) {
  return (
    <span className={`${styles.label} ${styles[size]}${className ? ` ${className}` : ''}`}>
      {children}
    </span>
  )
}
