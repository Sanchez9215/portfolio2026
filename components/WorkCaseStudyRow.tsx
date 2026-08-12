/**
 * WorkCaseStudyRow — Home page Work section, first (and so far only) row.
 *
 * Figma node 641:7270 ("Portfolio Cleaning" file) supplied the row's layout
 * (fixed left column of title/description/CTAs, right column of meta/impact/
 * live embed, top-divider) — not its content or its static screenshot.
 * Copy is the real case study's own (`introContent.ts`, shared with
 * SectionIntroduction so the two can't drift). The embed is the real, live
 * `SoftwareExperienceEmbed` (with its own scripted ghost-cursor walkthrough)
 * in place of Figma's static screenshot.
 *
 * Entrance choreography mirrors SectionIntroduction's own timeline (title
 * rows staggered, description together, meta then impact in sequence, embed
 * fading/translating in parallel) — but fires on scroll into view instead of
 * on mount, since this row sits below the fold on Home.
 */

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Section from "@/components/Section";
import Block from "@/components/Block";
import Title from "@/components/Title";
import TitleBlock from "@/components/TitleBlock";
import Button from "@/components/Button";
import SoftwareExperienceEmbed from "@/components/case-studies/software-observability/SoftwareExperienceEmbed";
import {
  introTitleLines,
  introDescription,
  introMeta,
  introImpact,
} from "@/components/case-studies/software-observability/introContent";
import styles from "./WorkCaseStudyRow.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CASE_STUDY_HREF = "/work/software-observability";

// Same beat shape as SectionIntroduction's TIMING, played on scroll-enter
// instead of on mount.
const TIMING = {
  titleDuration: 0.75,
  titleStagger: 0.35,
  descriptionStart: 0.6,
  descriptionDuration: 0.75,
  ctaStart: 0.85,
  ctaDuration: 0.5,
  metaStart: 0.85,
  metaDuration: 0.75,
  impactStart: 1.1,
  impactDuration: 0.75,
  embedStart: 1.1,
  embedDuration: 1,
  embedTravelDistance: 500,
};

// Inlined from /icons/go-arrow.svg — currentColor resolves from the icon
// badge's own color, same convention as Hero/MenuItem/SoftwareExperienceEmbed.
function ArrowOutwardIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <mask
        id="work-row-arrow-outward-mask"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="48"
        height="48"
      >
        <rect width="48" height="48" fill="#D9D9D9" />
      </mask>
      <g mask="url(#work-row-arrow-outward-mask)">
        <path
          d="M13.0825 36.9326L9.34996 33.2001L27.9 14.6501H11.6325V9.3501H36.9325V34.6501H31.6325V18.3826L13.0825 36.9326Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}

export default function WorkCaseStudyRow() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const impactRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const titleEl = titleRef.current;
    const descriptionEl = descriptionRef.current;
    const ctaEl = ctaRef.current;
    const metaEl = metaRef.current;
    const impactEl = impactRef.current;
    const embedEl = embedRef.current;
    if (
      !titleEl ||
      !descriptionEl ||
      !ctaEl ||
      !metaEl ||
      !impactEl ||
      !embedEl
    )
      return;

    const ctx = gsap.context(() => {
      const titleRows = titleEl.querySelectorAll(`.${styles.titleRow}`);

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: titleEl,
          start: "top 80%",
          once: true,
        },
      });

      tl.to(titleRows, {
        opacity: 1,
        y: 0,
        duration: TIMING.titleDuration,
        stagger: TIMING.titleStagger,
      })
        .to(
          descriptionEl,
          { opacity: 1, y: 0, duration: TIMING.descriptionDuration },
          TIMING.descriptionStart,
        )
        .to(
          ctaEl.children,
          { opacity: 1, y: 0, duration: TIMING.ctaDuration },
          TIMING.ctaStart,
        )
        .to(metaEl, { opacity: 1, duration: TIMING.metaDuration }, TIMING.metaStart)
        .to(
          metaEl.children,
          { opacity: 1, y: 0, duration: TIMING.metaDuration },
          TIMING.metaStart,
        )
        .to(
          impactEl.children,
          { opacity: 1, y: 0, duration: TIMING.impactDuration },
          TIMING.impactStart,
        )
        .fromTo(
          embedEl,
          { y: TIMING.embedTravelDistance },
          { opacity: 1, y: 0, duration: TIMING.embedDuration },
          TIMING.embedStart,
        );
    });

    return () => ctx.revert();
  }, []);

  return (
    <Section className={styles.work}>
      <div className={styles.left}>
        <div className={styles.intro}>
          <h2 ref={titleRef} className={styles.title}>
            {introTitleLines.map((line, i, arr) => (
              <span key={line}>
                <span className={styles.titleRow}>{line}</span>
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </h2>
          <Block size="lg" ref={descriptionRef} className={styles.description}>
            {introDescription}
          </Block>
        </div>
        <div ref={ctaRef} className={styles.ctaRow}>
          <Button
            variant="primary"
            size="large"
            href={CASE_STUDY_HREF}
            icon={<ArrowOutwardIcon />}
          >
            Case Study
          </Button>
          <Button
            variant="secondary"
            size="large"
            href={CASE_STUDY_HREF}
            icon={<ArrowOutwardIcon />}
          >
            View Build
          </Button>
        </div>
      </div>

      <div className={styles.right}>
        <div ref={metaRef} className={styles.meta}>
          {introMeta.map((item) => (
            <TitleBlock
              key={item.label}
              size="xs"
              titleColor="tertiary"
              title={item.label}
              body={item.body}
            />
          ))}
        </div>
        <div ref={impactRef} className={styles.impact}>
          {introImpact.map((item) =>
            item.badge ? (
              <div key={item.heading} className={styles.impactItem}>
                <div className={styles.impactHeading}>
                  <span className={styles.badge}>{item.badge}</span>
                  <Title size="sm">{item.heading}</Title>
                </div>
                <Block size="sm" color="tertiary">
                  {item.body}
                </Block>
              </div>
            ) : (
              <TitleBlock
                key={item.heading}
                size="sm"
                title={item.heading}
                body={item.body}
              />
            ),
          )}
        </div>
        <div ref={embedRef} className={styles.embedWrap}>
          <SoftwareExperienceEmbed />
        </div>
      </div>
    </Section>
  );
}
