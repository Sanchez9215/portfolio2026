import styles from './TextBlock.module.css'

interface TextBlockProps {
  label: string
  body: string
  size: 'xs' | 'sm' | 'md' | 'lg'
}

export default function TextBlock({ label, body, size }: TextBlockProps) {
  return (
    <div className={`${styles.textBlock} ${styles[size]}`}>
      <span className={styles.label}>{label}</span>
      <p className={styles.body}>{body}</p>
    </div>
  )
}
