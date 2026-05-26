/**
 * Button — global button component
 *
 * Four variants: primary | secondary | outline | ghost
 * Built from Figma node 284:230 (Claude-Code file).
 * Tokens: action.* (design-system/tokens.json)
 *
 * Renders as <a> when href is supplied, <button> otherwise.
 * Used across the entire portfolio experience — not nav-specific.
 *
 * Variants:
 *   primary   — yellow bg, yellow border, dark text → inverts on hover
 *   secondary — dark bg, dark border, white text    → white bg on hover
 *   outline   — dark bg, yellow border, yellow text → yellow bg on hover
 *   ghost     — no bg/border, grey text             → yellow text on hover
 */

import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
export type ButtonSize    = 'lg' | 'md'

interface ButtonProps {
  variant: ButtonVariant
  /**
   * lg (default) — base .btn padding: --spacing-md (16px) / --spacing-xl (32px)
   * md            — adds .md override: --spacing-sm  (8px) / --spacing-lg  (24px)
   * Only 'md' injects an extra CSS class; 'lg' is baked into .btn.
   */
  size?: ButtonSize
  children: React.ReactNode
  /** Renders the button as an <a> tag */
  href?: string
  onClick?: () => void
  /** Forwarded to <button> only */
  type?: 'button' | 'submit' | 'reset'
  className?: string
  'aria-label'?: string
}

export default function Button({
  variant,
  size = 'lg',
  children,
  href,
  onClick,
  type = 'button',
  className = '',
  'aria-label': ariaLabel,
}: ButtonProps) {
  // 'lg' is the .btn baseline — no extra class needed; 'md' adds the override class.
  const cls = [styles.btn, styles[variant], size === 'md' ? styles.md : null, className].filter(Boolean).join(' ')

  if (href) {
    return (
      <a href={href} className={cls} aria-label={ariaLabel}>
        <span className={styles.label}>{children}</span>
      </a>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={cls}
      aria-label={ariaLabel}
    >
      <span className={styles.label}>{children}</span>
    </button>
  )
}
