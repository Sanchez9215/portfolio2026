"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface TextRevealBeat {
  ref: React.RefObject<HTMLElement | null>;
  /** If set, staggers this selector's matched children instead of animating ref itself (e.g. one span per line). */
  childSelector?: string;
  start: number;
  duration: number;
  stagger?: number;
  /**
   * Groups childSelector targets by rendered offsetTop before staggering, so
   * multiple targets that wrap onto the same visual line animate together
   * as one beat instead of each firing individually in DOM order. Needed
   * when a single visual line is split across several DOM nodes (e.g.
   * responsive <br>-driven line breaks) and the intent is "stagger by
   * line," not "stagger by node."
   */
  groupByPosition?: boolean;
  onComplete?: () => void;
}

export interface UseTextRevealOptions {
  beats: TextRevealBeat[];
  ease?: string;
  trigger?: "mount" | "scroll";
  scrollTriggerRef?: React.RefObject<HTMLElement | null>;
  scrollStart?: string;
  once?: boolean;
}

// Shared entrance choreography — fade + translateY(24px)->0, staggered per
// beat's own duration/stagger. Mirrors the pattern SectionIntroduction and
// WorkCaseStudyRow each hand-rolled independently: consumers still own their
// own CSS hidden-state (opacity:0; transform:translateY(24px)) and TIMING
// object, this hook just runs the gsap.context/timeline plumbing once.
export function useTextReveal({
  beats,
  ease = "power2.out",
  trigger = "mount",
  scrollTriggerRef,
  scrollStart = "top 80%",
  once = true,
}: UseTextRevealOptions) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const elements = beats.map((beat) => beat.ref.current);
    if (elements.some((el) => !el)) return;
    if (trigger === "scroll" && !scrollTriggerRef?.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        paused: trigger === "scroll",
        defaults: { ease },
        ...(trigger === "scroll"
          ? {
              scrollTrigger: {
                trigger: scrollTriggerRef!.current!,
                start: scrollStart,
                once,
              },
            }
          : {}),
      });

      beats.forEach((beat) => {
        const el = beat.ref.current!;
        const targets = beat.childSelector
          ? el.querySelectorAll(beat.childSelector)
          : el;

        let stagger: number | ((i: number) => number) | undefined = beat.stagger;
        if (beat.groupByPosition && beat.stagger != null && targets instanceof NodeList) {
          const targetEls = Array.from(targets) as HTMLElement[];
          const lineTops: number[] = [];
          const lineIndexByTarget = targetEls.map((target) => {
            let index = lineTops.findIndex(
              (top) => Math.abs(top - target.offsetTop) < 2,
            );
            if (index === -1) {
              lineTops.push(target.offsetTop);
              index = lineTops.length - 1;
            }
            return index;
          });
          stagger = (i: number) => lineIndexByTarget[i] * beat.stagger!;
        }

        tl.to(
          targets,
          {
            opacity: 1,
            y: 0,
            duration: beat.duration,
            stagger,
            onComplete: beat.onComplete,
          },
          beat.start,
        );
      });
    });

    return () => ctx.revert();
  }, [beats, ease, trigger, scrollTriggerRef, scrollStart, once]);
}
