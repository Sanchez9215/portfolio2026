import styles from './Title.module.css'

export type TitleSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type TitleColor = 'default' | 'inverse' | 'tertiary' | 'primary'

interface TitleProps {
  size: TitleSize
  color?: TitleColor
  children: string
  className?: string
}

export default function Title({ size, color = 'default', children, className }: TitleProps) {
  return (
    <p className={`${styles.title} ${styles[size]} ${styles[color]}${className ? ` ${className}` : ''}`}>
      {children}
    </p>
  )
}
