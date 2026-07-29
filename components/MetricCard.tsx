import styles from './MetricCard.module.css'

interface MetricCardProps {
  value: string
  label: string
  source?: { label: string; href: string }
  className?: string
  valueRef?: (el: HTMLParagraphElement | null) => void
}

export default function MetricCard({ value, label, source, className, valueRef }: MetricCardProps) {
  return (
    <div className={`${styles.metricCard}${className ? ` ${className}` : ''}`}>
      <p ref={valueRef} className={styles.value}>{value}</p>
      <p className={styles.label}>{label}</p>
      {source && (
        <a
          className={styles.source}
          href={source.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {source.label}
        </a>
      )}
    </div>
  )
}
