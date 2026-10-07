"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./AnnotationCallout.module.css";

// Standalone extraction of AnnotationConnectorHotspot's connector+tooltip
// visual (card + diagonal-then-elbow leader line) — same geometry, same
// constants — with the walkthrough-only machinery stripped out: no spotlight
// scrim/cutout mask, no card-to-card fade transition, no hover gating. This
// is a plain, always-on annotation pointing at a fixed (x, y) point, not a
// measured element's rect.
const DIAGONAL_SIZE = 64;
const STROKE_WIDTH = 1;
// Default card width — matches AnnotationConnectorHotspot's own TOOLTIP_WIDTH.
// Callers deriving their width from a real layout source (e.g. a grid-column
// span) pass `tooltipWidth` instead.
const DEFAULT_TOOLTIP_WIDTH = 232;

export interface AnnotationCalloutProps {
  /** Anchor point (the connector's corner attach point), in the container's
   *  own local coordinate space. */
  x: number;
  y: number;
  /** Same scale convention as AnnotationConnectorHotspot's nativeWidth-derived
   *  scale — shrinks the connector proportionally with its container. */
  scale: number;
  title: string;
  body: string;
  /** Card width — defaults to DEFAULT_TOOLTIP_WIDTH. Overridable so a caller
   *  can size the card from its own real layout (e.g. a grid-column span)
   *  instead of the default fixed px. */
  tooltipWidth?: number;
  /** Runs the connector out to the left instead of the default right. */
  flip?: boolean;
  /** Descends the diagonal to the elbow instead of rising. */
  flipVertical?: boolean;
  accentColor?: string;
}

export default function AnnotationCallout({
  x,
  y,
  scale,
  title,
  body,
  tooltipWidth = DEFAULT_TOOLTIP_WIDTH,
  flip = false,
  flipVertical = false,
  accentColor,
}: AnnotationCalloutProps) {
  const titleRef = useRef<HTMLSpanElement>(null);
  const [lineOffsetY, setLineOffsetY] = useState<number | null>(null);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const measure = () => setLineOffsetY(el.offsetTop + el.offsetHeight + 8);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [title]);

  const cornerX = x;
  const cornerY = y;
  const diagonalWidth = DIAGONAL_SIZE * scale;
  const diagonalHeight = DIAGONAL_SIZE * scale;
  const elbowY = flipVertical
    ? cornerY + diagonalHeight
    : cornerY - diagonalHeight;
  const elbowX = flip ? cornerX - diagonalWidth : cornerX + diagonalWidth;
  const tooltipLeft = flip ? elbowX - tooltipWidth : elbowX;
  const tooltipTop = lineOffsetY != null ? elbowY - lineOffsetY : elbowY;
  const svgTop = flipVertical ? cornerY : elbowY;
  const localCornerY = flipVertical ? 0 : DIAGONAL_SIZE;
  const localElbowY = flipVertical ? DIAGONAL_SIZE : 0;

  const horizontalRun = tooltipWidth / scale;
  const pathWidth = DIAGONAL_SIZE + horizontalRun;
  const connectorPath = `M0 ${localCornerY}L${DIAGONAL_SIZE} ${localElbowY}H${pathWidth}`;

  return (
    <div
      className={styles.callout}
      style={
        accentColor
          ? ({
              "--annotation-connector-color": accentColor,
            } as React.CSSProperties)
          : undefined
      }
    >
      <div
        className={styles.tooltip}
        style={{ left: tooltipLeft, top: tooltipTop, width: tooltipWidth }}
      >
        <span ref={titleRef} className={styles.title}>
          {title}
        </span>
        <p className={styles.text}>{body}</p>
      </div>

      <svg
        className={styles.connector}
        style={{
          left: cornerX,
          top: svgTop,
          width: pathWidth * scale,
          height: diagonalHeight,
          transform: flip ? "scaleX(-1)" : undefined,
          transformOrigin: flip ? "left" : undefined,
        }}
        viewBox={`0 0 ${pathWidth} ${DIAGONAL_SIZE}`}
        fill="none"
      >
        <path
          d={connectorPath}
          stroke="currentColor"
          strokeWidth={STROKE_WIDTH}
          strokeLinejoin="miter"
        />
      </svg>
    </div>
  );
}
