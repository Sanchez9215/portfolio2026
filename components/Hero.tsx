/**
 * Hero — home page hero section
 *
 * Built from Figma node 214:7415 ("Section", Portfolio Cleaning file).
 * Tokens: --button-*, --text-label-2xl-*, --text-title-xl-*, --text-body-2xl-*
 * (styles/globals.css); Label/Title/Block reused for all text.
 *
 * Headline line breaks are explicitly authored (Figma's own <br> positions),
 * rendered via CSS white-space:pre-line — not auto-wrap.
 *
 * Subline's emphasis clause rotates through ROTATING_PHRASES (fade+translateY
 * crossfade loop, GSAP). Block has no inline-weight-mixing support yet, so
 * this is a Hero-scoped span override rather than a Block API change.
 * Respects prefers-reduced-motion (shows the first phrase, static, no loop).
 */

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Label from "./Label";
import Title from "./Title";
import Block from "./Block";
import Button from "./Button";
import styles from "./Hero.module.css";

const ROTATING_PHRASES = [
  "building zero to one.",
  "establishing their digital presence.",
  "finding product-market fit.",
];

// TIMING is a live-tweak surface for the subline phrase rotation only —
// edit and save to see changes via Fast Refresh.
const TIMING = {
  hold: 1.85,
  slideDuration: 0.185,
  ease: "power2.inOut",
  // -100 = exactly one line-height (clears the clipped .sublineSlot box
  // exactly). Overshot to -130 (30% extra) so it fully clears even with
  // any sub-pixel/line-height mismatch, instead of clipping right at the edge.
  exitYPercent: -120,
};

export default function Hero() {
  const phraseRefs = useRef<(HTMLSpanElement | null)[]>([]);

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
      // into place immediately (visible on load, no animation needed for it).
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
            defaults: { duration: TIMING.slideDuration, ease: TIMING.ease },
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

      advance();

      return () => {
        cancelled = true;
        currentTl?.kill();
      };
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <div className={styles.topGroup}>
          <div className={styles.labelRow}>
            <span className={styles.icon} aria-hidden="true">
              <img src="/icons/happy.svg" alt="" width={32} height={32} />
            </span>
            <Label size="2xl" color="secondary">
              PRODUCT BUILDER
            </Label>
          </div>
          <div className={styles.headlineGroup}>
            <Title size="xl" color="primary" className={styles.headline}>
              {
                "Specializing in Data-Rich \nB2B Systems Driving \nHigh-Stakes Decisions."
              }
            </Title>
            <Block size="2xl" color="tertiary">
              <span className={styles.sublineMedium}>Early-stage startups</span>{" "}
              <span className={styles.sublineSlot}>
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
        <div className={styles.buttonRow}>
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
        </div>
      </div>
    </section>
  );
}
