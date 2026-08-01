import Title from './Title'
import Block from './Block'
import styles from './TitleBlock.module.css'

import type { TitleSize } from './Title'

interface TitleBlockProps {
  /** 'xl' is Title-only (Hero's standalone headline) — not part of TitleBlock's shared Title+Block scale */
  size: Exclude<TitleSize, 'xl'>
  title: string
  body?: string
  inverse?: boolean
  titleColor?: 'tertiary'
  className?: string
}

export default function TitleBlock({ size, title, body, inverse = false, titleColor, className }: TitleBlockProps) {
  return (
    <div className={`${styles.titleBlock}${className ? ` ${className}` : ''}`}>
      <Title size={size} color={inverse ? 'inverse' : (titleColor ?? 'default')}>{title}</Title>
      {body && <Block size={size} color={inverse ? 'inverse' : 'tertiary'}>{body}</Block>}
    </div>
  )
}
