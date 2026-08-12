"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Block from "@/components/Block";
import Title from "@/components/Title";
import TitleBlock from "@/components/TitleBlock";
import SoftwareExperienceEmbed from "./SoftwareExperienceEmbed";
import {
  introTitleLines,
  introDescription,
  introMeta,
  introImpact,
} from "./introContent";
import styles from "./SectionIntroduction.module.css";

// Entrance choreography, all landing within ~1s of mount:
//   title rows (staggered) + description (together) — both start at 0
//   meta row (all at once) — starts once title/description are underway
//   impact row (all at once) — starts immediately after meta row finishes
// The hero embed fades/translates in over its own longer 1.25s beat in
// parallel — SoftwareExperienceEmbed uses that same window to pre-warm its
// first scroll target while it's still not the visual focus (see its own
// comments), then fades its cursor in and starts its scripted sequence at
// the 1.5s mark once this section has fully settled.
//
// TIMING is a live-tweak surface for the intro (title/description) and
// impact row beats only — edit and save to see changes via Fast Refresh.
const TIMING = {
  titleStartDelay: 0.65,
  titleDuration: 0.75,
  titleStagger: 0.35,
  descriptionStart: 1.25,
  descriptionDuration: 0.75,
  metaStart: 1.5,
  metaDuration: 0.75,
  impactStart: 1.75,
  impactDuration: 0.75,
  heroStart: 1.75,
  heroDuration: 1,
  heroTravelDistance: 500,
};

export default function SectionIntroduction() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const impactRef = useRef<HTMLDivElement>(null);
  const heroEmbedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const titleEl = titleRef.current;
    const descriptionEl = descriptionRef.current;
    const metaEl = metaRef.current;
    const impactEl = impactRef.current;
    const heroEmbedEl = heroEmbedRef.current;
    if (!titleEl || !descriptionEl || !metaEl || !impactEl || !heroEmbedEl)
      return;

    // DIAGNOSTIC: watch the whole page-load window (not just one component's
    // tween) for dropped frames, so we can see what's actually stalling the
    // main thread and when — rather than guessing again.
    const t0 = performance.now();
    let lastFrame = t0;
    let rafId: number;
    const monitor = () => {
      const now = performance.now();
      const delta = now - lastFrame;
      if (delta > 32) {
        console.log(
          `[frame-jank] +${(now - t0).toFixed(0)}ms stall of ${delta.toFixed(0)}ms`,
        );
      }
      lastFrame = now;
      if (now - t0 < 5000) rafId = requestAnimationFrame(monitor);
    };
    rafId = requestAnimationFrame(monitor);

    const ctx = gsap.context(() => {
      const titleRows = titleEl.querySelectorAll(`.${styles.titleRow}`);

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.to(
        titleRows,
        {
          opacity: 1,
          y: 0,
          duration: TIMING.titleDuration,
          stagger: TIMING.titleStagger,
        },
        TIMING.titleStartDelay,
      )
        .to(
          descriptionEl,
          { opacity: 1, y: 0, duration: TIMING.descriptionDuration },
          TIMING.descriptionStart,
        )
        .to(
          metaEl,
          { opacity: 1, duration: TIMING.metaDuration },
          TIMING.metaStart,
        )
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
          heroEmbedEl,
          { y: TIMING.heroTravelDistance },
          {
            opacity: 1,
            y: 0,
            duration: TIMING.heroDuration,
          },
          TIMING.heroStart,
        );
    });

    return () => {
      cancelAnimationFrame(rafId);
      ctx.revert();
    };
  }, []);

  return (
    <section className={`cs-grid ${styles.introduction}`}>
      <div className={styles.projectOverview}>
        <div className={styles.intro}>
          <h1 ref={titleRef} className={styles.title}>
            {introTitleLines.map((line, i, arr) => (
              <span key={line}>
                <span className={styles.titleRow}>{line}</span>
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <Block size="lg" ref={descriptionRef} className={styles.description}>
            {introDescription}
          </Block>
        </div>
      </div>

      <div className={styles.projectImpact}>
        <div ref={metaRef} className={styles.projectMeta}>
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
        <div ref={impactRef} className={styles.impactCards}>
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
      </div>

      <div className={styles.heroImage}>
        <div ref={heroEmbedRef} className={styles.heroEmbed}>
          <SoftwareExperienceEmbed />
        </div>
      </div>
    </section>
  );
}
