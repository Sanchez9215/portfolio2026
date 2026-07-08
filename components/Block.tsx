import styles from './Block.module.css'

export type BlockSize = 'xs' | 'sm' | 'md' | 'lg'
export type BlockColor = 'primary' | 'secondary' | 'tertiary'

interface BlockProps {
  size: BlockSize
  color?: BlockColor
  children: React.ReactNode
  className?: string
}

export default function Block({ size, color = 'secondary', children, className }: BlockProps) {
  return (
    <p className={`${styles.block} ${styles[size]} ${styles[color]}${className ? ` ${className}` : ''}`}>
      {children}
    </p>
  )
}
