"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scheduleScrollTriggerRefresh } from "./scrollTriggerRefresh";
import styles from "./PageCenterLine.module.css";

gsap.registerPlugin(ScrollTrigger);

// A straight 1px grey-500 line down the page's center, drawn as the page
// scrolls. Render one as a direct child of each section the line passes
// through (position:relative + isolation:isolate on the host, see the page's
// module CSS): every segment draws with the tip ~70% down the viewport, so
// consecutive segments read as one continuous line. By default a segment
// spans its whole section; `startBelow` (a selector inside the host) starts it
// at that element's bottom edge instead, and `endAbove` ends it at the top edge
// of the matching element (it can mount late, e.g. inside LazyMount — the
// section's resize re-triggers the measure). Also exposes `--center-line-x` (the
// line's x from the host's content-box left) so the host's CSS can place text
// beside it.
export default function PageCenterLine({
  startBelow,
  endAbove,
  color,
}: {
  startBelow?: string;
  endAbove?: string;
  /** Stroke color; defaults to grey-500 (for dark sections). */
  color?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [geometry, setGeometry] = useState<{
    top: number;
    height: number;
    x: number;
  } | null>(null);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    const section = svg?.parentElement;
    if (!svg || !section) return;
    const measure = () => {
      const sectionRect = section.getBoundingClientRect();
      let top = 0;
      if (startBelow) {
        const target = section.querySelector(startBelow);
        if (!target) return;
        top = Math.max(0, target.getBoundingClientRect().bottom - sectionRect.top);
      }
      let bottom = sectionRect.height;
      if (endAbove) {
        const target = section.querySelector(endAbove);
        if (!target) return;
        bottom = target.getBoundingClientRect().top - sectionRect.top;
      }
      const x = sectionRect.width / 2;
      const next = { top, height: Math.max(0, bottom - top), x };
      section.style.setProperty(
        "--center-line-x",
        `${x - parseFloat(getComputedStyle(section).paddingLeft)}px`,
      );
      setGeometry((prev) =>
        prev &&
        Math.abs(prev.top - next.top) < 0.5 &&
        Math.abs(prev.height - next.height) < 0.5 &&
        Math.abs(prev.x - next.x) < 0.5
          ? prev
          : next,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(section);
    window.addEventListener("load", measure);
    document.fonts?.ready?.then(measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("load", measure);
      section.style.removeProperty("--center-line-x");
    };
  }, [startBelow, endAbove]);

  useEffect(() => {
    const svg = svgRef.current;
    const path = pathRef.current;
    if (!svg || !path || !geometry) return;
    const length = geometry.height;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        path,
        { strokeDasharray: length, strokeDashoffset: length },
        {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: svg,
            // The drawing tip rides ~70% down the viewport.
            start: "top 70%",
            end: "bottom 70%",
            scrub: true,
          },
        },
      );
    }, svg);
    scheduleScrollTriggerRefresh();
    return () => ctx.revert();
  }, [geometry]);

  return (
    <svg
      ref={svgRef}
      className={styles.line}
      style={
        geometry
          ? { top: geometry.top, height: geometry.height }
          : { visibility: "hidden" }
      }
      fill="none"
      aria-hidden="true"
    >
      {geometry && (
        <path
          ref={pathRef}
          d={`M${geometry.x} 0V${geometry.height}`}
          style={color ? { stroke: color } : undefined}
        />
      )}
    </svg>
  );
}
