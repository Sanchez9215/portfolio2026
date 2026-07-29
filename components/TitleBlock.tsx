import Title from './Title'
import Block from './Block'
import styles from './TitleBlock.module.css'

import type { TitleSize } from './Title'

interface TitleBlockProps {
  size: TitleSize
  title: string
  body?: string
  inverse?: boolean
  className?: string
}

export default function TitleBlock({ size, title, body, inverse = false, className }: TitleBlockProps) {
  return (
    <div className={`${styles.titleBlock}${className ? ` ${className}` : ''}`}>
      <Title size={size} color={inverse ? 'inverse' : 'default'}>{title}</Title>
      {body && <Block size={size} color={inverse ? 'inverse' : 'tertiary'}>{body}</Block>}
    </div>
  )
}
