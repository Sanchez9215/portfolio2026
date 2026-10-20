"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  USAGE_BEAM_EYE_EVENT,
  USAGE_BEAM_PROGRESS_EVENT,
  type UsageBeamEyeDetail,
  type UsageBeamProgressDetail,
} from "./usageBeamEvent";

gsap.registerPlugin(ScrollTrigger);

// Entrance: once the text beside the squares finishes revealing, they fade and
// scale in one by one in a random order (start times spread over STAGGER_TOTAL
// seconds, each taking SQUARE_IN seconds). Then the Framework Adaptation eye
// fires its beam (reach), and as it gets to each square, the squares go from
// solid grey-500 (how they load in) to surface-black for the good ones and solid
// red for the unused (fade). One timeline plays forward on scroll down and reverses on
// scroll up.
const STAGGER_TOTAL_SECONDS = 0.5;
const SQUARE_IN_SECONDS = 0.75;
const BEAM_REACH_SECONDS = 1.25;
const CELL_FADE_SECONDS = 0.4;
// The whole sequence — squares in, beam out, colours settled — plays in this
// long going in, and takes the same going back out on scroll up. The seconds
// above set the proportions between the steps; this scales all of it.
const TOTAL_SECONDS = 0.5;

// Sits right after SquareGrid.
export default function UsageBeamReveal() {
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const grid = markerRef.current
      ?.previousElementSibling as HTMLElement | null;
    const text = grid?.previousElementSibling;
    if (!grid || !text) return;

    const cells = Array.from(grid.children) as HTMLElement[];
    const unusedCells = cells.filter((cell) => cell.dataset.unused === "true");
    const rootStyle = getComputedStyle(grid);
    const grey = rootStyle.getPropertyValue("--color-grey-500").trim();
    const base = rootStyle.getPropertyValue("--surface-base").trim();
    const red = rootStyle.getPropertyValue("--accent-warning").trim();
    const goodCells = cells.filter((cell) => cell.dataset.unused !== "true");
    // End state for a cell: the good ones go black, the unused go red.
    const settled = (cell: HTMLElement) =>
      cell.dataset.unused === "true" ? red : base;

    const sendProgress = (progress: number) => {
      const rect = grid.getBoundingClientRect();
      const detail: UsageBeamProgressDetail = {
        progress,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        // Half the diagonal (+1px for the outline) so the base covers every corner.
        coverRadius: Math.hypot(rect.width, rect.height) / 2 + 1,
      };
      window.dispatchEvent(
        new CustomEvent(USAGE_BEAM_PROGRESS_EVENT, { detail }),
      );
    };

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const ctx = gsap.context(() => {
      gsap.set(cells, { "--cell": grey });

      if (reduced) {
        // No animation: jump between the two end states.
        ScrollTrigger.create({
          trigger: text,
          start: "center center",
          onEnter: () => {
            gsap.set(unusedCells, { "--cell": red });
            gsap.set(goodCells, { "--cell": base });
            sendProgress(1);
          },
          onLeaveBack: () => {
            gsap.set(cells, { "--cell": grey });
            sendProgress(0);
          },
        });
        return;
      }

      gsap.set(cells, { opacity: 0, scale: 0.5 });
      const reach = { value: 0 };
      const timeline = gsap.timeline({ paused: true });
      timeline.to(
        cells,
        {
          opacity: 1,
          scale: 1,
          duration: SQUARE_IN_SECONDS,
          ease: "power2.out",
          stagger: { amount: STAGGER_TOTAL_SECONDS, from: "random" },
        },
        0,
      );
      const beamStart = STAGGER_TOTAL_SECONDS + SQUARE_IN_SECONDS;
      timeline.to(
        reach,
        {
          value: 1,
          duration: BEAM_REACH_SECONDS,
          ease: "sine.out", // gentler than power2: no hard start or stop
          onUpdate: () => sendProgress(reach.value),
        },
        beamStart,
      );

      // Each square's change (grey → black or red) is timed to the beam's reach, spreading out from
      // the eye — built the first time we enter, once the eye can answer where
      // its pupil is.
      let coralBuilt = false;
      const buildCoral = () => {
        if (coralBuilt) return;
        coralBuilt = true;
        let eye: { x: number; y: number } | null = null;
        const detail: UsageBeamEyeDetail = {
          respond: (point) => (eye = point),
        };
        window.dispatchEvent(new CustomEvent(USAGE_BEAM_EYE_EVENT, { detail }));
        const rect = grid.getBoundingClientRect();
        // If no eye answers, spread from below the square.
        const origin: { x: number; y: number } = eye ?? {
          x: rect.left + rect.width / 2,
          y: rect.bottom + 1000,
        };
        const distances = cells.map((cell) => {
          const r = cell.getBoundingClientRect();
          return Math.hypot(
            r.left + r.width / 2 - origin.x,
            r.top + r.height / 2 - origin.y,
          );
        });
        const nearest = Math.min(...distances);
        const span = Math.max(...distances) - nearest || 1;
        cells.forEach((cell, index) => {
          timeline.to(
            cell,
            {
              "--cell": settled(cell),
              duration: CELL_FADE_SECONDS,
              ease: "none",
            },
            beamStart +
              (BEAM_REACH_SECONDS * (distances[index] - nearest)) / span,
          );
        });
      };

      ScrollTrigger.create({
        trigger: text,
        // The text's own reveal ends here; the squares start the moment it does.
        start: "center center",
        onEnter: () => {
          buildCoral();
          timeline.timeScale(timeline.duration() / TOTAL_SECONDS);
          timeline.play();
        },
        onLeaveBack: () => timeline.reverse(),
      });
    });

    return () => {
      ctx.revert();
      sendProgress(0);
    };
  }, []);

  return <span ref={markerRef} hidden aria-hidden="true" />;
}
