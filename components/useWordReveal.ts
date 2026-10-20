"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

// Same word-by-word color reveal as LabelBlock's display text: words start in a
// faint color blended into the background and scrub to the element's own color
// as it scrolls into view. Colors are resolved to real values up front because
// GSAP can't tween to a raw `var(--token)` string.
const WORD_DURATION = 0.25;
const WORD_STAGGER = 0.04;

export function useWordReveal(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;

    const startColor = getComputedStyle(el)
      .getPropertyValue("--color-grey-1000")
      .trim();
    const endColor = getComputedStyle(el).color;

    let split: InstanceType<typeof SplitText> | null = null;
    const ctx = gsap.context(() => {
      split = new SplitText(el, { type: "words", wordsClass: "labelBlockWord" });
      gsap.set(split.words, { color: startColor });

      // SplitText just reflowed this text — force a layout read so
      // ScrollTrigger measures the settled result.
      void el.offsetHeight;
      ScrollTrigger.refresh();

      gsap.to(split.words, {
        color: endColor,
        duration: WORD_DURATION,
        stagger: WORD_STAGGER,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top 67%",
          end: "center center",
          scrub: true,
        },
      });
    });

    return () => {
      ctx.revert();
      split?.revert();
    };
  }, [ref, enabled]);
}
