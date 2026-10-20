"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scheduleScrollTriggerRefresh } from "./scrollTriggerRefresh";
import { BRIDGE_TIP_VIEWPORT_POSITION } from "./bridgeScroll";
import styles from "./BridgeSpine.module.css";

gsap.registerPlugin(ScrollTrigger);

// The line starts 8px under the question text (--spacing-sm). Figma 2393:1441 /
// 2385:969: the snake's corner radius is 32px (--spacing-xl) and its bottom run
// hugs the lens block's outer bottom edge (padding included). The page line ends
// where that last elbow ends; the straight line down to the cards' header and
// the stem below it are drawn by BridgeCards, inside its pinned unit.
const START_GAP = 8;
const CORNER_RADIUS = 32;

// One continuous path owned by section.bridge, drawn as the page scrolls.
// Runs down the centre line from under the opener's question, wraps the lens
// block in a snake (right edge out and back), then drops down the centre line
// again to the cards' header, with a short stem below it. Later bridge sections
// extend the same path (measured, not fixed px).
export default function BridgeSpine() {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const path = pathRef.current;
    const section = svg?.parentElement;
    if (!svg || !path || !section) return;

    const question = section.querySelector<HTMLElement>(
      "[data-bridge-question]"
    );
    const lens = section.querySelector<HTMLElement>("[data-bridge-lens]");
    if (!question || !lens) return;

    // Y positions relative to the SVG's own top edge, from real DOM positions.
    const measure = () => {
      const svgTop = svg.getBoundingClientRect().top;
      const lensRect = lens.getBoundingClientRect();
      const start = question.getBoundingClientRect().bottom - svgTop + START_GAP;
      const snakeTop = lensRect.top - svgTop;
      const snakeBottom = lensRect.bottom - svgTop;
      return {
        start,
        snakeTop,
        snakeBottom,
        end: snakeBottom + CORNER_RADIUS,
      };
    };

    const layout = () => {
      const { start, snakeTop, snakeBottom } = measure();
      // The SVG covers the content box (inside the grid's inline padding), so
      // its own midpoint is the page's centre line, and its right edge the
      // content's right edge.
      const width = svg.getBoundingClientRect().width;
      const x = width / 2;
      const r = CORNER_RADIUS;
      path.setAttribute(
        "d",
        [
          `M${x} ${start}`,
          `V${snakeTop - r}`,
          `A${r} ${r} 0 0 0 ${x + r} ${snakeTop}`,
          `H${width - r}`,
          `A${r} ${r} 0 0 1 ${width} ${snakeTop + r}`,
          `V${snakeBottom - r}`,
          `A${r} ${r} 0 0 1 ${width - r} ${snakeBottom}`,
          `H${x + r}`,
          `A${r} ${r} 0 0 0 ${x} ${snakeBottom + r}`,
        ].join("")
      );
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    };

    const ctx = gsap.context(() => {
      layout();
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: svg,
          start: () => `top+=${measure().start} ${BRIDGE_TIP_VIEWPORT_POSITION}`,
          end: () => `top+=${measure().end} ${BRIDGE_TIP_VIEWPORT_POSITION}`,
          scrub: true,
          invalidateOnRefresh: true,
          onRefreshInit: layout,
        },
      });
    }, svg);

    scheduleScrollTriggerRefresh();
    return () => ctx.revert();
  }, []);

  return (
    <svg ref={svgRef} className={styles.spine} aria-hidden="true">
      <path ref={pathRef} />
    </svg>
  );
}
