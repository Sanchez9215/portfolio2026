import { forwardRef } from 'react'
import styles from './Block.module.css'

export type BlockSize = 'xs' | 'sm' | 'md' | 'lg'
export type BlockColor = 'primary' | 'secondary' | 'tertiary' | 'inverse'

interface BlockProps {
  size: BlockSize
  color?: BlockColor
  children: React.ReactNode
  className?: string
}

const Block = forwardRef<HTMLParagraphElement, BlockProps>(function Block(
  { size, color = 'secondary', children, className },
  ref
) {
  return (
    <p ref={ref} className={`${styles.block} ${styles[size]} ${styles[color]}${className ? ` ${className}` : ''}`}>
      {children}
    </p>
  )
})

export default Block
