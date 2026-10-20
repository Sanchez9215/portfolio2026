"use client";

// First pass (not yet visually confirmed) — isometric lattice of separated
// cubes (count x count x count, only the outer shell is drawn), flat 2D SVG:
// dark faces (--surface-base) so nearer cubes hide the lines behind them,
// 1px grey-500 outlines. No rotation, no interaction — each cube just floats
// up and down a few px, phase-staggered along the lattice diagonal so the
// motion rolls through the figure. Tune the constants below.

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./CubeLattice.module.css";
import FrameworkLevelCallouts from "./FrameworkLevelCallouts";

// Cube edge as a fraction of its cell pitch (the rest is the gap).
const CUBE_RATIO = 0.7;
// Float defaults (proposed — tune). Distance is in rendered px.
const DEFAULT_FLOAT_PX = 7;
const DEFAULT_PERIOD_SECONDS = 4;
// How much of one float cycle the phase offset spans across the diagonal.
const DEFAULT_STAGGER_CYCLES = 0.5;
// Gap between the cubes' outermost silhouette and the hexagon outline.
const DEFAULT_OUTLINE_OFFSET_PX = 64;
// Pulses swelling along the outline (proposed — tune).
// Gap between the hexagon's top/bottom corners and the Insights ring.
const RING_OFFSET_PX = 32;
// Insights ring: organic distortion zones that break out of the circle as
// line-chart-like shapes, travel a little, then calm back into the border
// (proposed — tune). Outward only.
const RING_POINTS = 480;
const RING_ZONE_COUNT = 3;
const RING_AMPLITUDE_RATIO = 0.15; // peak height, of the ring's radius
const RING_ZONE_WIDTH_RADIANS: [number, number] = [0.9, 1.6]; // arc covered
const RING_ZONE_DURATION_SECONDS: [number, number] = [6, 10];
const RING_ZONE_TRAVEL_RADIANS: [number, number] = [0.3, 0.9];
const RING_ZONE_GAP_SECONDS: [number, number] = [0.5, 2.5];
const RING_ZONE_FIRST_STAGGER_SECONDS = 1.7;
// The trace is pinned to the ring (fixed in ring coordinates); a zone is just
// a smooth window sliding over it, so peaks grow/fade without shimmering.
// Cycles are counted around the whole ring (wavelength ~ circumference / n).
const RING_SINE_CYCLES: [number, number] = [14, 24]; // smooth sine mode
const RING_SHARP_BASE_CYCLES: [number, number] = [9, 14]; // line-chart mode
// Peakiness of line-chart mode: >1 narrows peaks and flattens valleys while
// staying smooth (no corners).
const RING_SHARP_PEAKINESS = 2.4;
// Level callouts: cards sit this far outside the ring, stacked with this gap.
const CALLOUT_OFFSET_PX = 96;
const CALLOUT_STACK_GAP_PX = 32;
// Insights threshold: a dashed circle this far outside the ring, which the
// distortion zones rise above and fall back below.
const THRESHOLD_OFFSET_PX = 16;
// Label sits this fraction of the threshold radius below the circle's center.
const THRESHOLD_LABEL_Y_RATIO = 0.7;
const LABEL_POINTER_GAP_PX = 8; // label -> pointer start
const PULSE_COUNT = 3;
const PULSE_LENGTH_PX = 6; // along the outline
const PULSE_PEAK_PX = 6; // thickest point
const PULSE_SAMPLES = 24; // points per side of the spindle
const PULSE_DURATION_SECONDS: [number, number] = [4, 7];
const PULSE_TRAVEL_RATIO: [number, number] = [0.25, 0.6]; // of the perimeter
const PULSE_GAP_SECONDS: [number, number] = [0.5, 2]; // between runs
const PULSE_FIRST_STAGGER_SECONDS = 1.3;

const COS30 = Math.sqrt(3) / 2;

// Isometric projection (SVG y points down): +x runs right-down, +y runs
// left-down, +z runs up. Viewer sits at +x +y +z, so a cube shows its top,
// its x=edge face (right) and its y=edge face (left).
function project(x: number, y: number, z: number) {
  return { px: (x - y) * COS30, py: (x + y) * 0.5 - z };
}

type Cube = {
  key: string;
  top: string;
  left: string;
  right: string;
  phase: number; // 0..1 along the lattice diagonal
  solid?: boolean; // the inverted Asset Profile cube
};

function makeCube(
  key: string,
  x: number,
  y: number,
  z: number,
  e: number,
  phase: number,
  solid = false,
): Cube {
  return {
    key,
    solid,
    top: pts([
      [x, y, z + e],
      [x + e, y, z + e],
      [x + e, y + e, z + e],
      [x, y + e, z + e],
    ]),
    right: pts([
      [x + e, y, z],
      [x + e, y + e, z],
      [x + e, y + e, z + e],
      [x + e, y, z + e],
    ]),
    left: pts([
      [x, y + e, z],
      [x + e, y + e, z],
      [x + e, y + e, z + e],
      [x, y + e, z + e],
    ]),
    phase,
  };
}

function pts(points: [number, number, number][]) {
  return points
    .map(([x, y, z]) => {
      const { px, py } = project(x, y, z);
      return `${px.toFixed(3)},${py.toFixed(3)}`;
    })
    .join(" ");
}

function buildLattice(count: number) {
  const pitch = 1;
  const edge = pitch * CUBE_RATIO;
  const inset = (pitch - edge) / 2;
  const cubes: Cube[] = [];
  const diagMax = 3 * (count - 1) || 1;
  const mid = Math.floor((count - 1) / 2);

  // Far to near: ascending i+j+k so later cubes paint over earlier ones.
  for (let sum = 0; sum <= diagMax; sum++) {
    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        const k = sum - i - j;
        if (k < 0 || k >= count) continue;
        const onShell = i === count - 1 || j === count - 1 || k === count - 1;
        if (!onShell) continue;
        const x = i * pitch + inset;
        const y = j * pitch + inset;
        const z = k * pitch + inset;
        // Asset Profile: the cube at the center of the right-hand face,
        // inverted (grey-500 faces, --surface-base outline) — one of the
        // lattice's own cubes, not an extra one.
        const isAssetProfile = i === count - 1 && j === mid && k === mid;
        cubes.push(
          makeCube(
            `${i}-${j}-${k}`,
            x,
            y,
            z,
            edge,
            sum / diagMax,
            isAssetProfile,
          ),
        );
      }
    }
  }

  // Bounding box of the whole figure, in projection units.
  const corners = [
    project(0, count * pitch, 0),
    project(count * pitch, 0, 0),
    project(0, 0, count * pitch),
    project(count * pitch, count * pitch, count * pitch),
  ];
  const minX = Math.min(...corners.map((c) => c.px));
  const maxX = Math.max(...corners.map((c) => c.px));
  const minY = Math.min(...corners.map((c) => c.py));
  const maxY = Math.max(...corners.map((c) => c.py));
  // Leader-line targets, in projection units: the lattice's right-hand
  // silhouette edge (All Assets) and the right edge of the Asset Profile
  // cube's right face (Profiles, its center).
  const profileX = (count - 1) * pitch + inset;
  const profileY = mid * pitch + inset;
  const profileZ = mid * pitch + inset;
  const allAssetsAnchor = project(
    (count - 1) * pitch + inset + edge,
    inset,
    mid * pitch + inset + edge / 2,
  );
  const profileAnchor = project(
    profileX + edge / 2,
    profileY + edge / 2,
    profileZ + edge / 2,
  );
  return {
    cubes,
    minX,
    minY,
    width: maxX - minX,
    height: maxY - minY,
    allAssetsAnchor,
    profileAnchor,
  };
}

type Vertex = [number, number];

// Point + unit tangent at arclength `distance` along a closed polygon.
function sampleLoop(
  verts: Vertex[],
  lengths: number[],
  total: number,
  distance: number,
) {
  let d = ((distance % total) + total) % total;
  for (let n = 0; n < verts.length; n++) {
    if (d <= lengths[n]) {
      const a = verts[n];
      const b = verts[(n + 1) % verts.length];
      const t = d / lengths[n];
      return {
        x: a[0] + (b[0] - a[0]) * t,
        y: a[1] + (b[1] - a[1]) * t,
        tx: (b[0] - a[0]) / lengths[n],
        ty: (b[1] - a[1]) / lengths[n],
      };
    }
    d -= lengths[n];
  }
  return { x: verts[0][0], y: verts[0][1], tx: 1, ty: 0 };
}

// Spindle: thin at both ends, thickest in the middle, hugging the loop.
function spindlePath(
  verts: Vertex[],
  lengths: number[],
  total: number,
  center: number,
  length: number,
  peak: number,
) {
  const top: string[] = [];
  const bottom: string[] = [];
  for (let n = 0; n <= PULSE_SAMPLES; n++) {
    const t = n / PULSE_SAMPLES;
    const p = sampleLoop(verts, lengths, total, center + (t - 0.5) * length);
    const half = (peak / 2) * Math.sin(Math.PI * t);
    top.push(
      `${(p.x - p.ty * half).toFixed(3)},${(p.y + p.tx * half).toFixed(3)}`,
    );
    bottom.push(
      `${(p.x + p.ty * half).toFixed(3)},${(p.y - p.tx * half).toFixed(3)}`,
    );
  }
  return `M${top.join("L")}L${bottom.reverse().join("L")}Z`;
}

const rand = (range: [number, number]) =>
  range[0] + Math.random() * (range[1] - range[0]);

type RingMode = "mixed" | "sharp" | "sine";

type RingZone = {
  center: number; // radians
  halfWidth: number; // radians
  amp: number; // 0..1 envelope (swell in, calm out)
  mode: "sharp" | "sine";
  phase: number; // radians, fixes where on the ring the trace's peaks sit
  cycles: number; // sine: cycles around the ring; sharp: base cycles
};

const TWO_PI = Math.PI * 2;

// C2-continuous 0..1 ramp (zero slope AND curvature at both ends).
const smootherstep = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

// Outward-only smooth trace, fixed in ring coordinates.
function trace(zone: RingZone, theta: number) {
  if (zone.mode === "sine") {
    return 0.5 + 0.5 * Math.sin(zone.cycles * theta + zone.phase);
  }
  // Sum of incommensurate sines = organic, smooth noise; raised to a power
  // for tall narrow peaks over a low floor, like a data trace.
  const n =
    Math.sin(zone.cycles * theta + zone.phase) * 0.55 +
    Math.sin(zone.cycles * 2.3 * theta + zone.phase * 1.7) * 0.3 +
    Math.sin(zone.cycles * 4.1 * theta + zone.phase * 2.9) * 0.15;
  return Math.pow(0.5 + 0.5 * n, RING_SHARP_PEAKINESS);
}

function ringOffset(zone: RingZone, theta: number) {
  // Signed shortest angular distance from the zone's center.
  let d = theta - zone.center;
  d = ((((d + Math.PI) % TWO_PI) + TWO_PI) % TWO_PI) - Math.PI;
  const u = Math.abs(d) / zone.halfWidth;
  if (u >= 1) return 0;
  // Smooth window: eases to flat so the zone melts into the plain border.
  return zone.amp * smootherstep(1 - u) * trace(zone, theta);
}

export default function CubeLattice({
  className,
  count = 9,
  size = 400,
  floatPx = DEFAULT_FLOAT_PX,
  periodSeconds = DEFAULT_PERIOD_SECONDS,
  staggerCycles = DEFAULT_STAGGER_CYCLES,
  outlineOffsetPx = DEFAULT_OUTLINE_OFFSET_PX,
  ringMode = "mixed",
}: {
  className?: string;
  count?: number;
  size?: number;
  floatPx?: number;
  periodSeconds?: number;
  staggerCycles?: number;
  outlineOffsetPx?: number;
  // "sharp" = line-chart zigzags, "sine" = smooth waves, "mixed" = each zone
  // picks one at random.
  ringMode?: RingMode;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const solidCubeRef = useRef<SVGGElement>(null);
  // The Asset Profile cube's real center (root-local px), read from the DOM
  // so the Profiles pointer lands on what is actually painted.
  const [profileCenter, setProfileCenter] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const lattice = useMemo(() => buildLattice(count), [count]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const cubeEls = svg.querySelectorAll<SVGGElement>("[data-cube]");
    // Rendered px -> viewBox units.
    const unitsPerPx = lattice.width / size;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      cubeEls.forEach((el) => {
        const phase = Number(el.dataset.phase ?? 0);
        const tween = gsap.to(el, {
          y: -floatPx * unitsPerPx,
          duration: periodSeconds / 2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
        tween.totalTime(phase * staggerCycles * periodSeconds);
      });
    });
    return () => mm.revert();
  }, [lattice, size, floatPx, periodSeconds, staggerCycles]);

  // The lattice's isometric silhouette is a regular pointy-top hexagon
  // centered on the projection origin. The outline pushes every edge out by
  // outlineOffsetPx (apothem + offset), so vertices move out by offset/cos30.
  const pxPerUnit = size / lattice.width;
  const cubeSpan = count - 2 * ((1 - CUBE_RATIO) / 2);
  const outlineR = cubeSpan + outlineOffsetPx / pxPerUnit / COS30;
  const outlineVerts: Vertex[] = [
    [0, -outlineR],
    [outlineR * COS30, -outlineR / 2],
    [outlineR * COS30, outlineR / 2],
    [0, outlineR],
    [-outlineR * COS30, outlineR / 2],
    [-outlineR * COS30, -outlineR / 2],
  ];
  // Insights ring: circumscribes the hexagon, clearing its top/bottom corners.
  const ringR = outlineR + RING_OFFSET_PX / pxPerUnit;
  const outlinePoints = outlineVerts
    .map(([x, y]) => `${x.toFixed(3)},${y.toFixed(3)}`)
    .join(" ");

  // Organic pulses: each is a spindle swell that travels a random distance
  // around the outline (random direction, speed, start), fades in/out, then
  // respawns after a random pause. Staggered so they never sync.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const pulseEls = svg.querySelectorAll<SVGPathElement>("[data-pulse]");
    const lengths = outlineVerts.map((v, n) => {
      const w = outlineVerts[(n + 1) % outlineVerts.length];
      return Math.hypot(w[0] - v[0], w[1] - v[1]);
    });
    const total = lengths.reduce((sum, l) => sum + l, 0);
    const length = PULSE_LENGTH_PX / pxPerUnit;
    // At swell 0 the sliver is exactly the outline's own 1px thickness, so it
    // sits invisibly on the line; swell 1 is the full bulge.
    const restThickness = 1 / pxPerUnit;
    const peak = PULSE_PEAK_PX / pxPerUnit;
    let alive = true;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      pulseEls.forEach((el, index) => {
        const state = { pos: 0, swell: 0 };
        const draw = () =>
          el.setAttribute(
            "d",
            spindlePath(
              outlineVerts,
              lengths,
              total,
              state.pos,
              length,
              restThickness + (peak - restThickness) * state.swell,
            ),
          );
        const run = () => {
          if (!alive) return;
          const duration = rand(PULSE_DURATION_SECONDS);
          const direction = Math.random() < 0.5 ? -1 : 1;
          state.pos = Math.random() * total;
          const tl = gsap.timeline({
            onComplete: () => {
              gsap.delayedCall(rand(PULSE_GAP_SECONDS), run);
            },
          });
          state.swell = 0;
          // The line itself swells into the bulge and settles back into it —
          // no fade, the sliver just thickens/thins over the same 1px line.
          tl.set(el, { opacity: 1 })
            .to(
              state,
              {
                pos: state.pos + direction * total * rand(PULSE_TRAVEL_RATIO),
                duration,
                ease: "sine.inOut",
                onUpdate: draw,
              },
              0,
            )
            .to(
              state,
              { swell: 1, duration: duration / 2, ease: "sine.inOut" },
              0,
            )
            .to(
              state,
              { swell: 0, duration: duration / 2, ease: "sine.inOut" },
              duration / 2,
            );
        };
        gsap.delayedCall(
          index * PULSE_FIRST_STAGGER_SECONDS + Math.random(),
          run,
        );
      });
    });
    return () => {
      alive = false;
      mm.revert();
    };
    // outlineVerts is derived from outlineR/count/size/offset below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outlineR, pxPerUnit]);

  // Insights ring distortion: the circle is a RING_POINTS polyline; each zone
  // pushes the points in its arc outward by a waveform, travels a little,
  // then its envelope calms back to 0 so it dies into the plain border.
  useEffect(() => {
    const ringEl = svgRef.current?.querySelector<SVGPathElement>("[data-ring]");
    if (!ringEl) return;
    const baseR = ringR;
    const maxOffset = baseR * RING_AMPLITUDE_RATIO;
    const zones: RingZone[] = [];
    let alive = true;

    function draw() {
      const pts: [number, number][] = [];
      for (let n = 0; n < RING_POINTS; n++) {
        const theta = -Math.PI / 2 + (TWO_PI * n) / RING_POINTS;
        let offset = 0;
        for (const zone of zones) offset += ringOffset(zone, theta);
        const r = baseR + Math.min(offset, 1) * maxOffset;
        pts.push([Math.cos(theta) * r, Math.sin(theta) * r]);
      }
      // Quadratic curves through the midpoints (each sample is a control
      // point), so the line is curved instead of straight segments.
      const mid = (a: [number, number], b: [number, number]) =>
        `${((a[0] + b[0]) / 2).toFixed(2)},${((a[1] + b[1]) / 2).toFixed(2)}`;
      let d = `M${mid(pts[RING_POINTS - 1], pts[0])}`;
      for (let n = 0; n < RING_POINTS; n++) {
        d += `Q${pts[n][0].toFixed(2)},${pts[n][1].toFixed(2)} ${mid(pts[n], pts[(n + 1) % RING_POINTS])}`;
      }
      ringEl!.setAttribute("d", `${d}Z`);
    }

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      for (let index = 0; index < RING_ZONE_COUNT; index++) {
        const zone: RingZone = {
          center: 0,
          halfWidth: 0.5,
          amp: 0,
          mode: "sine",
          phase: 0,
          cycles: 4,
        };
        zones.push(zone);
        const run = () => {
          if (!alive) return;
          const duration = rand(RING_ZONE_DURATION_SECONDS);
          const direction = Math.random() < 0.5 ? -1 : 1;
          zone.center = Math.random() * TWO_PI;
          zone.halfWidth = rand(RING_ZONE_WIDTH_RADIANS) / 2;
          zone.mode =
            ringMode === "mixed"
              ? Math.random() < 0.5
                ? "sharp"
                : "sine"
              : ringMode;
          zone.cycles =
            zone.mode === "sine"
              ? Math.round(rand(RING_SINE_CYCLES))
              : Math.round(rand(RING_SHARP_BASE_CYCLES));
          zone.phase = Math.random() * TWO_PI;
          zone.amp = 0;
          // One smooth progress 0 -> 1 drives travel and envelope together:
          // eased travel (zero velocity at both ends) and a sin^2-shaped
          // envelope, so the zone swells, holds a moment, and calms away.
          const life = { p: 0 };
          const startCenter = zone.center;
          const travel = direction * rand(RING_ZONE_TRAVEL_RADIANS);
          gsap.to(life, {
            p: 1,
            duration,
            ease: "sine.inOut",
            onUpdate: () => {
              zone.center = startCenter + travel * life.p;
              zone.amp = smootherstep(Math.sin(Math.PI * life.p) * 1.25);
            },
            onComplete: () => {
              zone.amp = 0;
              gsap.delayedCall(rand(RING_ZONE_GAP_SECONDS), run);
            },
          });
        };
        gsap.delayedCall(
          index * RING_ZONE_FIRST_STAGGER_SECONDS + Math.random(),
          run,
        );
      }
      gsap.ticker.add(draw);
      return () => gsap.ticker.remove(draw);
    });
    return () => {
      alive = false;
      mm.revert();
    };
  }, [ringR, ringMode]);

  // Leader-line targets in the wrapper's local px (SVG origin = its center).
  const figurePx = 2 * ringR * pxPerUnit;
  const toPx = (ux: number, uy: number) => ({
    x: figurePx / 2 + ux * pxPerUnit,
    y: figurePx / 2 + uy * pxPerUnit,
  });
  // Horizontal pointers end where a line at the label's y meets each shape.
  // y is container-local px; shapes are centered on (figurePx/2, figurePx/2).
  const center = figurePx / 2;
  const hexRightX = (radiusPx: number) => (labelY: number) => {
    const y = Math.min(Math.abs(labelY - center), radiusPx);
    const halfWidth =
      y <= radiusPx / 2
        ? radiusPx * COS30
        : (radiusPx * COS30 * (radiusPx - y)) / (radiusPx / 2);
    return center + halfWidth;
  };
  const ringLeftX = (labelY: number) => {
    const ringPx = ringR * pxPerUnit;
    const y = Math.min(Math.abs(labelY - center), ringPx);
    return center - Math.sqrt(ringPx * ringPx - y * y);
  };
  const profileAnchorPx =
    profileCenter ?? toPx(lattice.profileAnchor.px, lattice.profileAnchor.py);
  const thresholdRadiusPx = ringR * pxPerUnit + THRESHOLD_OFFSET_PX;
  const thresholdLabelY = center + thresholdRadiusPx * THRESHOLD_LABEL_Y_RATIO;
  const thresholdPointerEndX =
    center -
    Math.sqrt(thresholdRadiusPx ** 2 - (thresholdLabelY - center) ** 2);
  const rightCallouts = [
    {
      title: "Overview",
      body: "Real-time distribution view of assets across lifecycle stages, filterable from a single worksite to global operations.",
      targetX: hexRightX(outlineR * pxPerUnit), // hexagon
    },
    {
      title: "All Assets",
      body: "A complete view of every asset owned, letting users segment by region, relationship, financial unit, or operational status.",
      targetX: hexRightX(cubeSpan * pxPerUnit), // lattice silhouette
    },
    {
      title: "Profiles",
      body: "Combines core attributes, entity relationships and lifecycle events from purchased to retired in a single record.",
      targetX: () => profileAnchorPx.x, // solid cube, label is aligned to it
      // The cube floats, so its pointer follows its live center every frame.
      track: () => {
        const root = rootRef.current;
        const cube = solidCubeRef.current;
        if (!root || !cube) return null;
        const rootRect = root.getBoundingClientRect();
        const r = cube.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - rootRect.left,
          y: r.top + r.height / 2 - rootRect.top,
        };
      },
    },
  ];
  const leftCallouts = [
    {
      title: "Insights",
      body: "Translates lifecycle data into clear trends and signals to maximize operational efficiency, unlock cost reductions, and validate autonomous execution.",
      targetX: ringLeftX, // ring
    },
  ];

  useLayoutEffect(() => {
    const root = rootRef.current;
    const cube = solidCubeRef.current;
    if (!root || !cube) return;
    const measure = () => {
      const rootRect = root.getBoundingClientRect();
      const r = cube.getBoundingClientRect();
      // Rest position: remove the cube's current float offset (viewBox
      // units -> px), so the label aligns to where it sits at rest.
      const floatOffsetPx = Number(gsap.getProperty(cube, "y")) * pxPerUnit;
      const next = {
        x: r.left + r.width / 2 - rootRect.left,
        y: r.top + r.height / 2 - rootRect.top - (floatOffsetPx || 0),
      };
      setProfileCenter((prev) =>
        prev &&
        Math.abs(prev.x - next.x) < 0.5 &&
        Math.abs(prev.y - next.y) < 0.5
          ? prev
          : next,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [figurePx, pxPerUnit]);

  return (
    <div
      ref={rootRef}
      className={`${styles.root}${className ? ` ${className}` : ""}`}
      style={{ width: figurePx }}
    >
      <svg
        ref={svgRef}
        className={styles.lattice}
        width={figurePx}
        viewBox={`${-ringR} ${-ringR} ${2 * ringR} ${2 * ringR}`}
        aria-hidden="true"
      >
        <circle
          className={styles.threshold}
          cx={0}
          cy={0}
          r={ringR + THRESHOLD_OFFSET_PX / pxPerUnit}
        />
        <path
          className={styles.ring}
          data-ring
          d={`M${Array.from({ length: RING_POINTS }, (_, n) => {
            const theta = -Math.PI / 2 + (TWO_PI * n) / RING_POINTS;
            return `${(Math.cos(theta) * ringR).toFixed(2)},${(Math.sin(theta) * ringR).toFixed(2)}`;
          }).join("L")}Z`}
        />
        <polygon
          data-hexagon
          className={styles.outline}
          points={outlinePoints}
        />
        {Array.from({ length: PULSE_COUNT }, (_, n) => (
          <path key={n} className={styles.pulse} data-pulse opacity={0} />
        ))}
        {lattice.cubes.map((cube) => (
          <g
            key={cube.key}
            ref={cube.solid ? solidCubeRef : undefined}
            data-cube=""
            data-phase={cube.phase}
          >
            {[cube.left, cube.right, cube.top].map((points, n) => (
              <polygon
                key={n}
                className={cube.solid ? styles.faceSolid : styles.face}
                points={points}
              />
            ))}
          </g>
        ))}
      </svg>
      {/* Threshold label: Insights side (left column edge), lower on the
          circle, with a horizontal 1px pointer to the dashed line. */}
      <span
        className={styles.thresholdLabel}
        style={{ left: -CALLOUT_OFFSET_PX, top: thresholdLabelY }}
      >
        Organization Threshold
      </span>
      <svg className={styles.thresholdPointer} fill="none" aria-hidden="true">
        <path
          d={`M${-CALLOUT_OFFSET_PX + LABEL_POINTER_GAP_PX} ${thresholdLabelY}H${thresholdPointerEndX}`}
        />
      </svg>
      <FrameworkLevelCallouts
        items={rightCallouts}
        side="right"
        edgeX={figurePx + CALLOUT_OFFSET_PX}
        centerY={figurePx / 2}
        gap={CALLOUT_STACK_GAP_PX}
      />
      <FrameworkLevelCallouts
        items={leftCallouts}
        side="left"
        edgeX={-CALLOUT_OFFSET_PX}
        centerY={figurePx / 2}
      />
    </div>
  );
}
