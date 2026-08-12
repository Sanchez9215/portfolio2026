/**
 * Button — global button component
 *
 * Variants: primary | secondary | outline | link | text
 * Structure mirrors XOPS's Button (design-systems/xops/components/Button.tsx) —
 * discriminated icon/iconOnly union, shared --state-* hover/active buckets.
 * Built from Figma node 228:7718 ("Button Set", Portfolio Cleaning file).
 * Tokens: --button-*, --state-* (styles/globals.css)
 *
 * outline/link variants have no Figma source yet — the type/class exist,
 * but no color tokens are defined for them (TODO, see built-components.md).
 * text variant (bare/ghost, e.g. Nav's MENU trigger) built from Figma node
 * 572:1787 ("Portfolio Cleaning" file).
 * size: medium (default, --control-height-medium 48px) | large (--control-height-large 64px)
 * | l (--control-height-l 32px, label-lg text tier — e.g. Nav's MENU trigger).
 *
 * Primary + icon + labeled buttons (e.g. Hero's WORK) render as two full,
 * absolutely-stacked "faces" instead of a single static layout — the
 * default face (badge left, dark label field right) and the hover face
 * (solid blue, label left / icon right, layout fully reversed) — that slide
 * horizontally on hover: default face exits right, hover face enters from
 * the left, both moving together (a "push"). Reverses smoothly on mouse
 * leave via the same timeline played backwards.
 * Figma: 384:8384 (default) / 384:8373 (hover), "Portfolio Cleaning" file.
 *
 * Secondary label-only buttons (e.g. Hero's Contact) use the same two-face
 * push mechanic with a flat fill — the fill/label color just carries across
 * faces. Secondary + icon buttons (e.g. the Work card's "View Build") get
 * their own badge/field split default face instead, mirroring primary's
 * structure but recolored (light badge, dark field) per Figma node 641:7270
 * ("Portfolio Cleaning" file); the hover face falls back to secondary's
 * existing flat fill (no Figma hover mock to diverge from).
 */

"use client";

import { ButtonHTMLAttributes, ReactNode, useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "outline" | "link" | "text";
export type ButtonSize = "medium" | "large" | "l";

type ButtonBaseProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Renders the button as an <a> tag */
  href?: string;
};

type ButtonWithLabelProps = ButtonBaseProps & {
  iconOnly?: false;
  icon?: ReactNode;
  children: ReactNode;
};

type ButtonIconOnlyProps = ButtonBaseProps & {
  iconOnly: true;
  icon: ReactNode;
  "aria-label": string;
  children?: never;
};

export type ButtonProps = ButtonWithLabelProps | ButtonIconOnlyProps;

// TIMING is a live-tweak surface for the primary+icon slide hover only —
// edit and save to see changes via Fast Refresh.
const TIMING = {
  slideDuration: 0.185,
  slideEase: "power2.inOut",
};

export default function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "medium",
    icon,
    href,
    className = "",
    ...rest
  } = props;

  const hasSlideHover =
    (variant === "primary" && !!icon && !props.iconOnly) ||
    (variant === "secondary" && !props.iconOnly);

  const btnRef = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null);
  const defaultFaceRef = useRef<HTMLSpanElement>(null);
  const hoverFaceRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!hasSlideHover) return;
    const btnEl = btnRef.current;
    const defaultFaceEl = defaultFaceRef.current;
    const hoverFaceEl = hoverFaceRef.current;
    if (!btnEl || !defaultFaceEl || !hoverFaceEl) return;

    const ctx = gsap.context(() => {
      gsap.set(hoverFaceEl, { xPercent: -100 });

      const tl = gsap.timeline({
        paused: true,
        defaults: { duration: TIMING.slideDuration, ease: TIMING.slideEase },
      });
      tl.to(defaultFaceEl, { xPercent: 100 }, 0);
      tl.to(hoverFaceEl, { xPercent: 0 }, 0);

      const onEnter = () => tl.play();
      const onLeave = () => tl.reverse();
      btnEl.addEventListener("mouseenter", onEnter);
      btnEl.addEventListener("mouseleave", onLeave);

      return () => {
        btnEl.removeEventListener("mouseenter", onEnter);
        btnEl.removeEventListener("mouseleave", onLeave);
      };
    }, btnEl);

    return () => ctx.revert();
  }, [hasSlideHover]);

  const cls = [
    styles.btn,
    styles[variant],
    size !== "medium" ? styles[size] : null,
    icon && !hasSlideHover ? styles.hasIcon : null,
    hasSlideHover ? styles.hasSlideHover : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (props.iconOnly) {
    const { "aria-label": ariaLabel, ...buttonRest } = rest as Omit<
      ButtonIconOnlyProps,
      "variant" | "icon" | "href" | "className" | "iconOnly"
    >;
    return (
      <button
        type="button"
        className={cls}
        aria-label={ariaLabel}
        {...buttonRest}
      >
        {icon && (
          <span className={styles.iconBadge} aria-hidden="true">
            {icon}
          </span>
        )}
      </button>
    );
  }

  const { children, ...buttonRest } = rest as Omit<
    ButtonWithLabelProps,
    "variant" | "icon" | "href" | "className" | "iconOnly"
  >;

  const content =
    hasSlideHover && variant === "primary" ? (
      <>
        <span ref={defaultFaceRef} className={styles.defaultFace}>
          <span className={styles.faceBadge} aria-hidden="true">
            {icon}
          </span>
          <span className={styles.faceField}>
            <span className={styles.label}>{children}</span>
          </span>
        </span>
        <span
          ref={hoverFaceRef}
          className={styles.hoverFace}
          aria-hidden="true"
        >
          <span className={styles.faceField}>
            <span className={styles.label}>{children}</span>
          </span>
          <span className={styles.faceBadge}>{icon}</span>
        </span>
      </>
    ) : hasSlideHover && variant === "secondary" && icon ? (
      <>
        <span ref={defaultFaceRef} className={styles.defaultFace}>
          <span
            className={`${styles.faceBadge} ${styles.faceBadgeSecondary}`}
            aria-hidden="true"
          >
            {icon}
          </span>
          <span className={`${styles.faceField} ${styles.faceFieldSecondary}`}>
            <span className={styles.label}>{children}</span>
          </span>
        </span>
        <span
          ref={hoverFaceRef}
          className={styles.secondaryHoverFace}
          aria-hidden="true"
        >
          <span className={styles.label}>{children}</span>
          <span className={styles.iconBadge}>{icon}</span>
        </span>
      </>
    ) : hasSlideHover && variant === "secondary" ? (
      <>
        <span ref={defaultFaceRef} className={styles.secondaryDefaultFace}>
          <span className={styles.label}>{children}</span>
        </span>
        <span
          ref={hoverFaceRef}
          className={styles.secondaryHoverFace}
          aria-hidden="true"
        >
          <span className={styles.label}>{children}</span>
        </span>
      </>
    ) : (
      <>
        {icon && (
          <span className={styles.iconBadge} aria-hidden="true">
            {icon}
          </span>
        )}
        <span className={styles.label}>{children}</span>
      </>
    );

  if (href) {
    return (
      <a
        ref={(node) => {
          btnRef.current = node;
        }}
        href={href}
        className={cls}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={(node) => {
        btnRef.current = node;
      }}
      type="button"
      className={cls}
      {...buttonRest}
    >
      {content}
    </button>
  );
}
