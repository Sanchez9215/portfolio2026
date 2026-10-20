"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Label from "@/components/Label";
import Block from "@/components/Block";
import styles from "./BridgeOpener.module.css";
import { BRIDGE_TIP_VIEWPORT_POSITION } from "./bridgeScroll";
import {
  BURST_RAYS,
  BURST_RAY_STROKE_WIDTH,
  BURST_VIEWBOX,
} from "./bridge-burst-rays";
import { scheduleScrollTriggerRefresh } from "./scrollTriggerRefresh";

gsap.registerPlugin(ScrollTrigger);

// Rays light counter-clockwise ("backwards"), starting at the bottom-right ray
// beside the gap at the bottom and ending at the bottom-left ray beside it. The
// data runs clockwise from the top ray, so that start is the last ray before
// the gap (index 15 of 31) and the sweep walks the indices backwards, wrapping.
const RAY_SWEEP_START = Math.floor(BURST_RAYS.length / 2);
const RAY_SWEEP_ORDER = BURST_RAYS.map(
  (_, step) =>
    (RAY_SWEEP_START - step + BURST_RAYS.length) % BURST_RAYS.length
);

// Each list title / item fades in as the line tip reaches its centre.
const REVEAL_FADE_SECONDS = 0.3;

// Order is the agreed logical order (Own → Used → Cost → Compliant), matching Figma 2394:1464.
const FUNDAMENTAL_QUESTIONS = [
  "What do we own?",
  "How is it used?",
  "What does it cost?",
  "Are we compliant?",
];

// SAM first, per the agreed role order (Figma 2394:1463).
const CORE_ROLES = [
  "Software Asset Manager",
  "Financial Specialist",
  "IT Operations Manager",
];

// Figma node 2385:958 — the bridge's opener: burst backdrop, framing question,
// and the two lists hanging off the spine. The spine itself is drawn by
// BridgeSpine at the section level so it can run continuously past this block.
export default function BridgeOpener() {
  const rootRef = useRef<HTMLDivElement>(null);
  const burstRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // DOM order is reading order: question titles/items, then the roles.
    const items = root.querySelectorAll<HTMLElement>(`.${styles.reveal}`);
    const burst = burstRef.current;
    const ctx = gsap.context(() => {
      if (burst) {
        // Rays start in the card color and light to grey-500 as the burst
        // scrolls in. Token values are read off :root so the tween runs on
        // real colors.
        const rootStyle = getComputedStyle(document.documentElement);
        const from = rootStyle.getPropertyValue("--surface-card").trim();
        const to = rootStyle.getPropertyValue("--color-grey-500").trim();
        const rays = Array.from(burst.querySelectorAll("line"));
        gsap.fromTo(
          RAY_SWEEP_ORDER.map((index) => rays[index]),
          { stroke: from },
          {
            stroke: to,
            ease: "none",
            stagger: { each: 1 },
            duration: 1,
            scrollTrigger: {
              trigger: burst,
              start: "top top",
              endTrigger: root.querySelector("[data-bridge-question]"),
              end: "center center",
              scrub: true,
            },
          }
        );
      }
      items.forEach((el) => {
        const fadeTo = (opacity: number) =>
          gsap.to(el, {
            opacity,
            duration: REVEAL_FADE_SECONDS,
            ease: "none",
            overwrite: true,
          });
        ScrollTrigger.create({
          trigger: el,
          start: `center ${BRIDGE_TIP_VIEWPORT_POSITION}`,
          onEnter: () => fadeTo(1),
          onLeaveBack: () => fadeTo(0),
        });
      });
    }, root);

    scheduleScrollTriggerRefresh();
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className={styles.opener}
      data-bridge-opener="true"
    >
      <div className={styles.burstStage}>
        <svg
          ref={burstRef}
          className={styles.burst}
          viewBox={`0 0 ${BURST_VIEWBOX.width} ${BURST_VIEWBOX.height}`}
          aria-hidden="true"
        >
          {BURST_RAYS.map(([x1, y1, x2, y2], index) => (
            <line
              key={index}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              strokeWidth={BURST_RAY_STROKE_WIDTH}
            />
          ))}
        </svg>
        <div className={styles.question} data-bridge-question="true">
          <Label size="lg">Working Backwards</Label>
          <Block size="2xl" color="secondary">
            What must we know to guarantee zero waste, total compliance, and
            optimized spend?
          </Block>
        </div>
      <div className={styles.questionList}>
        <Label size="lg" className={styles.reveal}>
          The Fundamental Questions
        </Label>
        <ul>
          {FUNDAMENTAL_QUESTIONS.map((question) => (
            <li key={question} className={styles.reveal}>
              <span className={styles.diamond} aria-hidden="true" />
              <Block size="lg">{question}</Block>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.roleList}>
        <Label size="lg" className={styles.reveal}>
          3 roles at the core
        </Label>
        <ul>
          {CORE_ROLES.map((role) => (
            <li key={role} className={styles.reveal}>
              <Block size="lg">{role}</Block>
              <span className={styles.diamond} aria-hidden="true" />
            </li>
          ))}
        </ul>
      </div>
      </div>
    </div>
  );
}
