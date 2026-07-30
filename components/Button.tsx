/**
 * Button — global button component
 *
 * Five variants: primary | secondary | outline | ghost | accent
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
 *   accent    — blue-500 bg, grey-50 text            → darkens to blue-600 on hover
 *
 * TODO (roadmap): this component is due a full rework — accent was added as a
 * scoped, minimal addition (software-experience-embed's Layer Inspect CTA),
 * not a broader pass over the whole component.
 */

import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent'
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
  /** Optional trailing icon, rendered after the label with an 8px gap. */
  icon?: React.ReactNode
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
  icon,
}: ButtonProps) {
  // 'lg' is the .btn baseline — no extra class needed; 'md' adds the override class.
  const cls = [styles.btn, styles[variant], size === 'md' ? styles.md : null, className].filter(Boolean).join(' ')

  const content = (
    <>
      <span className={styles.label}>{children}</span>
      {icon && <span className={styles.icon}>{icon}</span>}
    </>
  )

  if (href) {
    return (
      <a href={href} className={cls} aria-label={ariaLabel}>
        {content}
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
      {content}
    </button>
  )
}
