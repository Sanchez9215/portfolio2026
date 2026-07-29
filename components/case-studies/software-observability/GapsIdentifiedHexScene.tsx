"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./GapsIdentifiedHexScene.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * "With gaps identified…" — the intro to the All Software View, rebuilt from
 * a centered LabelBlock into a freeform hexagon honeycomb (Figma node
 * 1472:4207). A sticky 100vh stage holds the field while a scrubbed timeline
 * fades the hexagons in one-by-one; then it releases into All Software View.
 *
 * Mechanism: `position:sticky` stage inside a tall (100vh + RUNWAY) track —
 * NOT GSAP pin. Same sticky-stage convention as every other scroll scene in
 * this case study (TheProblemPinnedScene / DataScrollController /
 * FrameworkScene).
 *
 * Geometry is Figma's exact design coordinates (a 1440×900 field, origin at
 * the section's top-left). The field is scaled to the stage width so the
 * honeycomb keeps its proportions; the top row sits flush against the
 * stage's own 128px top padding (`.stage` in the CSS module).
 *
 * Reveal order (top → down the left/center → out to the right) is the
 * `order` field below; opacity-only fade (the design brief is "fade in").
 */

// Field design dimensions (Figma section frame), 1 unit = 1px.
const FIELD_W = 1440;
const FIELD_H = 900;

// Pointy-top regular hexagon inscribed in a 360-tall box: width = 360·√3/2.
// Matches Figma's 24px horizontal inset each side of the 360 frame.
const HEX_W = 311.77;
const HEX_H = 360;
// Shared pointy-top hexagon geometry — clip-path (filled) and <polygon>
// (outline) use the exact same points so both variants are identical.
const HEX_POLYGON_POINTS = "155.885,0 311.77,90 311.77,270 155.885,360 0,270 0,90";

// Dashed outline spec — matches this case study's established dashed
// convention (FrameworkScene / insights): 1px, "6 4". non-scaling-stroke
// (set on the element) keeps it crisp regardless of the field's scale.
const STROKE_DASH = "6 4";

// Hexagons tessellate flush at HEX_W/HEX_H; the design calls for an even
// 16px gap between every neighbor (left/right, and both diagonal pairs). A
// regular hexagon's 6 edges are all one apothem (= HEX_W/2) from center, so
// scaling each shape toward its center by this factor insets every edge
// HEX_GAP/2, yielding a uniform HEX_GAP gap on all 6 sides at once. Only the
// shape layer scales — text stays full size.
const HEX_GAP = 16;
const HEX_SHAPE_SCALE = 1 - HEX_GAP / 2 / (HEX_W / 2);

// Reveal choreography, in scroll px (the timeline scrubs 1s = 1px, padded to
// RUNWAY by the trailing spacer). Tunable.
const STAGGER = 90; // scroll px between each hexagon's fade start
const FADE = 260; // scroll px for one hexagon's opacity 0 → 1
const HOLD = 320; // held fully-revealed before the sticky releases

type HexFill = "filled" | "outline";

interface HexDef {
  cx: number; // center X in field design px
  cy: number; // center Y in field design px (negative = bleeds above the field)
  fill: HexFill;
  order: number; // reveal index (0 = first)
  text?: string;
}

// 11 hexagons on a true tessellating grid: row pitch = HEX_W, adjacent rows
// offset by HEX_W/2, row-to-row vertical spacing = HEX_H·3/4. Row 0 and row 2
// share the same column grid; row 1 sits on the half-pitch offset grid
// between them — the standard pointy-top honeycomb layout. Anchoring row 0
// col 0 at (180, 180) lands every hexagon's edge flush with the field's
// margins (confirms this is the grid the Figma frame was built on).
const ROW_PITCH = HEX_W; // 311.77
const COL_OFFSET = HEX_W / 2; // 155.885
const ROW_SPACING = (HEX_H * 3) / 4; // 270

const col = (i: number) => 180 + i * ROW_PITCH;
const colOffset = (i: number) => 180 + COL_OFFSET + i * ROW_PITCH;
const ROW0_Y = 180;
const ROW1_Y = ROW0_Y + ROW_SPACING;
const ROW2_Y = ROW1_Y + ROW_SPACING;

// The hex that used to sit at col(1)/row0 (next to the "With gaps
// identified…" hex) is intentionally omitted — an empty gap in the grid.
const HEXES: HexDef[] = [
  { cx: col(0), cy: ROW0_Y, fill: "outline", order: 0, text: "With gaps identified…" },
  { cx: col(2), cy: ROW0_Y, fill: "filled", order: 1 },
  {
    cx: colOffset(0),
    cy: ROW1_Y,
    fill: "filled",
    order: 2,
    text: "I had the\nconfidence to\nkick off…",
  },
  {
    cx: colOffset(1),
    cy: ROW1_Y,
    fill: "outline",
    order: 3,
    text: "All Software\nand Profile\ndesigns.",
  },
  { cx: col(1), cy: ROW2_Y, fill: "outline", order: 4 },
  { cx: col(3), cy: ROW0_Y, fill: "outline", order: 5 },
  { cx: colOffset(3), cy: ROW1_Y, fill: "filled", order: 6 },
  { cx: col(3), cy: ROW2_Y, fill: "filled", order: 7 },
];

const RUNWAY = (HEXES.length - 1) * STAGGER + FADE + HOLD;

export default function GapsIdentifiedHexScene({
  className,
}: {
  className?: string;
}) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const hexRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const sceneEl = sceneRef.current;
    const stageEl = stageRef.current;
    const fieldEl = fieldRef.current;
    if (!sceneEl || !stageEl || !fieldEl) return;

    const hexEls = hexRefs.current.filter(Boolean) as HTMLDivElement[];

    // Scale the design-size field to the stage's width so the honeycomb
    // always fills the section, keeping its proportions.
    const applyScale = () => {
      const scale = stageEl.clientWidth / FIELD_W;
      fieldEl.style.setProperty("--hex-scale", String(scale));
    };
    applyScale();

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Tall track so the sticky stage holds for exactly RUNWAY.
        sceneEl.style.height = `calc(100vh + ${RUNWAY}px)`;

        gsap.set(hexEls, { opacity: 0 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sceneEl,
            // Starts exactly when the stage pins — matches every other
            // sticky scene in this case study (FrameworkScene,
            // DataScrollController).
            start: "top top",
            end: `+=${RUNWAY}`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        HEXES.forEach((def, i) => {
          tl.to(
            hexRefs.current[i],
            { opacity: 1, duration: FADE, ease: "none" },
            def.order * STAGGER,
          );
        });

        // Pad the timeline to exactly RUNWAY so HOLD stays held (trailing
        // empty time isn't otherwise counted in a timeline's duration).
        tl.to({}, { duration: RUNWAY });

        return () => {
          sceneEl.style.height = "";
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(hexEls, { opacity: 1 });
      });
    });

    window.addEventListener("resize", applyScale);
    return () => {
      window.removeEventListener("resize", applyScale);
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={sceneRef}
      className={`${styles.scene}${className ? ` ${className}` : ""}`}
    >
      <div ref={stageRef} className={styles.stage}>
        <div
          ref={fieldRef}
          className={styles.field}
          style={
            {
              width: FIELD_W,
              height: FIELD_H,
              "--hex-shape-scale": HEX_SHAPE_SCALE,
            } as CSSProperties
          }
        >
          {HEXES.map((def, i) => (
            <div
              key={i}
              ref={(el) => {
                hexRefs.current[i] = el;
              }}
              className={styles.hex}
              style={{
                left: def.cx,
                top: def.cy,
                width: HEX_W,
                height: HEX_H,
              }}
            >
              {def.fill === "filled" ? (
                <div className={`${styles.hexShape} ${styles.hexFilled}`} />
              ) : (
                <svg
                  className={styles.hexShape}
                  viewBox={`0 0 ${HEX_W} ${HEX_H}`}
                >
                  <polygon
                    points={HEX_POLYGON_POINTS}
                    fill="none"
                    stroke="var(--surface-card-border)"
                    strokeWidth={1}
                    strokeDasharray={STROKE_DASH}
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              )}
              {def.text && <p className={styles.hexText}>{def.text}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
