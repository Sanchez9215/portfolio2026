"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LabelBlock from "@/components/LabelBlock";
import Block from "@/components/Block";
import styles from "@/app/work/software-observability/software-observability.module.css";
import { scheduleScrollTriggerRefresh } from "./scrollTriggerRefresh";

gsap.registerPlugin(ScrollTrigger);

// section.stakeholders-intro — split out of the former StakeholdersContent
// so the header and the cards+branch visual (StakeholdersCards) are flat
// sibling sections, letting the gap between them be plain CSS margin
// instead of a cross-component measurement. Per Figma (node 1461:677), the
// center pass-through line runs through this section's full height too —
// self-contained, own top edge to own bottom edge, same convention as
// BuildingBlocksIntro's own stub.
export default function StakeholdersIntro() {
  const detailBlockRef = useRef<HTMLParagraphElement>(null);
  const spineSvgRef = useRef<SVGSVGElement>(null);
  const spineLineRef = useRef<SVGLineElement>(null);

  // Detail Block reveal — matches LabelBlock's own built-in display-size
  // trigger convention (opacity/y16, scrub, "top 67%" → "center center") so
  // it reads as part of the same reveal beat as the heading above it.
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
        className={styles.stakeholdersIntroSpineSvg}
        aria-hidden="true"
      >
        <line
          ref={spineLineRef}
          stroke="var(--surface-card-border)"
          strokeWidth={1}
        />
      </svg>

      <div className={styles.stakeholdersHeader}>
        <LabelBlock
          size="display"
          label="The Stakeholders"
          body="Who's life are we making easier here?"
        />
        <Block
          ref={detailBlockRef}
          size="lg"
          className={styles.stakeholdersDetailBlock}
        >
          The 3 roles at the core of the software asset management ecosystem.
        </Block>
      </div>
    </>
  );
}
