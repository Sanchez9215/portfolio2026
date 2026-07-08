import Title from './Title'
import Block from './Block'
import styles from './TitleBlock.module.css'

import type { TitleSize } from './Title'

interface TitleBlockProps {
  size: TitleSize
  title: string
  body?: string
  className?: string
}

export default function TitleBlock({ size, title, body, className }: TitleBlockProps) {
  return (
    <div className={`${styles.titleBlock}${className ? ` ${className}` : ''}`}>
      <Title size={size}>{title}</Title>
      {body && <Block size={size} color="tertiary">{body}</Block>}
    </div>
  )
}
