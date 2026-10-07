import styles from './Section.module.css'

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  className?: string
}

export default function Section({ children, className, ...rest }: SectionProps) {
  return (
    <section className={`cs-grid ${styles.section}${className ? ` ${className}` : ''}`} {...rest}>
      {children}
    </section>
  )
}
