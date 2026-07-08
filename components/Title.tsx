import styles from './Title.module.css'

export type TitleSize = 'xs' | 'sm' | 'md' | 'lg'

interface TitleProps {
  size: TitleSize
  children: string
  className?: string
}

export default function Title({ size, children, className }: TitleProps) {
  return (
    <p className={`${styles.title} ${styles[size]}${className ? ` ${className}` : ''}`}>
      {children}
    </p>
  )
}
