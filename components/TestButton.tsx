/**
 * TestButton — experimental primary button, built fresh from Figma node
 * 1135:3256 ("Portfolio Cleaning" file) to evaluate against the existing
 * Button.tsx before deciding what to keep.
 *
 * Border color and text color reuse raw primitives (--color-grey-500 /
 * --color-grey-50) directly rather than new semantic tokens — deliberately
 * not tokenized yet, pending visual confirmation. Font-size (24px) and
 * line-height (24px) are likewise not yet tied to a text-scale token (no
 * existing body/label tier lands on 24px/24px).
 *
 * Border is drawn entirely by SVG (no CSS `border`) — a real CSS border and
 * a separate animated SVG stroke drifted out of alignment (different corner
 * geometry, half-pixel offset), reading as two overlapping lines. Now there
 * is exactly one path geometry per half (top+right, left+bottom), reused for
 * both the always-on grey resting stroke and the animated blue hover stroke,
 * so they're pixel-identical. Corners are true arcs matching --button-radius
 * (BUTTON_RADIUS_PX below — keep in sync if that token ever changes), not
 * straight right angles, so the stroke actually follows the button's real
 * rounded corners instead of cutting across them.
 *
 * Hover: the two blue paths' stroke-dasharray/dashoffset are set from their
 * own real getTotalLength(), then GSAP tweens dashoffset to 0 on
 * mouseenter (reverses on mouseleave) — each starts at the top-left
 * corner's arc midpoint and travels in opposite directions (one over the
 * top-right, one under the bottom-left), meeting at the bottom-right
 * corner's arc midpoint. viewBox/paths are kept in sync with the button's
 * real measured size via ResizeObserver, since the button hugs its content
 * width rather than using a fixed size. Desktop hover only for now —
 * touch/tap parity deferred.
 *
 * Once the border finishes drawing, an inset blue glow (Figma node
 * 1132:3243's settled hover state) fades in — a separate absolutely
 * positioned layer carrying the box-shadow (GSAP tweens box-shadow itself
 * unreliably), sequenced to start at DRAW_DURATION in the same timeline so
 * reversing it on mouseleave fades the glow out first, then un-draws the
 * border.
 */

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import styles from "./TestButton.module.css";

const DRAW_DURATION = 0.2;
const DRAW_EASE = "power2.out";
const DRAW_START = 0; // when the border draw begins, in timeline seconds
const GLOW_DURATION = 0.25;
const GLOW_EASE = "power2.in";
const GLOW_START = 0.0; // when the glow fade begins — lower this
// below DRAW_DURATION to have it start before the border finishes (overlap).

// Three blurred radial "glow blob" shapes behind the label (Figma node
// 1207:3262's settled hover state) — plain CSS ellipses + filter:blur(),
// not SVG (a solid ellipse + Gaussian blur is exactly what that is, no
// gradient stops needed). Each fades in on its own timing, independent of
// GLOW_*/the inset box-shadow above, and independent of each other. Sizes/
// positions are exact px conversions (root font-size 16px) of the real
// Figma Dev Mode export — not eyeballed.
const BLOB_GREY_SMALL_START = 0;
const BLOB_GREY_SMALL_DURATION = 0.3;
const BLOB_GREY_SMALL_EASE = "power2.in";
const BLOB_GREY_SMALL_OPACITY = 0.75; // the shape's own designed max alpha

const BLOB_BLUE_START = 0;
const BLOB_BLUE_DURATION = 0.15;
const BLOB_BLUE_EASE = "power2.in";
const BLOB_BLUE_OPACITY = 0.6; // the shape's own designed max alpha

const BLOB_GREY_LARGE_START = 0;
const BLOB_GREY_LARGE_DURATION = 0.15;
const BLOB_GREY_LARGE_EASE = "power2.in";
const BLOB_GREY_LARGE_OPACITY = 1; // the shape's own designed max alpha

const STROKE_WIDTH = 1;
// Mirrors --button-radius (var(--border-radius-sm), 6px) — SVG arc math
// needs a literal number, so this must be kept in sync by hand.
const BUTTON_RADIUS_PX = 6;

// Builds the two half-perimeter paths of a rounded rect, both starting at
// the top-left corner's arc midpoint (45°) and ending at the bottom-right
// corner's arc midpoint (225°) — one via top+right (clockwise), one via
// left+bottom (counter-clockwise) — so they visually meet there.
function buildHalfPaths(width: number, height: number) {
  // Inset by half the visual stroke width so the stroke centerline sits
  // exactly on the box edge, not half outside it.
  const inset = STROKE_WIDTH / 2;
  const x0 = inset;
  const y0 = inset;
  const x1 = width - inset;
  const y1 = height - inset;
  const r = Math.min(BUTTON_RADIUS_PX, (x1 - x0) / 2, (y1 - y0) / 2);

  // Arc-midpoint offset from the corner's axis-aligned tangent point
  // (r * (1 - cos45°) along each axis).
  const k = r * (1 - Math.SQRT1_2);
  const topLeftMidX = x0 + k;
  const topLeftMidY = y0 + k;
  const bottomRightMidX = x1 - k;
  const bottomRightMidY = y1 - k;

  const topRight = [
    `M${topLeftMidX},${topLeftMidY}`,
    `A${r},${r} 0 0 1 ${x0 + r},${y0}`,
    `L${x1 - r},${y0}`,
    `A${r},${r} 0 0 1 ${x1},${y0 + r}`,
    `L${x1},${y1 - r}`,
    `A${r},${r} 0 0 1 ${bottomRightMidX},${bottomRightMidY}`,
  ].join(" ");

  const bottomLeft = [
    `M${topLeftMidX},${topLeftMidY}`,
    `A${r},${r} 0 0 0 ${x0},${y0 + r}`,
    `L${x0},${y1 - r}`,
    `A${r},${r} 0 0 0 ${x0 + r},${y1}`,
    `L${x1 - r},${y1}`,
    `A${r},${r} 0 0 0 ${bottomRightMidX},${bottomRightMidY}`,
  ].join(" ");

  return { topRight, bottomLeft };
}

export interface TestButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
}

export default function TestButton({
  children,
  href,
  onClick,
}: TestButtonProps) {
  const rootRef = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const greyTopRightRef = useRef<SVGPathElement>(null);
  const greyBottomLeftRef = useRef<SVGPathElement>(null);
  const blueTopRightRef = useRef<SVGPathElement>(null);
  const blueBottomLeftRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);
  const blobGreySmallRef = useRef<HTMLSpanElement>(null);
  const blobBlueRef = useRef<HTMLSpanElement>(null);
  const blobGreyLargeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const svg = svgRef.current;
    const greyTopRight = greyTopRightRef.current;
    const greyBottomLeft = greyBottomLeftRef.current;
    const blueTopRight = blueTopRightRef.current;
    const blueBottomLeft = blueBottomLeftRef.current;
    const glow = glowRef.current;
    const blobGreySmall = blobGreySmallRef.current;
    const blobBlue = blobBlueRef.current;
    const blobGreyLarge = blobGreyLargeRef.current;
    if (
      !root ||
      !svg ||
      !greyTopRight ||
      !greyBottomLeft ||
      !blueTopRight ||
      !blueBottomLeft ||
      !glow ||
      !blobGreySmall ||
      !blobBlue ||
      !blobGreyLarge
    )
      return;

    const ctx = gsap.context(() => {
      let tl: gsap.core.Timeline | null = null;

      const layout = () => {
        // Measured off the SVG's own rendered box, not root's — root's
        // border-box is 2px larger (the 1px transparent border reserved
        // for layout) than the padding-box .border/.glow actually sit in,
        // so using root's size stretched the viewBox past the SVG's real
        // rendered size and the path didn't hug the button's true edge.
        const { width, height } = svg.getBoundingClientRect();
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

        const { topRight, bottomLeft } = buildHalfPaths(width, height);
        [greyTopRight, blueTopRight].forEach((el) =>
          el.setAttribute("d", topRight),
        );
        [greyBottomLeft, blueBottomLeft].forEach((el) =>
          el.setAttribute("d", bottomLeft),
        );

        const lengthTopRight = blueTopRight.getTotalLength();
        const lengthBottomLeft = blueBottomLeft.getTotalLength();
        gsap.set(blueTopRight, {
          strokeDasharray: lengthTopRight,
          strokeDashoffset: lengthTopRight,
        });
        gsap.set(blueBottomLeft, {
          strokeDasharray: lengthBottomLeft,
          strokeDashoffset: lengthBottomLeft,
        });

        gsap.set(glow, { opacity: 0 });
        gsap.set(blobGreySmall, { opacity: 0 });
        gsap.set(blobBlue, { opacity: 0 });
        gsap.set(blobGreyLarge, { opacity: 0 });

        tl = gsap.timeline({
          paused: true,
          defaults: { ease: DRAW_EASE, duration: DRAW_DURATION },
        });
        tl.to(
          [blueTopRight, blueBottomLeft],
          { strokeDashoffset: 0 },
          DRAW_START,
        );
        tl.to(
          glow,
          { opacity: 1, duration: GLOW_DURATION, ease: GLOW_EASE },
          GLOW_START,
        );
        tl.to(
          blobGreySmall,
          {
            opacity: BLOB_GREY_SMALL_OPACITY,
            duration: BLOB_GREY_SMALL_DURATION,
            ease: BLOB_GREY_SMALL_EASE,
          },
          BLOB_GREY_SMALL_START,
        );
        tl.to(
          blobBlue,
          {
            opacity: BLOB_BLUE_OPACITY,
            duration: BLOB_BLUE_DURATION,
            ease: BLOB_BLUE_EASE,
          },
          BLOB_BLUE_START,
        );
        tl.to(
          blobGreyLarge,
          {
            opacity: BLOB_GREY_LARGE_OPACITY,
            duration: BLOB_GREY_LARGE_DURATION,
            ease: BLOB_GREY_LARGE_EASE,
          },
          BLOB_GREY_LARGE_START,
        );
      };

      layout();

      const resizeObserver = new ResizeObserver(layout);
      resizeObserver.observe(root);

      const handleEnter = () => tl?.play();
      const handleLeave = () => tl?.reverse();
      root.addEventListener("mouseenter", handleEnter);
      root.addEventListener("mouseleave", handleLeave);

      return () => {
        resizeObserver.disconnect();
        root.removeEventListener("mouseenter", handleEnter);
        root.removeEventListener("mouseleave", handleLeave);
      };
    });

    return () => ctx.revert();
  }, []);

  const content = (
    <>
      <span
        ref={blobGreyLargeRef}
        className={styles.blobGreyLarge}
        aria-hidden="true"
      />
      <span ref={blobBlueRef} className={styles.blobBlue} aria-hidden="true" />
      <span className={styles.label}>{children}</span>
      <span ref={glowRef} className={styles.glow} aria-hidden="true" />
      <svg ref={svgRef} className={styles.border} aria-hidden="true">
        <path ref={greyTopRightRef} className={styles.borderPathGrey} />
        <path ref={greyBottomLeftRef} className={styles.borderPathGrey} />
        <path ref={blueTopRightRef} className={styles.borderPathBlue} />
        <path ref={blueBottomLeftRef} className={styles.borderPathBlue} />
      </svg>
      <span
        ref={blobGreySmallRef}
        className={styles.blobGreySmall}
        aria-hidden="true"
      />
    </>
  );

  if (href) {
    return (
      <a ref={rootRef} href={href} className={styles.button}>
        {content}
      </a>
    );
  }

  return (
    <button
      ref={rootRef}
      type="button"
      onClick={onClick}
      className={styles.button}
    >
      {content}
    </button>
  );
}
