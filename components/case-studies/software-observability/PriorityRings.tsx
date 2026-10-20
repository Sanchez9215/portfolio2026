"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import annotationStyles from "../AnnotationCallout.module.css";
import { scheduleScrollTriggerRefresh } from "./scrollTriggerRefresh";
import {
  SUMMIT,
  contourLoops,
  project,
  ringLoop,
  terrainMax,
} from "./priorityRingsGeometry";
import { heightAt } from "./terrain";
import { PRIORITY_ITEMS } from "./priorityItems";
import styles from "./PriorityRings.module.css";

gsap.registerPlugin(ScrollTrigger);

// MVP priorities as contour rings of the mountain terrain: ring 1 is the tight
// loop around the summit, each next ring a lower contour. The MVP rings are
// grey-500; the rings after the MVP fade with priority. Pinned (sticky) stage:
// as you scroll, each ring draws in and its callout fades in, centre outward.
// The host section (page CSS) is a size container and defines --ring-box-h; the
// summit marker lives in the section (not the sticky stage) so PageCenterLine
// can end there. Look numbers below are first-pass tunables.

// The terrain is projected on a 1280x800 canvas (as MountainTerrain does); the
// viewBox crops to the terrain with room for the callouts above and below it.
const CANVAS = { w: 1280, h: 800 };
const BOX = { x: 0, y: -10, w: 1280, h: 700 };

const RINGS = PRIORITY_ITEMS;

// Cards fade with their ring but never below this, so the text stays readable.
const CARD_MIN_OPACITY = 0.5;
// Callout columns (box units): card width, the edge facing the terrain, the gap
// before the pointer starts, and the vertical span the cards' title lines are
// spread over. Even rings go left, odd rings right.
const CARD_WIDTH = 300;
const LEFT_EDGE = 330;
const RIGHT_EDGE = 950;
const POINTER_GAP = 8;
const CARD_TOP = 40;
const CARD_BOTTOM = 640;
// The rest of the terrain: faint, unlabelled contours of the low ground (every
// loop at each level, so the foothills and small bumps show), fading in before
// ring 1 draws. Levels = fraction of the terrain's max height.
const GROUND_LEVELS = [0.17, 0.13, 0.09];
const GROUND_OPACITY = 0.2;
const GROUND_MIN_POINTS = 6; // skips specks
// Scroll timeline, in ring steps: each ring takes one step; the tail holds the
// finished figure.
const GROUND_STEPS = 1; // the ground fades in over the first step, rings follow
const TAIL_STEPS = 1;

// Front (nearer, lower on screen) arc of a closed loop between its leftmost and
// rightmost points, as indexes into the loop.
function frontArc(top: { x: number; y: number }[]) {
  const n = top.length;
  let iL = 0;
  let iR = 0;
  top.forEach((p, i) => {
    if (p.x < top[iL].x) iL = i;
    if (p.x > top[iR].x) iR = i;
  });
  const walk = (from: number, to: number) => {
    const out: number[] = [];
    for (let i = from; ; i = (i + 1) % n) {
      out.push(i);
      if (i === to) break;
    }
    return out;
  };
  const a = walk(iL, iR);
  const b = walk(iR, iL).reverse();
  const meanY = (idx: number[]) =>
    idx.reduce((sum, i) => sum + top[i].y, 0) / idx.length;
  return meanY(a) > meanY(b) ? a : b;
}

const toPath = (points: { x: number; y: number }[]) =>
  `M${points.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join("L")}Z`;

const pct = (value: number, total: number, origin = 0) =>
  `${(((value - origin) / total) * 100).toFixed(3)}%`;

export default function PriorityRings() {
  const stageRef = useRef<HTMLDivElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);

  const { rings, ground, tipFraction } = useMemo(() => {
    const perSide = [
      RINGS.filter((_, n) => n % 2 === 0).length,
      RINGS.filter((_, n) => n % 2 === 1).length,
    ];
    const rings = RINGS.map((ring, n) => {
      const isLeft = n % 2 === 0;
      const slot = Math.floor(n / 2);
      const count = perSide[isLeft ? 0 : 1];
      const cardY = CARD_TOP + (slot * (CARD_BOTTOM - CARD_TOP)) / (count - 1);
      const plane = ringLoop(ring.level) ?? [];
      const points = plane.map((p) =>
        project(p, ring.level, CANVAS.w, CANVAS.h),
      );
      // MVP slices get a side wall: the loop's front arc dropped down to the
      // next slice's level, so the slice stands on the one below it.
      const next = RINGS[n + 1];
      let wall = "";
      if (ring.opacity === 1 && next && points.length) {
        const arc = frontArc(points);
        const bottom = arc.map((i) =>
          project(plane[i], next.level, CANVAS.w, CANVAS.h),
        );
        const edge = [...arc.map((i) => points[i]), ...bottom.reverse()];
        wall = toPath(edge);
      }
      const target = points.reduce(
        (a, b) => ((isLeft ? b.x < a.x : b.x > a.x) ? b : a),
        points[0],
      );
      const startX = isLeft ? LEFT_EDGE + POINTER_GAP : RIGHT_EDGE - POINTER_GAP;
      return {
        ...ring,
        isLeft,
        cardY,
        path: toPath(points),
        wall,
        pointer: `M${startX} ${cardY}L${target.x.toFixed(1)} ${target.y.toFixed(1)}`,
        cardOpacity: Math.max(ring.opacity, CARD_MIN_OPACITY),
      };
    });
    const summitY = project(
      SUMMIT,
      heightAt(SUMMIT.x, SUMMIT.z) / terrainMax(),
      CANVAS.w,
      CANVAS.h,
    ).y;
    const ground = GROUND_LEVELS.map((level) =>
      contourLoops(level * terrainMax())
        .filter((c) => c.points.length >= GROUND_MIN_POINTS)
        .map((c) => {
          const d = c.points
            .map((p) => project(p, level, CANVAS.w, CANVAS.h))
            .map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
            .join("L");
          return `M${d}${c.closed ? "Z" : ""}`;
        })
        .join(""),
    );
    return { rings, ground, tipFraction: (summitY - BOX.y) / BOX.h };
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
        gsap.set(q("[data-ring-path], [data-ring-pointer]"), {
          strokeDashoffset: 0,
        });
        gsap.set(q("[data-ring-fill], [data-ring-wall], [data-ground]"), {
          opacity: 1,
        });
        rings.forEach((ring, n) =>
          gsap.set(q(`[data-ring-card="${n}"]`), { opacity: ring.cardOpacity }),
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
        tl.to(q("[data-ground]"), { opacity: 1, duration: GROUND_STEPS }, 0);
        rings.forEach((ring, n) => {
          const at = GROUND_STEPS + n;
          tl.to(
            q(`[data-ring-path="${n}"]`),
            { strokeDashoffset: 0, duration: 0.6 },
            at,
          );
          tl.to(
            q(`[data-ring-fill="${n}"], [data-ring-wall="${n}"]`),
            { opacity: 1, duration: 0.6 },
            at,
          );
          tl.to(
            q(`[data-ring-pointer="${n}"]`),
            { strokeDashoffset: 0, duration: 0.25 },
            at + 0.45,
          );
          tl.to(
            q(`[data-ring-card="${n}"]`),
            { opacity: ring.cardOpacity, duration: 0.4 },
            at + 0.5,
          );
        });
        tl.to({}, { duration: TAIL_STEPS }, GROUND_STEPS + rings.length);
      });
    }, stage);
    scheduleScrollTriggerRefresh();
    return () => ctx.revert();
  }, [rings]);

  return (
    <>
      <span
        data-ring-summit
        className={styles.summit}
        style={{
          top: `calc(var(--spacing-5xl) + var(--ring-box-h) * ${tipFraction.toFixed(4)})`,
        }}
        aria-hidden
      />
      <div ref={stageRef} className={styles.stage}>
        <svg
          className={styles.svg}
          viewBox={`${BOX.x} ${BOX.y} ${BOX.w} ${BOX.h}`}
          fill="none"
          role="img"
          aria-label="Contour rings of a mountain, one ring per product priority, strongest at the summit"
        >
          <g data-ground style={{ opacity: 0 }}>
            {ground.map((d, i) => (
              <path
                key={GROUND_LEVELS[i]}
                className={styles.stroke}
                d={d}
                opacity={GROUND_OPACITY}
              />
            ))}
          </g>
          {/* Outer rings first, so each inner slice sits on top: the opaque fill
              hides the strokes of the rings behind it. Pointers on top. */}
          {rings
            .map((ring, n) => (
              <g key={ring.title}>
                <path
                  data-ring-fill={n}
                  className={styles.fill}
                  d={ring.path}
                  style={{ opacity: 0 }}
                />
                {ring.wall && (
                  <path
                    data-ring-wall={n}
                    className={styles.wall}
                    d={ring.wall}
                    style={{ opacity: 0 }}
                  />
                )}
                <path
                  data-ring-path={n}
                  className={styles.stroke}
                  d={ring.path}
                  pathLength={1}
                  opacity={ring.opacity}
                  style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
                />
              </g>
            ))
            .reverse()}
          {rings.map((ring, n) => (
            <path
              key={ring.title}
              data-ring-pointer={n}
              className={styles.stroke}
              d={ring.pointer}
              pathLength={1}
              opacity={ring.opacity}
              style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
            />
          ))}
        </svg>
        {rings.map((ring, n) => (
          <div
            key={ring.title}
            data-ring-card={n}
            className={styles.card}
            style={{
              opacity: 0,
              top: `calc(${pct(ring.cardY, BOX.h, BOX.y)} - 8px)`,
              width: pct(CARD_WIDTH, BOX.w),
              ...(ring.isLeft
                ? { right: pct(BOX.w - LEFT_EDGE, BOX.w), textAlign: "right" }
                : { left: pct(RIGHT_EDGE, BOX.w) }),
            }}
          >
            <span className={annotationStyles.title}>{ring.title}</span>
            <p className={styles.body}>{ring.body}</p>
          </div>
        ))}
      </div>
      <div ref={runwayRef} className={styles.runway} aria-hidden />
    </>
  );
}
