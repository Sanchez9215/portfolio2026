"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SoftwareSystemMap from "./SoftwareSystemMap";
import styles from "@/app/work/software-observability/software-observability.module.css";
import { scheduleScrollTriggerRefresh } from "./scrollTriggerRefresh";

gsap.registerPlugin(ScrollTrigger);

// section.building-blocks-map — self-contained: the spine starts flush
// with this section's own top edge and grows down into
// SoftwareSystemMap's Compliance hub (its center hub, marked
// `data-hub-center` — now on the hub's <text> label itself, since hubs no
// longer render a circle shape; the label is already centered on the
// hub's real position, so its own bbox center still lands in the same
// place). No cross-section measurement — BuildingBlocksIntro's own stub
// above carries the line visually through that section instead.
export default function BuildingBlocksMap() {
  const spineLineRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    const lineEl = spineLineRef.current;
    const sectionEl = lineEl?.closest("section");
    const hubEl = sectionEl?.querySelector<SVGGraphicsElement>(
      "[data-hub-center]",
    );
    if (!lineEl || !sectionEl || !hubEl) return;

    const ctx = gsap.context(() => {
      const sectionRect = sectionEl.getBoundingClientRect();
      const hubRect = hubEl.getBoundingClientRect();
      const targetX = hubRect.left + hubRect.width / 2 - sectionRect.left;
      const targetY = hubRect.top + hubRect.height / 2 - sectionRect.top;

      gsap.set(lineEl, {
        attr: { x1: targetX, x2: targetX, y1: 0, y2: 0 },
      });

      scheduleScrollTriggerRefresh();

      // end is a fixed scroll distance (targetY itself) rather than a
      // fraction of the whole section — the section is far taller than
      // this gap (it contains the entire map below the hub), so tying end
      // to a fraction of section height stretches the draw across way
      // more scroll than the visible gap. This way y2 tracks real
      // scrolled pixels 1:1, same convention TheProblemPinnedScene/
      // FrameworkScene use for their own scrubbed values.
      gsap.to(lineEl, {
        attr: { y2: targetY },
        ease: "none",
        scrollTrigger: {
          trigger: sectionEl,
          start: "top 80%",
          end: `+=${targetY}`,
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <svg className={styles.buildingBlocksSpineSvg} aria-hidden="true">
        <line
          ref={spineLineRef}
          stroke="var(--surface-card-border)"
          strokeWidth={1}
        />
      </svg>

      <div className={styles.buildingBlocksMapInner}>
        <SoftwareSystemMap />
      </div>
    </>
  );
}
