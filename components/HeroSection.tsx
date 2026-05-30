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
 *
 * Expand mode:
 *   The expand button (bottom-right of BounceCanvas) slides headlineContainer
 *   left and fades heroBottomWrapper out, then lifts imgContainer to
 *   position:fixed and animates it to 100vw × 100vh (below the sticky nav).
 *   Same button collapses everything back to the original layout.
 */

import { useEffect, useRef, useState } from "react";
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

/* ── Expand / Collapse icons ─────────────────────────────── */
/*
 * Two-corner arrow icons communicate expand ↔ collapse.
 *
 * ExpandIcon:  brackets at the TR and BL outer corners,
 *              diagonals pointing from center → corner (outward).
 * CollapseIcon: brackets with elbows at inner positions (~10,6 and 6,10),
 *               diagonals pointing from corner → inner (inward).
 */

function ExpandIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      {/* Top-right: outer L-bracket, diagonal from inner to corner */}
      <path
        d="M10 2H14V6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="9" y1="7" x2="13.5" y2="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Bottom-left: outer L-bracket, diagonal from inner to corner */}
      <path
        d="M6 14H2V10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="7" y1="9" x2="2.5" y2="13.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CollapseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      {/* Top-right: inner L-bracket (elbow at ~10,6), diagonal from corner inward */}
      <path
        d="M10 2V6H14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="14" y1="2" x2="10" y2="6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Bottom-left: inner L-bracket (elbow at ~6,10), diagonal from corner inward */}
      <path
        d="M6 14V10H2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="2" y1="14" x2="6" y2="10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
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
  const headlineRef   = useRef<HTMLHeadingElement>(null);
  const sublineRef    = useRef<HTMLParagraphElement>(null);
  const heroRef       = useRef<HTMLElement>(null);
  const heroBottomRef = useRef<HTMLDivElement>(null);

  /* expand refs */
  const headlineContainerRef = useRef<HTMLDivElement>(null);
  const imgContainerRef      = useRef<HTMLDivElement>(null);
  const expandedRef          = useRef(false);
  const savedRectRef         = useRef<DOMRect | null>(null);

  const [expanded, setExpanded] = useState(false);

  /* ── Expand / Collapse handler ───────────────────────────── */
  const handleExpand = () => {
    const imgEl    = imgContainerRef.current;
    const headEl   = headlineContainerRef.current;
    const bottomEl = heroBottomRef.current;
    if (!imgEl || !headEl || !bottomEl) return;

    // Stop any in-progress tween on these targets before starting
    gsap.killTweensOf([imgEl, headEl, bottomEl]);

    if (!expandedRef.current) {
      /* ── EXPAND ──────────────────────────────────────────── */

      // Stage 1: snapshot imgContainer's natural viewport position
      const rect = imgEl.getBoundingClientRect();
      savedRectRef.current = rect;

      // Stage 2: lift to fixed at the exact same position — zero visual jump
      gsap.set(imgEl, {
        position: "fixed",
        top:      rect.top,
        left:     rect.left,
        width:    rect.width,
        height:   rect.height,
        zIndex:   99, // below nav (z-index: 100) per --z-nav token
        margin:   0,
      });

      // Stage 3: animate everything out, then canvas to full viewport
      gsap.timeline()
        // headlineContainer exits left — clipped by hero's overflow-x: clip
        .to(headEl,   { x: "-110%", opacity: 0, duration: 0.42, ease: "power2.inOut" }, 0)
        // bottom blue card fades and drifts down
        .to(bottomEl, { opacity: 0, y: 20, duration: 0.3, ease: "power2.in",
                        onComplete: () => { bottomEl.style.pointerEvents = "none"; } }, 0)
        // canvas expands to full viewport (slightly delayed for sequencing)
        .to(imgEl,    { top: 0, left: 0, width: "100vw", height: "100vh",
                        duration: 0.58, ease: "power2.inOut" }, 0.12);

      expandedRef.current = true;
      setExpanded(true);

    } else {
      /* ── COLLAPSE ────────────────────────────────────────── */

      const rect = savedRectRef.current!;

      gsap.timeline({
        onComplete() {
          // Snap imgContainer back into normal document flow
          gsap.set(imgEl, { clearProps: "position,top,left,width,height,zIndex,margin" });
        },
      })
        // Canvas shrinks back to its natural rect
        .to(imgEl,    { top: rect.top, left: rect.left,
                        width: rect.width, height: rect.height,
                        duration: 0.52, ease: "power2.inOut" }, 0)
        // headlineContainer slides back in from the left
        .to(headEl,   { x: "0%", opacity: 1, duration: 0.42, ease: "power2.out" }, 0.2)
        // bottom blue card fades back in
        .to(bottomEl, { opacity: 1, y: 0, duration: 0.38, ease: "power2.out",
                        onStart: () => { bottomEl.style.pointerEvents = ""; } }, 0.22);

      expandedRef.current = false;
      setExpanded(false);
    }
  };

  /* ── Entrance animation ──────────────────────────────────── */
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

    const xOffset = leftRect.left - rightRect.left;

    const sweepDistance = Math.abs(xOffset);
    const starRadius    = (rightRect.width / 2) || 16;

    const phase1End      = 180;
    const rawTotal       = phase1End + (sweepDistance / (2 * Math.PI * starRadius)) * 360;
    const finalRotation  = Math.ceil(rawTotal / 360) * 360;
    const phase2Rotation = finalRotation - phase1End;

    /* ── Resolve color tokens ── */
    const yellowColor  = resolveColor("--color-yellow-500");
    const displayColor = resolveColor("--text-display");

    /* ── Timing tokens ── */
    const dur   = readMs("--motion-duration-nav-items");
    const delay = readMs("--motion-delay-nav-items");

    /* ── Headline / subline lines ── */
    const headlineLines = Array.from(
      headlineEl.querySelectorAll<HTMLSpanElement>(`.${styles.headlineLine}`),
    );
    const sublineLines = Array.from(
      sublineEl.querySelectorAll<HTMLSpanElement>(`.${styles.sublineLine}`),
    );

    /* ── Bottom content target height (50% of hero) ── */
    const targetHeight = heroEl.offsetHeight / 2;

    const ctx = gsap.context(() => {

      /* ── Initial states ── */
      gsap.set([leftStarEl, rightStarEl], {
        scale: 0,
        rotation: 0,
        color: yellowColor,
      });
      gsap.set(rightStarEl, { x: xOffset });

      gsap.set(roleTextEl, {
        clipPath: "inset(0 100% 0 0)",
        color: yellowColor,
      });
      gsap.set(headlineLines, { opacity: 0, y: 16 });
      gsap.set(sublineLines,  { opacity: 0, y: 16 });
      gsap.set(heroBottomEl,  { height: 0, overflow: "hidden" });

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
        "+=0.15",
      );

      // 2b — text clip travels in sync with the rolling star
      tl.to(
        roleTextEl,
        { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "power2.inOut" },
        "<",
      );

      // 3 — color transition: yellow-500 → text-display
      tl.to(
        [leftStarEl, rightStarEl, roleTextEl],
        { color: displayColor, duration: 0.5, ease: "power2.inOut" },
        ">",
      );

      // 4 — headline lines
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
        <div ref={headlineContainerRef} className={styles.headlineContainer}>

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

        {/* imgContainer — BounceCanvas + expand button */}
        <div ref={imgContainerRef} className={styles.imgContainer}>
          <BounceCanvas />
          <button
            className={styles.expandBtn}
            onClick={handleExpand}
            aria-label={expanded ? "Collapse canvas" : "Expand canvas"}
            type="button"
          >
            {expanded ? <CollapseIcon /> : <ExpandIcon />}
          </button>
        </div>

      </div>

      {/* ── Bottom content: animation wrapper + blue card ── */}
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
