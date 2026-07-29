"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LabelBlock from "@/components/LabelBlock";
import Block from "@/components/Block";
import styles from "./LifecycleTimelineScene.module.css";

gsap.registerPlugin(ScrollTrigger);

// Scroll-stay standard for a pinned "hold for legibility" beat — matches the
// 500px hold used for LABEL_HOLD/METRIC_HOLD/QUOTE_HOLD in
// TheProblemPinnedScene.
// Used here both before the words start revealing (letting the LabelBlock's
// own reveal settle) and at the end, before the pin releases.
const PIN_HOLD_LEGIBILITY = 500;

// The 4 words (What/When/Why/Who) fade in one by one once the LabelBlock
// above has finished its own scroll-in reveal.
const WORD_FADE_DURATION = 150;
const WORD_FADE_STAGGER = 75;
const WORD_COUNT = 4;
const WORDS_LENGTH = WORD_FADE_DURATION + (WORD_COUNT - 1) * WORD_FADE_STAGGER;

// The "Who?" description fades in as its own beat after all 4 words finish.
const DESCRIPTION_FADE_DELAY = 100;
const DESCRIPTION_FADE_DURATION = 150;

const RUNWAY =
  PIN_HOLD_LEGIBILITY +
  WORDS_LENGTH +
  DESCRIPTION_FADE_DELAY +
  DESCRIPTION_FADE_DURATION +
  PIN_HOLD_LEGIBILITY;

const LIFECYCLE_TIMELINE_LABEL = "Lifecycle Timeline";
const LIFECYCLE_TIMELINE_BODY =
  "A single source of truth for key events across an asset's operational life, giving teams visibility into...";
const WHO_DESCRIPTION =
  "...without needing to piece together data from disconnected systems.";

export default function LifecycleTimelineScene({
  className,
}: {
  className?: string;
}) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const whatRef = useRef<HTMLParagraphElement>(null);
  const whenRef = useRef<HTMLParagraphElement>(null);
  const whyRef = useRef<HTMLParagraphElement>(null);
  const whoRef = useRef<HTMLParagraphElement>(null);
  const whoDescRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const sceneEl = sceneRef.current;
    const wordEls = [whatRef.current, whenRef.current, whyRef.current, whoRef.current];
    const whoDescEl = whoDescRef.current;
    if (!sceneEl || wordEls.some((el) => !el) || !whoDescEl) return;

    sceneEl.style.height = `calc(100vh + ${RUNWAY}px)`;

    const ctx = gsap.context(() => {
      gsap.set(wordEls, { opacity: 0, y: 16 });
      gsap.set(whoDescEl, { opacity: 0, y: 12 });

      void sceneEl.offsetHeight;
      ScrollTrigger.refresh();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sceneEl,
          start: "top top",
          end: `+=${RUNWAY}`,
          scrub: true,
        },
      });

      tl.to(
        wordEls,
        {
          opacity: 1,
          y: 0,
          duration: WORD_FADE_DURATION,
          stagger: WORD_FADE_STAGGER,
          ease: "none",
        },
        PIN_HOLD_LEGIBILITY,
      )
        .to(
          whoDescEl,
          {
            opacity: 1,
            y: 0,
            duration: DESCRIPTION_FADE_DURATION,
            ease: "none",
          },
          `>+=${DESCRIPTION_FADE_DELAY}`,
        )
        .to({}, { duration: PIN_HOLD_LEGIBILITY });
    }, sceneEl);

    return () => ctx.revert();
  }, []);

  return (
    <div className={`${styles.scene}${className ? ` ${className}` : ""}`} ref={sceneRef}>
      <div className={styles.stage}>
        <LabelBlock
          className={styles.textBlock}
          size="display"
          label={LIFECYCLE_TIMELINE_LABEL}
          body={LIFECYCLE_TIMELINE_BODY}
        />
        <div className={styles.wordsWrapper}>
          <div className={styles.item}>
            <p className={styles.word} ref={whatRef}>
              What?
            </p>
          </div>
          <div className={styles.item}>
            <p className={styles.word} ref={whenRef}>
              When?
            </p>
          </div>
          <div className={styles.item}>
            <p className={styles.word} ref={whyRef}>
              Why?
            </p>
          </div>
          <div className={styles.item}>
            <p className={styles.word} ref={whoRef}>
              Who?
            </p>
            <Block size="lg" color="secondary" ref={whoDescRef}>
              {WHO_DESCRIPTION}
            </Block>
          </div>
        </div>
      </div>
    </div>
  );
}
