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

import { useEffect, useRef, useState, type RefObject, type MutableRefObject } from "react";
import gsap from "gsap";
import Button from "./Button";
import styles from "./HeroSection.module.css";

/* ── mergeRefs — attaches multiple refs to one DOM node ─────── */
type AnyRef<T> = RefObject<T> | ((node: T | null) => void) | null | undefined;
const mergeRefs =
  <T,>(...refs: AnyRef<T>[]) =>
  (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else (ref as MutableRefObject<T | null>).current = node;
    }
  };

/* ── expand / collapse timing ────────────────────────────── */
const EXPAND_ANIM = {
  charDuration:  0.6,   // s — each char's roll duration
  charStagger:   0.04,  // s — stagger between chars within a line
  lineDelay:     0.18,  // s — delay before each successive line starts
};

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
        x1="9"
        y1="7"
        x2="13.5"
        y2="2.5"
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
        x1="7"
        y1="9"
        x2="2.5"
        y2="13.5"
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
        x1="14"
        y1="2"
        x2="10"
        y2="6"
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
        x1="2"
        y1="14"
        x2="6"
        y2="10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Component ───────────────────────────────────────────── */

/* ── props ───────────────────────────────────────────────────── */
interface HeroSectionProps {
  /** Attached to headlineContainer — BounceCanvas uses this as a text exclusion zone. */
  headlineZoneRef?:    RefObject<HTMLDivElement>;
  /** Attached to the button group — BounceCanvas keeps a gap from this zone. */
  buttonGroupZoneRef?: RefObject<HTMLDivElement>;
  /** Attached to the subline paragraph — BounceCanvas uses this as a text exclusion zone. */
  sublineZoneRef?:     RefObject<HTMLParagraphElement>;
  /** Attached to the hero section — defines the spawn zone for BounceCanvas falling shapes. */
  heroZoneRef?:        RefObject<HTMLElement>;
  /** Attached to imgContainer — defines the active firing zone for BounceCanvas. */
  imgZoneRef?:         RefObject<HTMLDivElement>;
  /** Attached to heroTopContent — BounceCanvas uses height to size the big villain. */
  heroTopContentRef?:  RefObject<HTMLDivElement>;
}

export default function HeroSection({
  headlineZoneRef,
  buttonGroupZoneRef,
  sublineZoneRef,
  heroZoneRef,
  imgZoneRef,
  heroTopContentRef,
}: HeroSectionProps = {}) {
  /* role row refs */
  const roleRef = useRef<HTMLDivElement>(null);
  const leftStarRef = useRef<SVGSVGElement>(null);
  const rightStarRef = useRef<SVGSVGElement>(null);
  const roleTextRef = useRef<HTMLSpanElement>(null);

  /* headline / subline refs */
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const sublineRef = useRef<HTMLParagraphElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroBottomRef = useRef<HTMLDivElement>(null);

  /* expand refs */
  const headlineContainerRef = useRef<HTMLDivElement>(null);
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef(false);
  /** Concrete px height of heroBottomWrapper snapshotted on expand — used to restore on collapse. */
  const bottomHeightRef = useRef<number>(0);

  /**
   * headlineCharsByLineRef — populated by the char-wrapping effect below.
   * Index 0/1/2 = line 1/2/3. Each array holds the per-char spans in DOM order.
   * Line 2 includes chars from both the plain text prefix and headlineAccent.
   * Used by the expand/collapse timeline (2b) to drive wheel-roll animations.
   */
  const headlineCharsByLineRef = useRef<HTMLSpanElement[][]>([]);

  const [expanded, setExpanded] = useState(false);

  /* ── Expand / Collapse handler ───────────────────────────── */
  const handleExpand = () => {
    const charsByLine = headlineCharsByLineRef.current;
    const roleEl      = roleRef.current;
    const bottomEl    = heroBottomRef.current;
    if (charsByLine.length === 0 || !roleEl || !bottomEl) return;

    const allChars = charsByLine.flat();
    gsap.killTweensOf([...allChars, roleEl, bottomEl]);

    if (!expandedRef.current) {
      /* ── EXPAND ──────────────────────────────────────────────
       *
       * Three things happen in parallel from t=0:
       *   1. Role row fades up and out (opacity→0, y→-16px)
       *   2. heroBottomWrapper collapses (height px → 0)
       *      GSAP can't tween from "auto" — snapshot concrete px first,
       *      then lock it with gsap.set before tweening.
       *   3. Headline chars roll CCW off the left edge, line by line.
       *      Wheel-roll constraint:
       *        rotation (deg) = -(exitDist / radius) × (180/π)
       *        exitDist = rect.left + rect.width + 20px
       *        radius   = rect.height / 2
       *      Function-based values evaluated at tween init (lazy),
       *      before any char moves — natural layout positions. ✓
       * ───────────────────────────────────────────────────────── */

      // Snapshot and lock heroBottomWrapper height before tweening
      const bottomH = bottomEl.getBoundingClientRect().height;
      bottomHeightRef.current = bottomH;
      gsap.set(bottomEl, { height: bottomH });

      const tl = gsap.timeline({
        onComplete: () => { expandedRef.current = true; setExpanded(true); },
      });

      // 1 — role row fades up
      tl.to(roleEl, {
        opacity: 0,
        y: -16,
        duration: 0.4,
        ease: "power2.in",
      }, 0);

      // 2 — bottom wrapper collapses
      tl.to(bottomEl, {
        height: 0,
        duration: 0.55,
        ease: "power2.inOut",
      }, 0);

      // 3 — headline chars roll CCW off screen, line by line
      charsByLine.forEach((lineChars, lineIdx) => {
        tl.to(
          lineChars,
          {
            x: (_i, el) => {
              const r = (el as HTMLElement).getBoundingClientRect();
              return -(r.left + r.width + 20);
            },
            rotation: (_i, el) => {
              const r = (el as HTMLElement).getBoundingClientRect();
              const exitDist = r.left + r.width + 20;
              const radius   = r.height / 2 || 1;
              return -(exitDist / radius) * (180 / Math.PI);
            },
            duration: EXPAND_ANIM.charDuration,
            stagger:  EXPAND_ANIM.charStagger,
            ease:     "power2.in",
          },
          lineIdx * EXPAND_ANIM.lineDelay,
        );
      });

    } else {
      /* ── COLLAPSE ────────────────────────────────────────────
       *
       * Reverses expand in parallel from t=0:
       *   1. heroBottomWrapper rises (height: 0 → saved px).
       *      clearProps:"height" on complete so it adapts to resizes.
       *   2. Headline chars roll CW back in, left-to-right stagger.
       *   3. Role row fades back in, slightly delayed so it
       *      appears as the space is already being reclaimed.
       * ───────────────────────────────────────────────────────── */

      const tl = gsap.timeline({
        onComplete: () => { expandedRef.current = false; setExpanded(false); },
      });

      // 1 — bottom wrapper rises
      tl.to(bottomEl, {
        height: bottomHeightRef.current,
        duration: 0.55,
        ease: "power2.inOut",
        onComplete: () => gsap.set(bottomEl, { clearProps: "height" }),
      }, 0);

      // 2 — chars roll CW back in, left-to-right cascade
      charsByLine.forEach((lineChars, lineIdx) => {
        tl.to(
          lineChars,
          {
            x: 0,
            rotation: 0,
            duration: EXPAND_ANIM.charDuration,
            stagger: { each: EXPAND_ANIM.charStagger, from: "start" },
            ease: "power2.out",
          },
          lineIdx * EXPAND_ANIM.lineDelay,
        );
      });

      // 3 — role row fades back in after chars have started returning
      tl.to(roleEl, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out",
      }, 0.3);
    }
  };

  /* ── 2a: Char wrapping ───────────────────────────────────────
   * Runs before the entrance animation effect (effects fire in
   * declaration order with the same [] dep).
   *
   * For each headlineLine:
   *   - Text nodes   → one span.headlineChar per character
   *   - Element nodes (headlineAccent) → wrapper kept intact,
   *     its text content split into span.headlineChar children
   *
   * Spaces are preserved via white-space:pre on .headlineChar.
   * Results stored in headlineCharsByLineRef[line][charIndex].
   * ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    const headlineEl = headlineRef.current;
    if (!headlineEl) return;

    const lines = Array.from(
      headlineEl.querySelectorAll<HTMLSpanElement>(`.${styles.headlineLine}`),
    );

    const charsByLine: HTMLSpanElement[][] = [];

    for (const line of lines) {
      const lineChars: HTMLSpanElement[] = [];
      // Snapshot children before clearing — we'll re-attach element nodes
      const savedChildren = Array.from(line.childNodes);
      line.innerHTML = "";

      for (const node of savedChildren) {
        if (node.nodeType === Node.TEXT_NODE) {
          // Plain text — one span per character
          for (const char of node.textContent ?? "") {
            const span = document.createElement("span");
            span.className = styles.headlineChar;
            span.textContent = char;
            line.appendChild(span);
            lineChars.push(span);
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // Wrapper element (e.g. headlineAccent) — keep it, split its text
          const wrapper = node as HTMLElement;
          const innerText = wrapper.textContent ?? "";
          wrapper.textContent = "";
          for (const char of innerText) {
            const span = document.createElement("span");
            span.className = styles.headlineChar;
            span.textContent = char;
            wrapper.appendChild(span);
            lineChars.push(span);
          }
          line.appendChild(wrapper);
        }
      }

      charsByLine.push(lineChars);
    }

    headlineCharsByLineRef.current = charsByLine;
  }, []);

  /* ── Entrance animation ──────────────────────────────────── */
  useEffect(() => {
    const leftStarEl = leftStarRef.current;
    const rightStarEl = rightStarRef.current;
    const roleTextEl = roleTextRef.current;
    const headlineEl = headlineRef.current;
    const sublineEl = sublineRef.current;
    const heroEl = heroRef.current;
    const heroBottomEl = heroBottomRef.current;

    if (
      !leftStarEl ||
      !rightStarEl ||
      !roleTextEl ||
      !headlineEl ||
      !sublineEl ||
      !heroEl ||
      !heroBottomEl
    )
      return;

    /* ── Measure before any GSAP transforms ── */
    const leftRect = leftStarEl.getBoundingClientRect();
    const rightRect = rightStarEl.getBoundingClientRect();

    const xOffset = leftRect.left - rightRect.left;

    const sweepDistance = Math.abs(xOffset);
    const starRadius = rightRect.width / 2 || 16;

    const phase1End = 180;
    const rawTotal =
      phase1End + (sweepDistance / (2 * Math.PI * starRadius)) * 360;
    const finalRotation = Math.ceil(rawTotal / 360) * 360;
    const phase2Rotation = finalRotation - phase1End;

    /* ── Resolve color tokens ── */
    const yellowColor = resolveColor("--color-yellow-500");
    const displayColor = resolveColor("--text-primary");

    /* ── Timing tokens ── */
    const dur = readMs("--motion-duration-nav-items");
    const delay = readMs("--motion-delay-nav-items");

    /* ── Headline / subline lines ── */
    const headlineLines = Array.from(
      headlineEl.querySelectorAll<HTMLSpanElement>(`.${styles.headlineLine}`),
    );
    const sublineLines = Array.from(
      sublineEl.querySelectorAll<HTMLSpanElement>(`.${styles.sublineLine}`),
    );

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
      gsap.set(sublineLines, { opacity: 0, y: 16 });
      gsap.set(heroBottomEl, { height: 0, overflow: "hidden" });

      /* ── Master timeline ── */
      const tl = gsap.timeline({ delay });

      // 1 — both stars scale in, rotating clockwise
      tl.to([leftStarEl, rightStarEl], {
        scale: 1,
        rotation: phase1End,
        duration: 0.5,
        ease: "power2.out",
      });

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
        { height: "auto", duration: 0.6, ease: "power2.inOut" },
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
    <section ref={mergeRefs(heroRef, heroZoneRef)} className={styles.hero} aria-label="Hero">
      {/* ── Top content: headline container + bounce toy ─── */}
      <div ref={heroTopContentRef} className={styles.heroTopContent}>
        {/* headlineContainer: role row above + h1 below */}
        <div ref={mergeRefs(headlineContainerRef, headlineZoneRef)} className={styles.headlineContainer}>
          {/* Role row — star · PRODUCT DESIGNER · star */}
          <div ref={roleRef} className={styles.role}>
            <Star svgRef={leftStarRef} className={styles.roleStar} />
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

        {/* imgContainer — expand button (BounceCanvas is now a full-page layer in page.tsx) */}
        <div ref={mergeRefs(imgContainerRef, imgZoneRef)} className={styles.imgContainer}>
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
          <div ref={buttonGroupZoneRef} className={styles.buttonGroup}>
            <Button variant="primary" href="mailto:edgar.sanchez9215@gmail.com">
              Let&apos;s Chat
            </Button>
            <Button variant="secondary" href="/#work">
              Work
            </Button>
          </div>

          <p ref={mergeRefs(sublineRef, sublineZoneRef)} className={styles.heroSubline}>
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
