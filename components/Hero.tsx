/**
 * Hero — home page hero section
 *
 * Built from Figma node 214:7415 ("Section", Portfolio Cleaning file).
 * Tokens: --button-*, --text-label-2xl-*, --text-title-xl-*, --text-body-2xl-*
 * (styles/globals.css); Label/Title/Block reused for all text.
 *
 * Headline line breaks are explicitly authored (Figma's own <br> positions),
 * rendered as one span per line so each can be staggered in on entrance.
 *
 * Entrance reveal (label → headline lines → subline, fade+translateY) uses
 * the shared useTextReveal hook — same choreography as SectionIntroduction/
 * WorkCaseStudyRow's title+description, on mount rather than scroll.
 *
 * Subline's emphasis clause rotates through ROTATING_PHRASES (fade+translateY
 * crossfade loop, GSAP). Block has no inline-weight-mixing support yet, so
 * this is a Hero-scoped span override rather than a Block API change. The
 * rotation loop's first cycle only starts once the subline's own entrance
 * tween completes, so nothing crossfades mid fade-in.
 * Respects prefers-reduced-motion (shows the first phrase, static, no loop).
 */

"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import Label from "./Label";
import Title from "./Title";
import Block from "./Block";
import Button from "./Button";
import { useTextReveal } from "@/hooks/useTextReveal";
import styles from "./Hero.module.css";

const HEADLINE_LINES = [
  { prefix: "Specializing in ", text: "Enterprise" },
  { text: "Data", breakBefore: "enterprise" as const },
  { text: "Systems", breakBefore: "data" as const },
  { text: "Designed", breakBefore: "systems" as const },
  { text: "for", breakBefore: "optional" as const },
  { text: "High Stakes.", breakBefore: "for" as const },
];

// Splits a run of text into individually-animatable word spans (so a line
// can wrap naturally at any width and still be grouped/staggered by its
// rendered line — see useTextReveal's groupByPosition), joined by literal
// space text nodes so the browser wraps between them like normal text.
function renderWords(text: string, keyPrefix: string) {
  return text
    .trim()
    .split(/\s+/)
    .map((word, i) => (
      <span key={`${keyPrefix}-${i}`} className={styles.titleWord}>
        {word}
      </span>
    ))
    .reduce<React.ReactNode[]>((acc, el, i) => {
      if (i > 0) acc.push(" ");
      acc.push(el);
      return acc;
    }, []);
}

const ROTATING_PHRASES = [
  "building zero to one.",
  "shaping their visual identity.",
  "finding market fit.",
  "productizing technical edge.",
];

// TIMING is a live-tweak surface for both the entrance reveal (label/
// headline/subline) and the subline phrase rotation — edit and save to see
// changes via Fast Refresh.
const TIMING = {
  // Entrance — same duration/stagger/ease as SectionIntroduction/
  // WorkCaseStudyRow's title+description reveal, overlapping cascade style
  // (each beat starts before the previous one fully finishes).
  labelStart: 0,
  labelDuration: 0.75,
  titleStart: 0.25,
  titleDuration: 0.75,
  titleStagger: 0.25,
  sublineStart: 1.25,
  sublineDuration: 0.75,
  ease: "power2.out",
  // Phrase rotation — unchanged, but its first `advance()` call is now
  // gated on the subline's own entrance tween finishing (see useTextReveal
  // beat below) instead of firing immediately on mount.
  hold: 1.85,
  slideDuration: 0.185,
  rotateEase: "power2.inOut",
  // -100 = exactly one line-height (clears the clipped .sublineSlot box
  // exactly). Overshot to -130 (30% extra) so it fully clears even with
  // any sub-pixel/line-height mismatch, instead of clipping right at the edge.
  exitYPercent: -120,
};

export default function Hero() {
  const phraseRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const labelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const sublineRef = useRef<HTMLParagraphElement>(null);
  const sublineMediumRef = useRef<HTMLSpanElement>(null);
  const sublineSlotRef = useRef<HTMLSpanElement>(null);
  // Set by the rotation-setup effect below, called by the subline's own
  // entrance-reveal onComplete (useTextReveal beat) so the crossfade loop
  // never starts before the subline has finished fading in.
  const startRotationRef = useRef<() => void>(() => {});

  // Toggles .sublineWrapped (an 8px top margin) on sublineSlot when it and
  // sublineMedium have wrapped onto separate lines — plain inline wrapping
  // has no gap of its own, only whatever the line-height provides.
  useEffect(() => {
    const medium = sublineMediumRef.current;
    const slot = sublineSlotRef.current;
    if (!medium || !slot) return;

    const checkWrap = () => {
      // Zero-tolerance comparison false-positived: .sublineSlot (inline-grid)
      // baseline-aligns slightly differently than medium's plain inline text,
      // so their offsetTops differ by a few px even on the same visual line.
      // A real wrap moves slot a full line-height down — half that is a safe
      // cutoff between "baseline mismatch" and "actually wrapped."
      const wrapped = slot.offsetTop - medium.offsetTop > slot.offsetHeight / 2;
      slot.classList.toggle(styles.sublineWrapped, wrapped);
      medium.classList.toggle(styles.sublineMediumWrapped, wrapped);
    };

    checkWrap();
    const observer = new ResizeObserver(checkWrap);
    observer.observe(sublineRef.current!);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const els = phraseRefs.current.filter((el): el is HTMLSpanElement => !!el);
    if (els.length < 2) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      if (reduceMotion) {
        gsap.set(els, { autoAlpha: 0, yPercent: 0 });
        gsap.set(els[0], { autoAlpha: 1 });
        return;
      }

      // All phrases start parked one line below, hidden; phrase 0 is pulled
      // into place immediately (visible once the subline itself has faded
      // in, no animation needed for it).
      gsap.set(els, { autoAlpha: 0, yPercent: 100 });
      gsap.set(els[0], { autoAlpha: 1, yPercent: 0 });

      let index = 0;
      let cancelled = false;
      // gsap.context() only tracks animations created during its own
      // synchronous callback — these later, async (onComplete-triggered)
      // timelines are NOT auto-tracked, so ctx.revert() alone can't kill
      // them. Track + kill the in-flight one explicitly on cleanup instead.
      let currentTl: gsap.core.Timeline | null = null;

      // One transition built at a time (not one big repeating timeline) —
      // each step is fully self-contained and explicit about start/end
      // state, so nothing carries over ambiguously between cycles.
      const advance = () => {
        if (cancelled) return;
        const current = els[index];
        const next = els[(index + 1) % els.length];

        currentTl = gsap
          .timeline({
            delay: TIMING.hold,
            defaults: {
              duration: TIMING.slideDuration,
              ease: TIMING.rotateEase,
            },
            onComplete: () => {
              index = (index + 1) % els.length;
              advance();
            },
          })
          .to(current, { yPercent: TIMING.exitYPercent })
          .fromTo(
            next,
            { autoAlpha: 0, yPercent: 100 },
            { autoAlpha: 1, yPercent: 0 },
          );
      };

      startRotationRef.current = advance;

      return () => {
        cancelled = true;
        currentTl?.kill();
      };
    });

    return () => ctx.revert();
  }, []);

  useTextReveal({
    ease: TIMING.ease,
    beats: [
      {
        ref: labelRef,
        start: TIMING.labelStart,
        duration: TIMING.labelDuration,
      },
      {
        ref: titleRef,
        childSelector: `.${styles.titleWord}`,
        start: TIMING.titleStart,
        duration: TIMING.titleDuration,
        stagger: TIMING.titleStagger,
        groupByPosition: true,
      },
      {
        ref: sublineRef,
        start: TIMING.sublineStart,
        duration: TIMING.sublineDuration,
        onComplete: () => startRotationRef.current(),
      },
    ],
  });

  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <div className={styles.topGroup}>
          <div ref={labelRef} className={styles.labelRow}>
            <span className={styles.icon} aria-hidden="true">
              <Image src="/icons/happy.svg" alt="" width={32} height={32} />
            </span>
            <Label size="2xl" color="secondary">
              PRODUCT BUILDER
            </Label>
          </div>
          <div className={styles.headlineGroup}>
            <Title size="xl" color="primary" className={styles.headline}>
              <span ref={titleRef}>
                {HEADLINE_LINES.map((line, i) => (
                  <span key={line.text}>
                    {i > 0 &&
                      (line.breakBefore ? (
                        <>
                          {" "}
                          <br className={styles[`break-${line.breakBefore}`]} />
                        </>
                      ) : (
                        " "
                      ))}
                    {line.prefix && (
                      <span className={styles.headlinePrefix}>
                        {renderWords(line.prefix, `prefix-${i}`)}{" "}
                      </span>
                    )}
                    {renderWords(line.text, `text-${i}`)}
                  </span>
                ))}
              </span>
            </Title>
            <Block
              size="2xl"
              color="tertiary"
              ref={sublineRef}
              className={styles.subline}
            >
              <span ref={sublineMediumRef} className={styles.sublineMedium}>
                Startups
              </span>{" "}
              <span ref={sublineSlotRef} className={styles.sublineSlot}>
                {ROTATING_PHRASES.map((phrase, i) => (
                  <span
                    key={phrase}
                    ref={(el) => {
                      phraseRefs.current[i] = el;
                    }}
                    className={`${styles.sublineEmphasis}${i === 0 ? ` ${styles.sublineActive}` : ""}`}
                  >
                    {phrase}
                  </span>
                ))}
              </span>
            </Block>
          </div>
        </div>
        {/* <div className={styles.buttonRow}>
          <Button
            variant="primary"
            size="large"
            href="/#work"
            icon={
              // Inlined from /icons/arrow_downward.svg (not <img src>) — currentColor
              // resolves from the icon badge's own color, same convention as
              // SoftwareExperienceEmbed's go-arrow CTA icon.
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <mask
                  id="arrow-downward-mask"
                  style={{ maskType: "alpha" }}
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="32"
                  height="32"
                >
                  <rect width="32" height="32" fill="#D9D9D9" />
                </mask>
                <g mask="url(#arrow-downward-mask)">
                  <path
                    d="M14.6663 5.33301V21.5663L7.19967 14.0997L5.33301 15.9997L15.9997 26.6663L26.6663 15.9997L24.7997 14.0997L17.333 21.5663V5.33301H14.6663Z"
                    fill="currentColor"
                  />
                </g>
              </svg>
            }
          >
            Work
          </Button>
          <Button
            variant="secondary"
            size="large"
            href="mailto:edgar.sanchez9215@gmail.com"
          >
            Contact
          </Button>
        </div> */}
      </div>
    </section>
  );
}
