/**
 * Button — global button component
 *
 * Variants: primary | secondary | outline | link | text
 * Tokens: --button-*, --state-* (styles/globals.css)
 *
 * outline/link variants have no Figma source yet — the type/class exist,
 * but no color tokens are defined for them (TODO, see built-components.md).
 * text variant (bare/ghost, e.g. Nav's MENU trigger) built from Figma node
 * 572:1787 ("Portfolio Cleaning" file).
 * size: large (--control-height-large 64px) | medium (default, --control-height-medium
 * 48px) | m (40px) | small (--control-height-l 32px, e.g. Nav's MENU trigger).
 * Full 4-size scale + per-size icon/label/padding values sourced from the
 * button-set Figma node (789:912, "Portfolio Cleaning" file).
 *
 * Every variant (primary, secondary, text) always renders as two full,
 * absolutely-stacked "faces" that slide horizontally on hover: default face
 * exits right, hover face enters from the left, both moving together (a
 * "push"). Reverses smoothly on mouse leave via the same timeline played
 * backwards. outline/link fall back to a single static layout (no Figma
 * hover source yet).
 *
 * Primary + icon + labeled buttons (e.g. Hero's WORK) split each face into
 * a badge (icon) + field (label) — default face: badge left, dark label
 * field right; hover face: solid blue, label left / icon right, layout
 * fully reversed. Figma: 384:8384 (default) / 384:8373 (hover), "Portfolio
 * Cleaning" file. Primary buttons with no icon (e.g. About's "Contact Me")
 * use a flat centered face instead — no badge/field split, just a
 * differently-colored label carried across both faces.
 *
 * Secondary label-only buttons (e.g. Hero's Contact) use the same two-face
 * push mechanic with a flat fill — the fill/label color just carries across
 * faces. Secondary + icon buttons (e.g. the Work card's "View Build") get
 * their own badge/field split default face instead, mirroring primary's
 * structure but recolored (light badge, dark field) per Figma node 641:7270
 * ("Portfolio Cleaning" file); the hover face falls back to secondary's
 * existing flat fill (no Figma hover mock to diverge from).
 *
 * Text buttons (e.g. Nav's MENU trigger) use the same flat centered face
 * as primary/secondary's no-icon case — no Figma hover source, colors
 * chosen to match the variant's existing default/hover text tiers.
 */

"use client";

import { ButtonHTMLAttributes, ReactNode, useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./Button.module.css";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "link"
  | "text"
  | "menu"
  | "ghost";
export type ButtonSize = "large" | "medium" | "m" | "small";

type ButtonBaseProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Renders the button as an <a> tag */
  href?: string;
};

export type ButtonProps = ButtonBaseProps & {
  icon?: ReactNode;
  /** Optional for variant="ghost" (icon-only, no visible label) — pass
   *  aria-label instead for its accessible name. Required for every other
   *  variant. */
  children?: ReactNode;
};

// TIMING is a live-tweak surface for the slide hover only — edit and save
// to see changes via Fast Refresh. Desktop (mouse) and touch get separate
// durations: touch's press/release addition this session reused desktop's
// value, which read as a change to desktop's own hover speed — desktop is
// restored to its original 0.185s, touch keeps the 0.08s it shipped with.
const TIMING = {
  slideDuration: 0.185,
  slideEase: "power2.inOut",
  touchSlideDuration: 0.08,
  touchSlideEase: "power2.inOut",
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
    variant === "primary" ||
    variant === "secondary" ||
    variant === "text" ||
    variant === "menu";

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

      // tl.duration(x) rescales the whole timeline (via timeScale) to run
      // in exactly x seconds, so mouse and touch can share one timeline/
      // tween-set but still play at their own independent speeds.
      const onMouseEnter = () => tl.duration(TIMING.slideDuration).play();
      const onMouseLeave = () => tl.duration(TIMING.slideDuration).reverse();
      btnEl.addEventListener("mouseenter", onMouseEnter);
      btnEl.addEventListener("mouseleave", onMouseLeave);
      // Touch has no hover state — mirror it with press/release so the
      // slide is still visible on mobile. touchcancel covers an interrupted
      // touch (scroll takeover, OS gesture, finger dragged off the button)
      // so the hover face can't get stuck in its pressed state.
      const onTouchStart = () => tl.duration(TIMING.touchSlideDuration).play();
      const onTouchEnd = () => tl.duration(TIMING.touchSlideDuration).reverse();
      btnEl.addEventListener("touchstart", onTouchStart, { passive: true });
      btnEl.addEventListener("touchend", onTouchEnd);
      btnEl.addEventListener("touchcancel", onTouchEnd);

      return () => {
        btnEl.removeEventListener("mouseenter", onMouseEnter);
        btnEl.removeEventListener("mouseleave", onMouseLeave);
        btnEl.removeEventListener("touchstart", onTouchStart);
        btnEl.removeEventListener("touchend", onTouchEnd);
        btnEl.removeEventListener("touchcancel", onTouchEnd);
      };
    }, btnEl);

    return () => ctx.revert();
  }, [hasSlideHover]);

  const cls = [
    styles.btn,
    styles[variant],
    styles[size],
    icon && !hasSlideHover && variant !== "ghost" ? styles.hasIcon : null,
    hasSlideHover ? styles.hasSlideHover : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const { children, ...buttonRest } = rest as Omit<
    ButtonProps,
    "variant" | "icon" | "href" | "className"
  >;

  const content =
    hasSlideHover && variant === "primary" && icon ? (
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
    ) : hasSlideHover && variant === "primary" ? (
      <>
        <span ref={defaultFaceRef} className={styles.primaryFlatDefaultFace}>
          <span className={styles.label}>{children}</span>
        </span>
        <span
          ref={hoverFaceRef}
          className={styles.primaryFlatHoverFace}
          aria-hidden="true"
        >
          <span className={styles.label}>{children}</span>
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
    ) : hasSlideHover && variant === "text" ? (
      <>
        <span ref={defaultFaceRef} className={styles.textDefaultFace}>
          <span className={styles.label}>{children}</span>
        </span>
        <span
          ref={hoverFaceRef}
          className={styles.textHoverFace}
          aria-hidden="true"
        >
          <span className={styles.label}>{children}</span>
        </span>
      </>
    ) : hasSlideHover && variant === "menu" ? (
      <>
        <span ref={defaultFaceRef} className={styles.menuDefaultFace}>
          <span className={styles.label}>{children}</span>
        </span>
        <span
          ref={hoverFaceRef}
          className={styles.menuHoverFace}
          aria-hidden="true"
        >
          <span className={styles.label}>{children}</span>
          <span className={styles.iconBadge}>{icon}</span>
        </span>
      </>
    ) : variant === "ghost" ? (
      <span className={styles.ghostIcon} aria-hidden="true">
        {icon}
      </span>
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
