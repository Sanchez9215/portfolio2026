"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Block from "@/components/Block";
import styles from "@/app/work/software-observability/software-observability.module.css";

gsap.registerPlugin(ScrollTrigger, SplitText);

// Matches LabelBlock's own display-size word-color reveal (LabelBlock.tsx)
// so this heading + Block read as the same reveal beat as every other
// display block in the case study.
const WORD_DURATION = 0.25;
const WORD_STAGGER = 0.04;

export default function DataIntroText() {
  const headingRef = useRef<HTMLParagraphElement>(null);
  const blockRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const headingEl = headingRef.current;
    const blockEl = blockRef.current;
    if (!headingEl || !blockEl) return;

    const startColor = getComputedStyle(headingEl)
      .getPropertyValue("--color-grey-1000")
      .trim();
    const endColor = getComputedStyle(headingEl)
      .getPropertyValue("--color-grey-500")
      .trim();

    let headingSplit: InstanceType<typeof SplitText> | null = null;
    let blockSplit: InstanceType<typeof SplitText> | null = null;

    const ctx = gsap.context(() => {
      headingSplit = new SplitText(headingEl, {
        type: "words",
        wordsClass: "labelBlockWord",
      });
      blockSplit = new SplitText(blockEl, {
        type: "words",
        wordsClass: "labelBlockWord",
      });

      gsap.set(headingSplit.words, { color: startColor });
      gsap.set(blockSplit.words, { color: startColor });

      void headingEl.offsetHeight;
      ScrollTrigger.refresh();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: headingEl,
          start: "top 67%",
          end: "center center",
          scrub: true,
        },
      });

      tl.to(
        headingSplit.words,
        {
          color: endColor,
          duration: WORD_DURATION,
          stagger: WORD_STAGGER,
          ease: "none",
        },
        0,
      );

      tl.to(
        blockSplit.words,
        {
          color: endColor,
          duration: WORD_DURATION,
          stagger: WORD_STAGGER,
          ease: "none",
        },
        ">",
      );
    });

    return () => {
      ctx.revert();
      headingSplit?.revert();
      blockSplit?.revert();
    };
  }, []);

  return (
    <>
      <p ref={headingRef} className={styles.dataHeading}>
        Data<span className={styles.dataTrackedPeriod}>.</span>
        Data<span className={styles.dataTrackedPeriod}>.</span>
        Data
      </p>
      <Block size="lg" ref={blockRef}>
        Each data point represented a building block towards fulfilling
        goals. This was a baseline, not a final spec. As integration work
        progressed and the team learned what data was actually available,
        the model would continue to evolve.
      </Block>
    </>
  );
}
