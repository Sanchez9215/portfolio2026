import styles from './MetricCard.module.css'

interface MetricCardProps {
  value: string
  label: string
  className?: string
}

export default function MetricCard({ value, label, className }: MetricCardProps) {
  return (
    <div className={`${styles.metricCard}${className ? ` ${className}` : ''}`}>
      <p className={styles.value}>{value}</p>
      <p className={styles.label}>{label}</p>
    </div>
  )
}
