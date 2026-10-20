"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scheduleScrollTriggerRefresh } from "./scrollTriggerRefresh";
import styles from "./ThresholdDropLine.module.css";

gsap.registerPlugin(ScrollTrigger);

// A straight 1px grey-500 line, drawn as the page scrolls, that starts at the
// bottom corner of the Framework figure's hexagon (the Overview layer), runs
// down the page's center line behind the host section (Data Limitations),
// and ends at that section's bottom edge — where DataDictionaryScene's own
// connector begins (center-top of its section), so the two read as one line.
// Render it as a direct child of the host section (position:relative +
// isolation:isolate, see the page's module CSS); measurements are all from
// real DOM positions.
export default function ThresholdDropLine() {
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
      const hexagon = document.querySelector("[data-hexagon]");
      if (!hexagon) return;
      const sectionRect = section.getBoundingClientRect();
      // The hexagon is pointy-top, so its bounding box's bottom is its
      // bottom corner.
      const hexagonRect = hexagon.getBoundingClientRect();
      const start = hexagonRect.bottom - sectionRect.top;
      const next = {
        top: start,
        height: sectionRect.height - start,
        // The hexagon's own center x (not the section's), so the line leaves
        // its bottom corner exactly.
        x: hexagonRect.left + hexagonRect.width / 2 - sectionRect.left,
      };
      // Exposed to the host section's CSS (text is kept left of the line).
      section.style.setProperty("--snake-x", `${next.x}px`);
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
    observer.observe(document.body);
    // Layout can shift without resizing the body (fonts, images, the figure's
    // own measure pass), so re-measure on load and (rAF-throttled) on scroll
    // too — cheap, and keeps the line glued to the hexagon's corner.
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.fonts?.ready?.then(measure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
      window.removeEventListener("scroll", onScroll);
      section.style.removeProperty("--snake-x");
    };
  }, []);

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
        <path ref={pathRef} d={`M${geometry.x} 0V${geometry.height}`} />
      )}
    </svg>
  );
}
