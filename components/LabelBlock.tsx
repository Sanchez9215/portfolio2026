import Label from './Label'
import Block from './Block'
import styles from './LabelBlock.module.css'

type SizedProps = {
  size: 'xs' | 'sm' | 'md' | 'lg'
  label?: string
  body?: string
  support?: never
  className?: string
}

type DisplayProps = {
  size: 'display'
  label?: string
  body?: string
  support?: string
  className?: string
}

type LabelBlockProps = SizedProps | DisplayProps

export default function LabelBlock(props: LabelBlockProps) {
  const { label, body, className } = props

  if (props.size === 'display') {
    const { support } = props
    return (
      <div className={`${styles.labelBlock} ${styles.display}${className ? ` ${className}` : ''}`}>
        {label && <Label size="xl">{label}</Label>}
        {(body || support) && (
          <div className={styles.displayBody}>
            {body    && <p className={styles.statement}>{body}</p>}
            {support && <p className={styles.support}>{support}</p>}
          </div>
        )}
      </div>
    )
  }

  const { size } = props
  return (
    <div className={`${styles.labelBlock} ${styles[size]}${className ? ` ${className}` : ''}`}>
      {label && <Label size={size}>{label}</Label>}
      {body  && <Block size={size} color="tertiary">{body}</Block>}
    </div>
  )
}
