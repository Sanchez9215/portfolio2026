"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import gsap from "gsap";
import Block from "@/components/Block";
import Title from "@/components/Title";
import TitleBlock from "@/components/TitleBlock";
import Tooltip from "@/components/Tooltip";
import CompanyLogo from "@/components/CompanyLogo";
import type { CaseStudyIntro } from "./caseStudyIntro";
import styles from "./SectionIntroduction.module.css";

// Entrance choreography, all landing within ~1s of mount:
//   title rows (staggered) + description (together) — both start at 0
//   meta row (all at once) — starts once title/description are underway
//   impact row (all at once) — starts immediately after meta row finishes
//   hero visual fades/translates up over its own longer 1.25s beat in parallel
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

// Impact row always lays out 3 columns — a study with fewer items gets
// filler slots so column widths still match a full row (mirrors
// WorkCaseStudyRow's own IMPACT_SLOTS on Home).
const IMPACT_SLOTS = 3;

export interface SectionIntroductionProps {
  intro: CaseStudyIntro;
  /** Same render-prop shape as `WorkCaseStudyRow`'s `visual` — `entranceReady`
   *  flips when the hero visual's own fade-in starts, `settled` when it
   *  finishes. A static/non-interactive visual can ignore both. */
  visual: (entranceReady: boolean, settled: boolean) => ReactNode;
}

export default function SectionIntroduction({
  intro,
  visual,
}: SectionIntroductionProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const impactRef = useRef<HTMLDivElement>(null);
  const heroEmbedRef = useRef<HTMLDivElement>(null);

  const [entranceReady, setEntranceReady] = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const titleEl = titleRef.current;
    const descriptionEl = descriptionRef.current;
    const metaEl = metaRef.current;
    const impactEl = impactRef.current;
    const heroEmbedEl = heroEmbedRef.current;
    if (!titleEl || !descriptionEl || !metaEl || !impactEl || !heroEmbedEl)
      return;

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
        .call(() => setEntranceReady(true), undefined, TIMING.heroStart)
        .fromTo(
          heroEmbedEl,
          { y: TIMING.heroTravelDistance },
          {
            opacity: 1,
            y: 0,
            duration: TIMING.heroDuration,
            onComplete: () => setSettled(true),
          },
          TIMING.heroStart,
        );
    });

    return () => {
      ctx.revert();
    };
  }, []);

  const {
    titleLines: introTitleLines,
    description: introDescription,
    meta: introMeta,
    impact: introImpact,
    companyLogo,
  } = intro;

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
          {introMeta.map((item) => {
            if (item.label !== "Company") {
              return (
                <TitleBlock
                  key={item.label}
                  size="xs"
                  titleColor="tertiary"
                  title={item.label}
                  body={item.body}
                />
              );
            }
            return (
              <TitleBlock
                key={item.label}
                size="xs"
                titleColor="tertiary"
                title={
                  <span className={styles.companyLabel}>
                    {item.label}
                    <Tooltip content={item.body}>
                      <Image
                        src="/icons/InfoCircle.svg"
                        alt=""
                        width={16}
                        height={16}
                      />
                    </Tooltip>
                  </span>
                }
                body={<CompanyLogo {...companyLogo} />}
              />
            );
          })}
        </div>
        <div ref={impactRef} className={styles.impactCards}>
          {introImpact.map((item) =>
            item.badge ? (
              <div key={item.heading} className={styles.impactItem}>
                <div className={styles.impactHeading}>
                  <Title size="sm">{item.heading}</Title>
                  <span className={styles.badge}>{item.badge}</span>
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
          {/* Empty slots padding the row out to IMPACT_SLOTS, so a study with
              fewer impact items keeps the same column widths as a full one —
              matches WorkCaseStudyRow's own filler pattern on Home. */}
          {Array.from({
            length: Math.max(0, IMPACT_SLOTS - introImpact.length),
          }).map((_, i) => (
            <div
              key={`filler-${i}`}
              className={styles.impactFiller}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      <div className={styles.heroImage}>
        <div ref={heroEmbedRef} className={styles.heroEmbed}>
          {visual(entranceReady, settled)}
        </div>
      </div>
    </section>
  );
}
