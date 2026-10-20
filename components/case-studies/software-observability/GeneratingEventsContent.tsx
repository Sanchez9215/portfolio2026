"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LabelBlock from "@/components/LabelBlock";
import Block from "@/components/Block";
import ImgCard from "@/components/ImgCard";
import styles from "@/app/work/software-observability/software-observability.module.css";
import { scheduleScrollTriggerRefresh } from "./scrollTriggerRefresh";

gsap.registerPlugin(ScrollTrigger);

// Extra scroll distance held after the line reaches the last badge, matching
// InsightsGoalsContent's SPINE_END_BUFFER convention.
const SPINE_END_BUFFER = 200;
// A step's fade, as a fraction of the line's timeline, ending as the tip
// arrives at its badge.
const STEP_REVEAL_DURATION = 0.1;
// Simple fade-up used for the two static Blocks (detail + steps intro) —
// matches LabelBlock's own display-size scroll window.
const BLOCK_FADE_START = "top 67%";
const BLOCK_FADE_END = "center center";
// Image cards stagger in right after the detail block's own reveal
// finishes — scroll distance for that follow-on phase, and the per-card
// fade duration/gap as fractions of it (matches this file's other
// buffer/duration constant conventions).
const IMAGES_REVEAL_RUNWAY = 250;
const IMAGE_FADE_DURATION = 0.6;
const IMAGE_STAGGER = 0.4;

const STEPS = [
  {
    title: "Initial Generation",
    body: "Using the latest software lifecycle stages developed with our CPO, I leveraged Claude to generate a set of key events spanning a software title's life.",
  },
  {
    title: "Evaluation",
    body: "The output was events that were too granular for enterprise scale and too specific to generalize across other software titles.",
  },
  {
    title: "Refining for Scale",
    body: "I worked with Claude to refine the events into reusable aggregate milestones, structured to lead with a quantitative data point where applicable, for easy digestion and scale comprehension.",
  },
];

export default function GeneratingEventsContent() {
  const detailBlockRef = useRef<HTMLDivElement>(null);
  const stepsIntroRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);
  const stepsColRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const badgeRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Detail block + steps-intro block: simple fade-up as each enters view.
  // Image cards stagger in right after the detail block's own reveal ends.
  useEffect(() => {
    const detailEl = detailBlockRef.current;
    const introEl = stepsIntroRef.current;
    const imageEls = imagesRef.current
      ? (Array.from(imagesRef.current.children) as HTMLElement[])
      : [];
    if (!detailEl || !introEl || imageEls.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.set([detailEl, introEl, ...imageEls], { opacity: 0, y: 16 });

      [detailEl, introEl].forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: BLOCK_FADE_START,
            end: BLOCK_FADE_END,
            scrub: true,
          },
        });
      });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: detailEl,
            start: BLOCK_FADE_END,
            end: () => `+=${IMAGES_REVEAL_RUNWAY}`,
            scrub: true,
          },
        })
        .to(imageEls, {
          opacity: 1,
          y: 0,
          ease: "none",
          duration: IMAGE_FADE_DURATION,
          stagger: IMAGE_STAGGER,
        });
    });

    return () => ctx.revert();
  }, []);

  // The page's center line comes down from the section's top edge to the
  // header's bottom edge (padding included), pivots right to the badges' x, then
  // runs down through each badge. Drawn as the page scrolls; each step fades in
  // as the tip reaches its badge.
  useEffect(() => {
    const sectionEl = stepsColRef.current?.closest("section");
    const svgEl = svgRef.current;
    const pathEl = pathRef.current;
    const headerEl = sectionEl?.querySelector<HTMLElement>(
      "[data-generating-header]",
    );
    const stepEls = stepRefs.current;
    const badgeEls = badgeRefs.current;
    if (
      !sectionEl ||
      !svgEl ||
      !pathEl ||
      !headerEl ||
      stepEls.some((el) => !el) ||
      badgeEls.some((el) => !el)
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      const sectionRect = sectionEl.getBoundingClientRect();
      const centerX = sectionRect.width / 2;
      // Through the real center of the badges (all share the same x).
      const badgeRect = badgeEls[0]!.getBoundingClientRect();
      const badgeX = badgeRect.left + badgeRect.width / 2 - sectionRect.left;
      const pivotY = headerEl.getBoundingClientRect().bottom - sectionRect.top;
      const badgeYs = badgeEls.map((el) => {
        const r = el!.getBoundingClientRect();
        return r.top + r.height / 2 - sectionRect.top;
      });
      const lastY = badgeYs[badgeYs.length - 1];

      svgEl.setAttribute(
        "viewBox",
        `0 0 ${sectionRect.width} ${sectionRect.height}`,
      );
      pathEl.setAttribute("d", `M${centerX} 0V${pivotY}H${badgeX}V${lastY}`);
      const length = pathEl.getTotalLength();
      const total = length + SPINE_END_BUFFER;
      gsap.set(pathEl, { strokeDasharray: length, strokeDashoffset: length });
      gsap.set(stepEls, { opacity: 0, y: 16 });

      scheduleScrollTriggerRefresh();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionEl,
          start: "top 70%",
          end: () => `+=${total}`,
          scrub: true,
        },
      });
      tl.to(
        pathEl,
        { strokeDashoffset: 0, duration: length / total, ease: "none" },
        0,
      );
      // Distance along the path to each badge: down to the pivot, across, down.
      const toPivot = pivotY + Math.abs(badgeX - centerX);
      badgeYs.forEach((y, i) => {
        const arrivesAt = (toPivot + (y - pivotY)) / total;
        tl.to(
          stepEls[i],
          {
            opacity: 1,
            y: 0,
            duration: STEP_REVEAL_DURATION,
            ease: "power2.out",
          },
          Math.max(0, arrivesAt - STEP_REVEAL_DURATION),
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <svg
        ref={svgRef}
        className={styles.generatingEventsMotionSvg}
        aria-hidden="true"
      >
        <path
          ref={pathRef}
          fill="none"
          stroke="var(--surface-card-border)"
          strokeWidth={1}
        />
      </svg>

      <div className={styles.generatingEventsHeader} data-generating-header>
        <div className={styles.generatingEventsTextBlock}>
          <LabelBlock
            size="display"
            inverse
            label="Generating Realistic Events"
            body="I took the initiative to establish lifecycle event definitions independently."
          />
        </div>
        <div
          ref={detailBlockRef}
          className={styles.generatingEventsDetailBlock}
        >
          <Block size="lg" color="inverse">
            Definitions were still pending from the product and integration
            side. Taking this step allowed me to build a tangible prototype that
            enabled productive cross-functional conversations.
          </Block>
        </div>
      </div>

      <div ref={imagesRef} className={styles.generatingEventsImages}>
        <ImgCard caption="Claude Output" inverse>
          <img
            src="/images/software-observability/claude-timeline-output.jpg"
            alt="Claude Output — lifecycle events"
          />
        </ImgCard>
        <ImgCard caption="Timeline Draft" inverse>
          <img
            src="/images/software-observability/timeline-prototype-1.jpg"
            alt="Timeline Draft"
          />
        </ImgCard>
      </div>

      <div ref={stepsColRef} className={styles.generatingEventsSteps}>
        <div ref={stepsIntroRef} className={styles.generatingEventsStepsIntro}>
          <Block size="lg" color="inverse">
            Reaching a realistic, scalable set of timeline events took some
            iterations.
          </Block>
        </div>
        <div className={styles.generatingEventsStepList}>
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
              className={styles.generatingEventsStep}
            >
              <div
                ref={(el) => {
                  badgeRefs.current[i] = el;
                }}
                className={styles.generatingEventsStepBadge}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className={styles.generatingEventsStepContent}>
                <p className={styles.generatingEventsStepTitle}>{step.title}</p>
                <Block size="md" color="inverse">
                  {step.body}
                </Block>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
