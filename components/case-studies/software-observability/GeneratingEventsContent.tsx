"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import LabelBlock from "@/components/LabelBlock";
import Block from "@/components/Block";
import ImgCard from "@/components/ImgCard";
import styles from "@/app/work/software-observability/software-observability.module.css";

gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin);

// Same funnel-morph.svg technique as InsightsGoalsContent.tsx — see that
// file for the flat→shape rationale. Reused here at the same native size.
const FUNNEL_WIDTH = 256;
const FUNNEL_HEIGHT = 128;
const SPINE_FUNNEL_OVERLAP = 8;
const FUNNEL_FLAT_D = "M0 0C70.6875 0 128 0 128 0C128 0 185.312 0 256 0H0Z";
const FUNNEL_SHAPE_D =
  "M0 0C70.6875 0 128 57.3066 128 128C128 57.3066 185.312 0 256 0H0Z";
// Extra scroll distance held after the spine reaches the last badge, matching
// InsightsGoalsContent's SPINE_END_BUFFER convention.
const SPINE_END_BUFFER = 200;
const STEP_REVEAL_DURATION = 0.1;
// Simple fade-up used for the two static Blocks (detail + steps intro) —
// matches LabelBlock's own display-size scroll window.
const BLOCK_FADE_START = "top 67%";
const BLOCK_FADE_END = "center center";
// Image cards stagger in right after the detail block's own reveal
// finishes — scroll distance for that follow-on phase, and the per-card
// fade duration/gap as fractions of it (matches this file's other
// buffer/duration constant conventions, e.g. SPINE_END_BUFFER).
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
  const svgRef = useRef<SVGSVGElement>(null);
  const funnelRef = useRef<SVGPathElement>(null);
  const spineRef = useRef<SVGLineElement>(null);
  const detailBlockRef = useRef<HTMLDivElement>(null);
  const stepsIntroRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);
  const stepsColRef = useRef<HTMLDivElement>(null);
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

  // Funnel → spine → step reveal.
  useEffect(() => {
    const sectionEl = stepsColRef.current?.closest("section");
    const svgEl = svgRef.current;
    const funnelEl = funnelRef.current;
    const spineEl = spineRef.current;
    const stepsColEl = stepsColRef.current;
    const stepEls = stepRefs.current;
    const badgeEls = badgeRefs.current;

    if (
      !sectionEl ||
      !svgEl ||
      !funnelEl ||
      !spineEl ||
      !stepsColEl ||
      stepEls.some((el) => !el) ||
      badgeEls.some((el) => !el)
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      const measure = () => {
        const sectionRect = sectionEl.getBoundingClientRect();
        // Spine runs through the real center of the badges, not the gutter
        // between the image row and the step column — all badges share the
        // same x, so the first one is representative.
        const badgeRect = badgeEls[0]!.getBoundingClientRect();
        const badgeCenterX =
          badgeRect.left + badgeRect.width / 2 - sectionRect.left;
        const badgeCenterYs = badgeEls.map((el) => {
          const r = el!.getBoundingClientRect();
          return r.top + r.height / 2 - sectionRect.top;
        });
        return {
          width: sectionRect.width,
          height: sectionRect.height,
          badgeCenterX,
          badgeCenterYs,
        };
      };

      const m = measure();
      svgEl.setAttribute("viewBox", `0 0 ${m.width} ${m.height}`);

      funnelEl.setAttribute(
        "transform",
        `translate(${m.badgeCenterX - FUNNEL_WIDTH / 2}, 0)`,
      );
      funnelEl.setAttribute("d", FUNNEL_FLAT_D);

      const spineStartY = FUNNEL_HEIGHT - SPINE_FUNNEL_OVERLAP;
      gsap.set(spineEl, {
        attr: {
          x1: m.badgeCenterX,
          x2: m.badgeCenterX,
          y1: spineStartY,
          y2: spineStartY,
        },
      });
      gsap.set(stepEls, { opacity: 0, y: 16 });

      ScrollTrigger.refresh();

      // Phase 1 — funnel morphs from flat to its full shape over the
      // section's first 25% of viewport entry.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionEl,
            start: "top bottom",
            end: "top 75%",
            scrub: true,
          },
        })
        .to(funnelEl, { morphSVG: FUNNEL_SHAPE_D, duration: 1, ease: "none" });

      // Phase 2 — spine grows continuously through each badge's center,
      // fading that step's row in as the tip arrives.
      const lastBadgeCenterY = m.badgeCenterYs[m.badgeCenterYs.length - 1];
      const spineTravel = lastBadgeCenterY - spineStartY;
      const totalPhaseLength = spineTravel + SPINE_END_BUFFER;

      const revealTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionEl,
          start: "top 75%",
          end: () => `+=${totalPhaseLength}`,
          scrub: true,
        },
      });

      revealTl.to(
        spineEl,
        {
          attr: { y2: lastBadgeCenterY },
          duration: spineTravel / totalPhaseLength,
          ease: "none",
        },
        0,
      );

      m.badgeCenterYs.forEach((y, i) => {
        const arrivesAt = (y - spineStartY) / totalPhaseLength;
        revealTl.to(
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
        <path ref={funnelRef} fill="var(--surface-base)" />
        <line
          ref={spineRef}
          stroke="var(--surface-card-border)"
          strokeWidth={1}
        />
      </svg>

      <div className={styles.generatingEventsHeader}>
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
        <ImgCard caption="Timeline Prototype" inverse>
          <img
            src="/images/software-observability/timeline-prototype-1.jpg"
            alt="Timeline Prototype"
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
