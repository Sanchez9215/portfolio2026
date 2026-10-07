"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LabelBlock from "@/components/LabelBlock";
import Block from "@/components/Block";
import styles from "@/app/work/software-observability/software-observability.module.css";
import { scheduleScrollTriggerRefresh } from "./scrollTriggerRefresh";

gsap.registerPlugin(ScrollTrigger);

// section.building-blocks-intro — sits between StakeholdersCards and
// BuildingBlocksMap. Self-contained: draws only its own full-height line
// segment (own section top -> own section bottom, at this section's own
// horizontal center) so the spine reads as passing continuously through
// this section without ever measuring a sibling section's DOM.
export default function BuildingBlocksIntro() {
  const detailBlockRef = useRef<HTMLParagraphElement>(null);
  const spineSvgRef = useRef<SVGSVGElement>(null);
  const spineLineRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    const detailEl = detailBlockRef.current;
    if (!detailEl) return;

    const ctx = gsap.context(() => {
      gsap.set(detailEl, { opacity: 0, y: 16 });

      scheduleScrollTriggerRefresh();

      gsap.to(detailEl, {
        opacity: 1,
        y: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: detailEl,
          start: "top 67%",
          end: "center center",
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const sectionEl = spineSvgRef.current?.closest("section");
    const spineSvgEl = spineSvgRef.current;
    const lineEl = spineLineRef.current;
    if (!sectionEl || !spineSvgEl || !lineEl) return;

    const ctx = gsap.context(() => {
      const sectionRect = sectionEl.getBoundingClientRect();
      const centerX = sectionRect.width / 2;

      spineSvgEl.setAttribute(
        "viewBox",
        `0 0 ${sectionRect.width} ${sectionRect.height}`,
      );

      gsap.set(lineEl, {
        attr: { x1: centerX, x2: centerX, y1: 0, y2: 0 },
      });

      scheduleScrollTriggerRefresh();

      gsap.to(lineEl, {
        attr: { y2: sectionRect.height },
        ease: "none",
        scrollTrigger: {
          trigger: sectionEl,
          start: "top 80%",
          end: `+=${sectionRect.height}`,
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <svg
        ref={spineSvgRef}
        className={styles.buildingBlocksSpineSvg}
        aria-hidden="true"
      >
        <line
          ref={spineLineRef}
          stroke="var(--surface-card-border)"
          strokeWidth={1}
        />
      </svg>

      <div className={styles.buildingBlocksHeader}>
        <LabelBlock
          size="display"
          label="The Building Blocks"
          body="Data. Data. Data"
        />
        <Block
          ref={detailBlockRef}
          size="lg"
          color="secondary"
          className={styles.buildingBlocksDetailBlock}
        >
          Through research I began establishing the data points required to
          fulfill our goals. This gave us something tangible to work with as
          we waited for integration work to begin.
        </Block>
      </div>
    </>
  );
}
