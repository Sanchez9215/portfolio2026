"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Label from "@/components/Label";
import annotationStyles from "../AnnotationCallout.module.css";
import MountainTerrain, { DEFAULT_LINES, getSamples } from "./MountainTerrain";
import { PRIORITY_ITEMS } from "./priorityItems";
import {
  SUMMIT,
  project,
  ringLoop,
  terrainMax,
} from "./priorityRingsGeometry";
import {
  COLS,
  FAR,
  HORIZON,
  NEAR_BASE,
  PEAK_PX,
  PLANE_HALF_WIDTH,
  heightAt,
} from "./terrain";
import { scheduleScrollTriggerRefresh } from "./scrollTriggerRefresh";
import styles from "./PriorityMountain.module.css";

gsap.registerPlugin(ScrollTrigger);

// The ridgeline mountain (MountainTerrain) with the product priorities as
// callouts at different altitudes: the MVP items near the summit, the post-MVP
// items lower down and fading. Each callout's pointer ends on the mountain's
// flank at its altitude (the side of the contour at that height). Pinned
// (sticky) stage: as you scroll, each callout draws in, summit first. The host
// section (page CSS) is a size container and defines --mountain-box-h; the
// summit marker lives in the section (not the sticky stage) so PageCenterLine
// can end there — at the top of the "MVP" label, which sits 32px above the peak.
// Look numbers below are first-pass tunables.

// The canvas is 16:9 and projects the terrain from fractions of its size, so a
// 1280x720 box lines the overlay up with it.
const BOX = { w: 1280, h: 720 };

// The MVP area: a box around the summit (box units, measured off the reference
// mock). The MVP items' pointers end inside it, spread across its width and
// height; the terrain's lines stay solid grey-500 down to its bottom edge.
const MVP_BOX = { halfWidth: 36, above: 9, below: 60 };
// Callout columns (box units): card width, the edge facing the mountain, the gap
// before the pointer starts, and the vertical span the cards' title lines are
// spread over. Even items go left, odd items right.
const CARD_WIDTH = 200;
const LEFT_EDGE = 310;
const RIGHT_EDGE = 970;
const POINTER_GAP = 8;
const CARD_TOP = 40;
const CARD_BOTTOM = 640;
// Scroll timeline, in item steps: each item takes one step; the tail holds the
// finished figure.
const TAIL_STEPS = 1;

// Upper envelope of the drawn ridges in box units: for each whole x, the
// highest (smallest y) the lines reach, i.e. the mountain's visible outline,
// laid out exactly as MountainTerrain draws it.
function mountainOutline() {
  const { rows, max } = getSamples(DEFAULT_LINES);
  const env = new Float32Array(BOX.w + 1).fill(Infinity);
  rows.forEach((row, r) => {
    const t = r / (DEFAULT_LINES - 1);
    const scale = 1 / (1 + t * FAR);
    const baselineY = BOX.h * (HORIZON + (NEAR_BASE - HORIZON) * scale);
    const lift = (BOX.h * PEAK_PX * scale) / max;
    const halfWidth = BOX.w * PLANE_HALF_WIDTH * scale;
    for (let c = 0; c < COLS - 1; c++) {
      const x0 = BOX.w / 2 + ((c / (COLS - 1)) * 2 - 1) * halfWidth;
      const x1 = BOX.w / 2 + (((c + 1) / (COLS - 1)) * 2 - 1) * halfWidth;
      const y0 = baselineY - row[c] * lift;
      const y1 = baselineY - row[c + 1] * lift;
      for (let x = Math.ceil(x0); x <= Math.floor(x1); x++) {
        const y = y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
        if (x >= 0 && x <= BOX.w && y < env[x]) env[x] = y;
      }
    }
  });
  return env;
}

// Walks from a card toward its target and stops OUTSIDE the mountain, a fixed
// POINTER_GAP from the outline, so every pointer ends the same distance away.
function stopShortOfMountain(
  env: Float32Array,
  from: { x: number; y: number },
  to: { x: number; y: number },
) {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  const reach = Math.ceil(POINTER_GAP);
  // A card that already sits against/over the outline (the low ones, in front
  // of the foothills) has no clear approach: end the pointer the same gap short
  // of its own target on the flank instead.
  const startsAtMountain = env.some(
    (y, x) => y !== Infinity && Math.hypot(x - from.x, y - from.y) <= POINTER_GAP,
  ) || from.y >= env[Math.round(from.x)];
  if (startsAtMountain) {
    const back = Math.max(length - POINTER_GAP, 0) / length;
    return {
      x: from.x + (to.x - from.x) * back,
      y: from.y + (to.y - from.y) * back,
    };
  }
  for (let d = 0; d <= length; d += 1) {
    const p = {
      x: from.x + ((to.x - from.x) * d) / length,
      y: from.y + ((to.y - from.y) * d) / length,
    };
    for (let x = Math.max(0, Math.floor(p.x) - reach); x <= Math.min(BOX.w, Math.ceil(p.x) + reach); x++) {
      if (env[x] === Infinity) continue;
      const inside = x === Math.round(p.x) && p.y >= env[x];
      if (inside || Math.hypot(x - p.x, env[x] - p.y) <= POINTER_GAP) return p;
    }
  }
  return to;
}

const pct = (value: number, total: number) =>
  `${((value / total) * 100).toFixed(3)}%`;

export default function PriorityMountain() {
  const stageRef = useRef<HTMLDivElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);

  const { items, tipFraction, mvpBottomFraction } = useMemo(() => {
    const summit = project(
      SUMMIT,
      heightAt(SUMMIT.x, SUMMIT.z) / terrainMax(),
      BOX.w,
      BOX.h,
    );
    const mvp = {
      left: summit.x - MVP_BOX.halfWidth,
      right: summit.x + MVP_BOX.halfWidth,
      top: summit.y - MVP_BOX.above,
      bottom: summit.y + MVP_BOX.below,
    };
    const outline = mountainOutline();
    const perSide = [
      PRIORITY_ITEMS.filter((_, n) => n % 2 === 0).length,
      PRIORITY_ITEMS.filter((_, n) => n % 2 === 1).length,
    ];
    const items = PRIORITY_ITEMS.map((item, n) => {
      const isLeft = n % 2 === 0;
      const slot = Math.floor(n / 2);
      const count = perSide[isLeft ? 0 : 1];
      const cardY = CARD_TOP + (slot * (CARD_BOTTOM - CARD_TOP)) / (count - 1);
      // MVP items end inside the MVP box: the k-th of the side's MVP items
      // steps down the box's height and in from its outer edge, so the ends
      // spread across both. The rest end on the flank at their altitude.
      let target: { x: number; y: number };
      if (item.opacity === 1) {
        const mvpOnSide = PRIORITY_ITEMS.filter(
          (other, m) => other.opacity === 1 && m % 2 === n % 2,
        );
        const t = slot / (mvpOnSide.length - 1);
        target = {
          x: isLeft
            ? mvp.left + t * MVP_BOX.halfWidth
            : mvp.right - t * MVP_BOX.halfWidth,
          y: mvp.top + t * (mvp.bottom - mvp.top),
        };
      } else {
        const points = (ringLoop(item.level) ?? []).map((p) =>
          project(p, item.level, BOX.w, BOX.h),
        );
        target = points.reduce(
          (a, b) => ((isLeft ? b.x < a.x : b.x > a.x) ? b : a),
          points[0],
        );
      }
      const startX = isLeft ? LEFT_EDGE + POINTER_GAP : RIGHT_EDGE - POINTER_GAP;
      return {
        ...item,
        isLeft,
        cardY,
        pointer: (() => {
          const end = stopShortOfMountain(outline, { x: startX, y: cardY }, target);
          return `M${startX} ${cardY}L${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
        })(),
      };
    });
    return {
      items,
      tipFraction: summit.y / BOX.h,
      mvpBottomFraction: mvp.bottom / BOX.h,
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const runway = runwayRef.current;
    if (!stage || !runway) return;
    const q = gsap.utils.selector(stage);
    const pinnedBottom = () =>
      parseFloat(getComputedStyle(stage).top) + stage.offsetHeight;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(q("[data-pointer]"), { strokeDashoffset: 0 });
        gsap.set(q("[data-followups]"), { opacity: 1 });
        items.forEach((item, n) =>
          gsap.set(q(`[data-card="${n}"]`), { opacity: 1 }),
        );
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // The stage sticks when the runway's top reaches the stage's bottom
        // edge (sticky top + height); the runway is exactly the scroll the
        // timeline plays over.
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: runway,
            start: () => `top ${pinnedBottom()}px`,
            end: () => `bottom ${pinnedBottom()}px`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
        items.forEach((item, n) => {
          tl.to(
            q(`[data-pointer="${n}"]`),
            { strokeDashoffset: 0, duration: 0.3 },
            n,
          );
          tl.to(
            q(`[data-card="${n}"]`),
            { opacity: 1, duration: 0.4 },
            n + 0.15,
          );
        });
        // The "Follow Ups" divider comes in with the first item after the MVP.
        const firstFollowUp = items.findIndex((item) => item.opacity < 1);
        tl.to(
          q("[data-followups]"),
          { opacity: 1, duration: 0.4 },
          Math.max(firstFollowUp, 0),
        );
        tl.to({}, { duration: TAIL_STEPS }, items.length);
      });
    }, stage);
    scheduleScrollTriggerRefresh();
    return () => ctx.revert();
  }, [items]);

  return (
    <>
      <span
        data-priority-summit
        className={styles.summit}
        style={{
          top: `calc(var(--spacing-5xl) + var(--mountain-box-h) * ${tipFraction.toFixed(4)} - var(--mountain-label-offset))`,
        }}
        aria-hidden
      />
      <div ref={stageRef} className={styles.stage}>
        <div className={styles.terrain}>
          <MountainTerrain solidUntil={mvpBottomFraction} />
        </div>
        <div
          className={styles.peakLabel}
          style={{ top: `calc(${(tipFraction * 100).toFixed(3)}% - var(--mountain-label-offset))` }}
        >
          <Label size="md">MVP</Label>
        </div>
        <div
          data-followups
          className={styles.followUpsLabel}
          style={{ top: `${(mvpBottomFraction * 100).toFixed(3)}%`, opacity: 0 }}
        >
          <Label size="md">Follow Ups</Label>
          <span className={styles.followUpsLine} />
        </div>
        <svg
          className={styles.svg}
          viewBox={`0 0 ${BOX.w} ${BOX.h}`}
          fill="none"
          aria-hidden="true"
        >
          {items.map((item, n) => (
            <path
              key={item.title}
              data-pointer={n}
              className={`${styles.pointer} ${item.opacity < 1 ? styles.followUp : ""}`}
              d={item.pointer}
              pathLength={1}
              style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
            />
          ))}
        </svg>
        {items.map((item, n) => (
          <div
            key={item.title}
            data-card={n}
            className={`${styles.card} ${item.opacity < 1 ? styles.followUp : ""}`}
            style={{
              opacity: 0,
              top: `calc(${pct(item.cardY, BOX.h)} - 12px)`,
              width: pct(CARD_WIDTH, BOX.w),
              ...(item.isLeft
                ? { right: pct(BOX.w - LEFT_EDGE, BOX.w), textAlign: "right" }
                : { left: pct(RIGHT_EDGE, BOX.w) }),
            }}
          >
            <span className={annotationStyles.title}>{item.title}</span>
            <p className={styles.body}>{item.body}</p>
          </div>
        ))}
      </div>
      <div ref={runwayRef} className={styles.runway} aria-hidden />
    </>
  );
}
