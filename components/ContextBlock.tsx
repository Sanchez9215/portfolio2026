import styles from './ContextBlock.module.css'

interface ContextBlockProps {
  side?: 'left' | 'right' | 'none'
  children: React.ReactNode
  className?: string
}

export default function ContextBlock({ side = 'left', children, className }: ContextBlockProps) {
  return (
    <div className={`${styles.contextBlock}${side !== 'none' ? ` ${styles[side]}` : ''}${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  )
}
