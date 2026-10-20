'use client'

import { forwardRef, useRef } from 'react'
import styles from './Block.module.css'
import { useWordReveal } from './useWordReveal'

export type BlockSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type BlockColor = 'primary' | 'secondary' | 'tertiary' | 'inverse'

interface BlockProps {
  size: BlockSize
  color?: BlockColor
  children: React.ReactNode
  className?: string
  /** Word-by-word color reveal on scroll — the same style as LabelBlock's display text. */
  reveal?: boolean
}

// CSS class selectors can't start with a digit — '2xl' maps to the 'size2xl' class.
const sizeClassName = (size: BlockSize) => (size === '2xl' ? styles.size2xl : styles[size])

const Block = forwardRef<HTMLParagraphElement, BlockProps>(function Block(
  { size, color = 'secondary', children, className, reveal = false },
  ref
) {
  const ownRef = useRef<HTMLParagraphElement | null>(null)
  useWordReveal(ownRef, reveal)
  return (
    <p
      ref={(el) => {
        ownRef.current = el
        if (typeof ref === 'function') ref(el)
        else if (ref) ref.current = el
      }}
      className={`${styles.block} ${sizeClassName(size)} ${styles[color]}${className ? ` ${className}` : ''}`}>
      {children}
    </p>
  )
})

export default Block
