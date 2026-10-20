"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import annotationStyles from "../AnnotationCallout.module.css";
import styles from "./FrameworkLevelCallouts.module.css";

// A column of always-on annotation cards with a plain title + description
// (title is the bold label, 8px above the description). Each pointer is one
// horizontal 1px line from its label's vertical center toward the figure,
// starting LABEL_GAP away from the label and ending where it meets its target
// (`targetX` gives that x for the label's y). Cards are in normal flow (flex
// column, fixed gap) and pointers are measured from them, so card heights can
// change freely. On the left side the text is right-aligned so the label sits
// against the edge the pointer starts at.
const LABEL_GAP = 8; // pointer start -> label

export type FrameworkLevelCallout = {
  title: string;
  body: string;
  /** x (container-local px) where this pointer ends, given the label's y. */
  targetX: (labelY: number) => number;
  /** For a target that moves (e.g. a floating cube): returns its live point
   *  (container-local px) every frame. The pointer stays horizontal, drawn
   *  at the target's current y; the label itself stays put. */
  track?: () => { x: number; y: number } | null;
};

export default function FrameworkLevelCallouts({
  items,
  side,
  edgeX,
  centerY,
  width = 232,
  gap = 32,
  alignLabel,
}: {
  items: FrameworkLevelCallout[];
  /** Which side of the figure the column sits on. */
  side: "left" | "right";
  /** x of the column's near edge (the edge facing the figure). */
  edgeX: number;
  /** y the column is vertically centered on. */
  centerY: number;
  width?: number;
  gap?: number;
  /** Pins one item's label to a y instead of centering the whole column. */
  alignLabel?: { index: number; y: number };
}) {
  const columnRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [top, setTop] = useState<number | null>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  useLayoutEffect(() => {
    const column = columnRef.current;
    if (!column) return;
    const measure = () => {
      const labelCenterWithin = (n: number) => {
        const card = column.children[n] as HTMLElement | undefined;
        const title = card?.firstElementChild as HTMLElement | null;
        return card && title
          ? card.offsetTop + title.offsetTop + title.offsetHeight / 2
          : 0;
      };
      const columnTop = alignLabel
        ? alignLabel.y - labelCenterWithin(alignLabel.index)
        : centerY - column.offsetHeight / 2;
      setTop(columnTop);
      const lineEndX = side === "right" ? edgeX - LABEL_GAP : edgeX + LABEL_GAP;
      const next = items.map((item, n) => {
        const card = column.children[n] as HTMLElement | undefined;
        const title = card?.firstElementChild as HTMLElement | null;
        if (!card || !title) return "";
        const labelCenterY =
          columnTop + card.offsetTop + title.offsetTop + title.offsetHeight / 2;
        return `M${lineEndX} ${labelCenterY}H${item.targetX(labelCenterY)}`;
      });
      setLines(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(column);
    return () => observer.disconnect();
  }, [items, side, edgeX, centerY, width, alignLabel]);

  // Tracked pointers are redrawn every frame straight on the path element
  // (no React state), following their moving target.
  useEffect(() => {
    if (!items.some((item) => item.track)) return;
    const lineEndX = side === "right" ? edgeX - LABEL_GAP : edgeX + LABEL_GAP;
    const update = () => {
      items.forEach((item, n) => {
        const point = item.track?.();
        const path = pathRefs.current[n];
        if (!point || !path) return;
        path.setAttribute("d", `M${lineEndX} ${point.y}H${point.x}`);
      });
    };
    gsap.ticker.add(update);
    return () => gsap.ticker.remove(update);
  }, [items, side, edgeX]);

  return (
    <>
      <div
        ref={columnRef}
        className={styles.column}
        style={{
          textAlign: side === "left" ? "right" : undefined,
          left: side === "right" ? edgeX : edgeX - width,
          top: top ?? 0,
          width,
          gap,
          visibility: top === null ? "hidden" : undefined,
        }}
      >
        {items.map((item) => (
          <div key={item.title} className={styles.card}>
            <span className={annotationStyles.title}>{item.title}</span>
            <p className={annotationStyles.text}>{item.body}</p>
          </div>
        ))}
      </div>
      <svg className={styles.lines} fill="none" aria-hidden="true">
        {lines.map((d, n) => (
          <path
            key={n}
            ref={(el) => {
              pathRefs.current[n] = el;
            }}
            className={styles.line}
            d={d}
          />
        ))}
      </svg>
    </>
  );
}
