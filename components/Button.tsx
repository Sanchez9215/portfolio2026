/**
 * Button — global button component
 *
 * Variants: primary | secondary | outline | link
 * Structure mirrors XOPS's Button (design-systems/xops/components/Button.tsx) —
 * discriminated icon/iconOnly union, shared --state-* hover/active buckets.
 * Built from Figma node 228:7718 ("Button Set", Portfolio Cleaning file).
 * Tokens: --button-*, --state-* (styles/globals.css)
 *
 * outline/link variants have no Figma source yet — the type/class exist,
 * but no color tokens are defined for them (TODO, see built-components.md).
 * Single height scale so far (--control-height-large only) — no size prop yet.
 */

import { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'link'

type ButtonBaseProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  variant?: ButtonVariant
  /** Renders the button as an <a> tag */
  href?: string
}

type ButtonWithLabelProps = ButtonBaseProps & {
  iconOnly?: false
  icon?: ReactNode
  children: ReactNode
}

type ButtonIconOnlyProps = ButtonBaseProps & {
  iconOnly: true
  icon: ReactNode
  'aria-label': string
  children?: never
}

export type ButtonProps = ButtonWithLabelProps | ButtonIconOnlyProps

export default function Button(props: ButtonProps) {
  const { variant = 'primary', icon, href, className = '', ...rest } = props

  const cls = [styles.btn, styles[variant], icon ? styles.hasIcon : null, className]
    .filter(Boolean)
    .join(' ')

  const iconBadge = icon && (
    <span className={styles.iconBadge} aria-hidden="true">
      {icon}
    </span>
  )

  if (props.iconOnly) {
    const { 'aria-label': ariaLabel, ...buttonRest } = rest as Omit<
      ButtonIconOnlyProps,
      'variant' | 'icon' | 'href' | 'className' | 'iconOnly'
    >
    return (
      <button type="button" className={cls} aria-label={ariaLabel} {...buttonRest}>
        {iconBadge}
      </button>
    )
  }

  const { children, ...buttonRest } = rest as Omit<
    ButtonWithLabelProps,
    'variant' | 'icon' | 'href' | 'className' | 'iconOnly'
  >

  const content = (
    <>
      {iconBadge}
      <span className={styles.label}>{children}</span>
    </>
  )

  if (href) {
    return (
      <a href={href} className={cls}>
        {content}
      </a>
    )
  }

  return (
    <button type="button" className={cls} {...buttonRest}>
      {content}
    </button>
  )
}
