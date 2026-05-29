"use client";

/**
 * HeroSection — home page hero
 *
 * Built from Figma node 281:123 (Claude-Code file).
 *
 * Text entrance (GSAP) — master timeline:
 *   1. Role row   — both stars scale in (rotating CW) at far-left origin.
 *                   Right star rolls CW to its resting position, ending upright
 *                   (rotation snapped to nearest 360° multiple), while a
 *                   travelling clip-path reveals "PRODUCT DESIGNER".
 *                   Stars + text animate in yellow-500, then transition to
 *                   text-display color once the reveal is complete.
 *   2. Headline   — 3 lines fade up sequentially.
 *   3. Subline    — 3 lines fade up sequentially.
 *
 * Image area:
 *   BounceCanvas — DVD-screensaver SVG toy (happyAgents.svg)
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Button from "./Button";
import BounceCanvas from "./BounceCanvas";
import styles from "./HeroSection.module.css";

/* ── helpers ─────────────────────────────────────────────── */

const readMs = (prop: string): number => {
  if (typeof window === "undefined") return 0;
  return (
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(prop),
    ) / 1000
  );
};

/**
 * Resolves a CSS custom property (e.g. "--color-yellow-500") to a concrete
 * rgb() string that GSAP's CSSPlugin can interpolate between. Works even
 * when the var() chains through other custom properties.
 */
const resolveColor = (varName: string): string => {
  const el = document.createElement("span");
  el.style.cssText = `color:var(${varName});position:absolute;visibility:hidden`;
  document.body.appendChild(el);
  const color = getComputedStyle(el).color;
  document.body.removeChild(el);
  return color;
};

/* ── Inline star SVG ─────────────────────────────────────── */
/*
 * Rendered inline so CSS `color` (set by GSAP) propagates to
 * fill="currentColor" on both paths — enabling the yellow → display
 * color transition without needing filters or multiple SVG files.
 * opacity="0.4" on the circle keeps a subtle inner depth at any color.
 */

interface StarProps {
  svgRef: React.Ref<SVGSVGElement>;
  className?: string;
}

function Star({ svgRef, className }: StarProps) {
  return (
    <svg
      ref={svgRef}
      className={className}
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16.0007 0.000244141L21.334 10.6669L32.0007 16.0002L21.334 21.3336L16.0007 32.0002L10.6673 21.3336L0.000671387 16.0002L10.6673 10.6669L16.0007 0.000244141Z"
        fill="currentColor"
      />
      <circle
        cx="16.2028"
        cy="15.9997"
        r="5.33333"
        fill="currentColor"
        opacity="0.4"
      />
    </svg>
  );
}

/* ── Component ───────────────────────────────────────────── */

export default function HeroSection() {
  /* role row refs */
  const roleRef      = useRef<HTMLDivElement>(null);
  const leftStarRef  = useRef<SVGSVGElement>(null);
  const rightStarRef = useRef<SVGSVGElement>(null);
  const roleTextRef  = useRef<HTMLSpanElement>(null);

  /* headline / subline refs */
  const headlineRef    = useRef<HTMLHeadingElement>(null);
  const sublineRef     = useRef<HTMLParagraphElement>(null);
  const heroRef        = useRef<HTMLElement>(null);
  const heroBottomRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const leftStarEl   = leftStarRef.current;
    const rightStarEl  = rightStarRef.current;
    const roleTextEl   = roleTextRef.current;
    const headlineEl   = headlineRef.current;
    const sublineEl    = sublineRef.current;
    const heroEl       = heroRef.current;
    const heroBottomEl = heroBottomRef.current;

    if (
      !leftStarEl || !rightStarEl || !roleTextEl ||
      !headlineEl || !sublineEl || !heroEl || !heroBottomEl
    ) return;

    /* ── Measure before any GSAP transforms ── */
    const leftRect  = leftStarEl.getBoundingClientRect();
    const rightRect = rightStarEl.getBoundingClientRect();

    // Negative offset: how far left the right star must shift to overlap the left star.
    const xOffset = leftRect.left - rightRect.left;

    // Rolling rotation — physically accurate arc-length formula.
    const sweepDistance = Math.abs(xOffset);
    const starRadius    = (rightRect.width / 2) || 16; // 16 px fallback

    // Phase 1 ends at 180°. Snap the grand total to the next full 360° multiple
    // so the right star always finishes upright.
    const phase1End      = 180;
    const rawTotal       = phase1End + (sweepDistance / (2 * Math.PI * starRadius)) * 360;
    const finalRotation  = Math.ceil(rawTotal / 360) * 360;
    const phase2Rotation = finalRotation - phase1End; // relative increment for tl.to

    /* ── Resolve color tokens to concrete rgb() values ── */
    const yellowColor  = resolveColor("--color-yellow-500");
    const displayColor = resolveColor("--text-display");

    /* ── Timing tokens ── */
    const dur   = readMs("--motion-duration-nav-items"); // 0.5 s
    const delay = readMs("--motion-delay-nav-items");    // 0.25 s

    /* ── Headline / subline lines ── */
    const headlineLines = Array.from(
      headlineEl.querySelectorAll<HTMLSpanElement>(`.${styles.headlineLine}`),
    );
    const sublineLines = Array.from(
      sublineEl.querySelectorAll<HTMLSpanElement>(`.${styles.sublineLine}`),
    );

    /* ── Bottom content target height (50% of hero) ── */
    const targetHeight = heroEl.offsetHeight / 2;

    /*
     * gsap.context() scopes every tween created inside.
     * ctx.revert() (cleanup) kills them and removes all inline styles —
     * critical for React Strict Mode's mount → unmount → remount cycle.
     */
    const ctx = gsap.context(() => {

      /* ── Initial states ── */
      gsap.set([leftStarEl, rightStarEl], {
        scale: 0,
        rotation: 0,
        color: yellowColor,
      });
      // Right star starts at the left star's position (overlapping it)
      gsap.set(rightStarEl, { x: xOffset });

      gsap.set(roleTextEl, {
        clipPath: "inset(0 100% 0 0)",
        color: yellowColor,
      });
      gsap.set(headlineLines, { opacity: 0, y: 16 });
      gsap.set(sublineLines, { opacity: 0, y: 16 });
      gsap.set(heroBottomEl, { height: 0, overflow: "hidden" });

      /* ── Master timeline ── */
      const tl = gsap.timeline({ delay });

      // 1 — both stars scale in, rotating clockwise
      tl.to(
        [leftStarEl, rightStarEl],
        { scale: 1, rotation: phase1End, duration: 0.5, ease: "power2.out" },
      );

      // 2a — right star rolls to resting position, finishing upright
      tl.to(
        rightStarEl,
        {
          x: 0,
          rotation: `+=${phase2Rotation}`,
          duration: 0.7,
          ease: "power2.inOut",
        },
        "+=0.15", // slight pause after scale-in
      );

      // 2b — text clip travels in sync with the rolling star
      tl.to(
        roleTextEl,
        { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "power2.inOut" },
        "<", // same start as 2a
      );

      // 3 — color transition: yellow-500 → text-display (starts immediately after reveal)
      tl.to(
        [leftStarEl, rightStarEl, roleTextEl],
        { color: displayColor, duration: 0.5, ease: "power2.inOut" },
        ">",
      );

      // 4 — headline lines (slight gap after color settles)
      headlineLines.forEach((line, i) => {
        tl.to(
          line,
          { opacity: 1, y: 0, duration: dur, ease: "power2.out" },
          i === 0 ? "+=0.1" : `>-${(dur * 0.35).toFixed(3)}`,
        );
      });

      // 5 — bottom content expands from 0 to 50% of hero height
      tl.to(
        heroBottomEl,
        { height: targetHeight, duration: 0.6, ease: "power2.inOut" },
        "+=0.15",
      );

      // 6 — subline lines fade up after expansion
      sublineLines.forEach((line, i) => {
        tl.to(
          line,
          { opacity: 1, y: 0, duration: dur, ease: "power2.out" },
          i === 0 ? ">" : `>-${(dur * 0.35).toFixed(3)}`,
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className={styles.hero} aria-label="Hero">
      {/* ── Top content: headline container + bounce toy ─── */}
      <div className={styles.heroTopContent}>

        {/* headlineContainer: role row above + h1 below */}
        <div className={styles.headlineContainer}>

          {/* Role row — star · PRODUCT DESIGNER · star */}
          <div ref={roleRef} className={styles.role}>
            <Star svgRef={leftStarRef}  className={styles.roleStar} />
            <span ref={roleTextRef} className={styles.roleText}>
              Product Designer
            </span>
            <Star svgRef={rightStarRef} className={styles.roleStar} />
          </div>

          {/* Headline */}
          <h1 ref={headlineRef} className={styles.headline}>
            <span className={styles.headlineLine}>Specializing</span>
            <span className={styles.headlineLine}>
              in <span className={styles.headlineAccent}>Data-rich</span>
            </span>
            <span className={styles.headlineLine}>Environments.</span>
          </h1>

        </div>

        <div className={styles.imgContainer}>
          <BounceCanvas />
        </div>
      </div>

      {/* ── Bottom content: animation wrapper + blue card ────── */}
      <div ref={heroBottomRef} className={styles.heroBottomWrapper}>
        <div className={styles.heroBottomContent}>
          <div className={styles.buttonGroup}>
            <Button variant="primary" href="mailto:edgar.sanchez9215@gmail.com">
              Let&apos;s Chat
            </Button>
            <Button variant="secondary" href="/#work">
              Work
            </Button>
          </div>

          <p ref={sublineRef} className={styles.heroSubline}>
            <span className={styles.sublineLine}>Driving</span>
            <span className={styles.sublineLine}>
              <span className={styles.sublineHighlight}>High-Stakes</span>
            </span>
            <span className={styles.sublineLine}>Decisions.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
