/**
 * WorkCaseStudyRow — one case study entry point in the Home page's Work
 * section. Content-driven: every row on Home is this component, fed a
 * `CaseStudyIntro` plus its own visual.
 *
 * Figma node 641:7270 ("Portfolio Cleaning" file) supplied the row's layout
 * (fixed left column of title/description/CTAs, right column of meta/impact/
 * visual, top-divider) — not its content or its static screenshot.
 * Copy comes from the real case study's own `introContent.ts`, shared with
 * that case study's own intro section so the two can't drift.
 *
 * The `visual` render prop receives `entranceReady` — flipped when this
 * row's own visual fade-in *starts* — so a live embed can gate its internal
 * walkthrough on it. Static visuals (e.g. WorkVisualPlaceholder) ignore it.
 *
 * Entrance choreography mirrors the case study intro's own timeline (title
 * rows staggered, description together, meta then impact in sequence, visual
 * fading/translating in parallel) — but fires on scroll into view instead of
 * on mount, since these rows sit below the fold on Home.
 */

"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Section from "@/components/Section";
import Block from "@/components/Block";
import Title from "@/components/Title";
import TitleBlock from "@/components/TitleBlock";
import type { CaseStudyIntro } from "@/components/case-studies/caseStudyIntro";
import styles from "./WorkCaseStudyRow.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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

// The impact row always lays out this many columns — rows supplying fewer
// items get empty filler slots (see the JSX) so column widths stay identical
// across every case study entry point.
const IMPACT_SLOTS = 3;

export interface WorkCaseStudyRowProps {
  /** The case study's own intro content — see `caseStudyIntro.ts`. */
  intro: CaseStudyIntro;
  /**
   * The row's visual. Called with `entranceReady` — flips true when this
   * row's visual fade-in *starts* (a live embed can gate its own scripted
   * walkthrough on it) — and `settled`, which flips once that fade/
   * translate-in tween actually *finishes* (the visual is fully in place,
   * e.g. for a video that shouldn't start playing until then). Static
   * visuals ignore both.
   */
  visual: (entranceReady: boolean, settled: boolean) => ReactNode;
  /**
   * Opts into a fixed 16/10 box instead of the default (the wrap hugs
   * whatever height the visual itself renders at) — for a visual that needs
   * a bounded window rather than its own natural height, e.g. Software
   * Observability's live embed, which scrolls its real (much taller) app
   * content inside a fixed viewport.
   */
  fixedVisualRatio?: boolean;
  /**
   * Rounds top corners only, flush against the row's bottom edge, instead
   * of the default (all four corners round) — for a visual specifically
   * designed to sit flush, e.g. Software Observability's embed. Independent
   * of `fixedVisualRatio`: a fixed ratio doesn't by itself imply this.
   */
  flushBottomRadius?: boolean;
  /** Overrides the impact items' shared 108px height (see .impactItem in
   *  WorkCaseStudyRow.module.css) for this row only. */
  impactItemHeight?: number;
}

export default function WorkCaseStudyRow({
  intro,
  visual,
  fixedVisualRatio = false,
  flushBottomRadius = false,
  impactItemHeight,
}: WorkCaseStudyRowProps) {
  const { titleLines, description, meta, impact } = intro;
  // Passed to the `visual` render prop. Flips when this row's own embedWrap
  // fade-in *starts* (see the .call() below, fired at TIMING.embedStart) —
  // not finishes. A live embed's hidden pre-warm pass (fonts/images/
  // primeScroll) needs to run while it's still low-opacity; gating on
  // fade-in finishing let primeScroll's instant scrollTop jump-and-back run
  // after the embed was already fully visible, which read as a glitch right
  // after the entrance settled. Starts false, flips once via the timeline.
  const [entranceReady, setEntranceReady] = useState(false);
  const [visualSettled, setVisualSettled] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
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
          embedEl,
          { y: TIMING.embedTravelDistance },
          { opacity: 1, y: 0, duration: TIMING.embedDuration },
          TIMING.embedStart,
        )
        .call(() => setEntranceReady(true), [], TIMING.embedStart)
        // Forces .embedWrap's transform to "none" once its own fade/
        // translate-in tween ends (at rest, y already 0 — visually a no-op).
        // Load-bearing for the expand-to-full-screen feature: any ancestor
        // with a transform becomes the containing block for a position:fixed
        // descendant. clearProps alone isn't enough here — .embedWrap's own
        // CSS class (WorkCaseStudyRow.module.css) bakes `transform:
        // translateY(24px)` into its base rule as the hidden-entrance state,
        // so clearing GSAP's inline override just reveals that class
        // transform again (still non-"none", still a containing block) —
        // an explicit inline "none" is required to actually remove it.
        .call(() => gsap.set(embedEl, { transform: "none" }))
        .call(() => setVisualSettled(true));
    });

    return () => ctx.revert();
  }, []);

  return (
    <Section className={styles.work}>
      <div ref={leftRef} className={styles.left}>
        <div className={styles.intro}>
          <h2 ref={titleRef} className={styles.title}>
            {titleLines.map((line, i, arr) => (
              <span key={line}>
                <span className={styles.titleRow}>{line}</span>
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </h2>
          <Block size="lg" ref={descriptionRef} className={styles.description}>
            {description}
          </Block>
        </div>
        <div ref={ctaRef} className={styles.ctaRow}>
          {/* Hidden until the case study is ready to link to publicly.
          <Button
            variant="primary"
            size={ctaButtonSize}
            href={CASE_STUDY_HREF}
            icon={<ArrowOutwardIcon />}
          >
            Case Study
          </Button> */}
          {/* <Button
            variant="secondary"
            size="large"
            href={CASE_STUDY_HREF}
            icon={<ArrowOutwardIcon />}
          >
            View Build
          </Button> */}
        </div>
      </div>

      <div className={styles.right}>
        <div ref={metaRef} className={styles.meta}>
          {meta.map((item) => {
            // Company's body is split so everything after the company name
            // (its first word) can be hidden at the ≤480px tier — see
            // WorkCaseStudyRow.module.css's .companyRest.
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
            const [firstWord, ...rest] = item.body.split(" ");
            return (
              <TitleBlock
                key={item.label}
                size="xs"
                titleColor="tertiary"
                title={item.label}
                body={
                  <>
                    {firstWord}
                    <span className={styles.companyRest}>
                      {" "}
                      {rest.join(" ")}
                    </span>
                  </>
                }
              />
            );
          })}
        </div>
        <div
          ref={impactRef}
          className={styles.impact}
          style={
            impactItemHeight !== undefined
              ? ({
                  "--impact-item-height": `${impactItemHeight}px`,
                } as React.CSSProperties)
              : undefined
          }
        >
          {/* Rendered as Title + Block directly rather than via TitleBlock —
              TitleBlock hardcodes its body to `tertiary`, and impact bodies
              are `secondary` here. Badge-less items simply omit the badge. */}
          {impact.map((item) => (
            <div key={item.heading} className={styles.impactItem}>
              <div className={styles.impactHeading}>
                <Title size="sm">{item.heading}</Title>
                {item.badge && (
                  <span className={styles.badge}>{item.badge}</span>
                )}
              </div>
              {item.body && (
                <Block size="sm" color="secondary">
                  {item.body}
                </Block>
              )}
            </div>
          ))}
          {/* Empty slots padding the row out to IMPACT_SLOTS, so a row with
              fewer impact items keeps the same column widths as a full one.
              Hidden at the ≤620px tier, where .impact stacks into a column
              and an empty item would read as a gap instead of a column. */}
          {Array.from({
            length: Math.max(0, IMPACT_SLOTS - impact.length),
          }).map((_, i) => (
            <div key={`filler-${i}`} className={styles.impactFiller} aria-hidden="true" />
          ))}
        </div>
        <div
          ref={embedRef}
          className={[
            styles.embedWrap,
            fixedVisualRatio && styles.embedWrapFixedRatio,
            flushBottomRadius && styles.embedWrapFlushBottom,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {visual(entranceReady, visualSettled)}
        </div>
      </div>
    </Section>
  );
}
