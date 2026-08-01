import { forwardRef } from 'react'
import styles from './Block.module.css'

export type BlockSize = 'xs' | 'sm' | 'md' | 'lg' | '2xl'
export type BlockColor = 'primary' | 'secondary' | 'tertiary' | 'inverse'

interface BlockProps {
  size: BlockSize
  color?: BlockColor
  children: React.ReactNode
  className?: string
}

// CSS class selectors can't start with a digit — '2xl' maps to the 'size2xl' class.
const sizeClassName = (size: BlockSize) => (size === '2xl' ? styles.size2xl : styles[size])

const Block = forwardRef<HTMLParagraphElement, BlockProps>(function Block(
  { size, color = 'secondary', children, className },
  ref
) {
  return (
    <p ref={ref} className={`${styles.block} ${sizeClassName(size)} ${styles[color]}${className ? ` ${className}` : ''}`}>
      {children}
    </p>
  )
})

export default Block
