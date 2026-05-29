"use client";

/**
 * BounceCanvas — DVD-screensaver SVG toy with pellet firing system
 *
 * Auto-movement: slow gentle bounce via GSAP ticker
 * Drag:          GSAP Draggable — grab / grabbing cursor
 * Throw:         GSAP InertiaPlugin — momentum on release
 * Bounce:        onThrowUpdate detects edge hits, reflects velocity
 * Resume:        onThrowComplete fallback
 * Nudge:         onClick → small random velocity kick
 *
 * Pellets (passive)  — all 4 heads fire outward in sync every 3 s
 * Pellets (active)   — all 4 heads stream toward mouse continuously
 * Pellets (taper)    — snappy wind-down burst when mouse leaves
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import styles from "./BounceCanvas.module.css";

gsap.registerPlugin(Draggable, InertiaPlugin);

/* ── SVG size ─────────────────────────────────────────────────── */
const SVG_W = 120;
const SVG_H = 120;

/* ── bounce physics ───────────────────────────────────────────── */
const AUTO_SPEED = 2.5; // px/frame at 60 fps
const NUDGE_V = 1; // px/frame added per nudge axis

/* ── pellet visual config — swap the shape here ──────────────── */
const PELLET = {
  width: 8, // long axis (px), aligned to travel direction
  height: 4, // short axis (px)
  color: "#ffffff",
  speed: 30, // px per frame at 60 fps
  maxBounces: 0, // disappears silently on the (maxBounces+1)th wall crossing
};

/* ── emitter offsets — local SVG coordinates (120 × 120) ────── */
const EMITTERS = [
  { ox: 60, oy: 10, dx: 0, dy: -1 }, // top    — fires up
  { ox: 60, oy: 110, dx: 0, dy: 1 }, // bottom — fires down
  { ox: 10, oy: 60, dx: -1, dy: 0 }, // left   — fires left
  { ox: 110, oy: 60, dx: 1, dy: 0 }, // right  — fires right
] as const;

/* ── falling shape types — add entries here for new shapes ──────── */
const FALLING_SHAPES = [
  { src: "/SVG/object.svg", w: 40, h: 40 },
  { src: "/SVG/object2.svg", w: 20, h: 20 },
];

/* ── falling shape spawn config ──────────────────────────────── */
const SPAWN = {
  minInterval: 1500, // ms — shortest wait before next shape
  maxInterval: 3500, // ms — longest wait before next shape
  speed: 1.5, // px/frame downward (scaled by dt)
  maxActive: 4, // cap on simultaneous falling shapes
};

/* ── connector line style ────────────────────────────────────── */
const CONNECTOR = {
  color: "#FFD53C",
  width: 2,
  exclusionRadius: 149, // nothing placed inside this radius from SVG center
  minSnap: 45,
  maxSnap: 80,
  // webThreshold removed — web cross-links are no longer drawn
  SCALE: 1.5, // graph density: < 1 = tighter spacing, > 1 = looser
  dashLen: 6, // px — dashed segment length
  dashGap: 4, // px — gap between dashes
  // Head priority: multiply raw head distance by this before the closest-anchor race.
  // Lower = heads win more aggressively. Range 0.4–0.8 is most useful.
  HEAD_BIAS: 0.6,
  // Max direct children per head. Once a head hits this cap it is skipped entirely
  // — new shapes must branch off existing children instead of adding to the inner ring.
  HEAD_MAX_CHILDREN: 3,
  // Max direct children per non-head shape. Prevents A/B nodes becoming overcrowded
  // spokes — each can branch into at most this many children.
  SHAPE_MAX_CHILDREN: 2,
  // Max chain depth from a head. Shapes at this depth cannot be parents — forces
  // branching from shallower nodes instead of extending arms indefinitely.
  CHAIN_MAX: 3,
  // Sibling spread: minimum angular gap (radians) between children of the same parent.
  // Prevents nodes from stacking into a narrow wedge. ~36° is a good default.
  MIN_SIBLING_ANGLE: Math.PI / 5,
  // Ripple settle: when a new shape lands, nearby shapes pulse outward then spring back.
  RIPPLE_RADIUS: 100, // px — shapes within this radius react
  RIPPLE_PUSH: 14,    // px — max outward nudge (falls off linearly with distance)
};

/* ── burst timing ─────────────────────────────────────────────── */
const BURST_COUNT_MIN = 3; // min dashes per passive burst
const BURST_COUNT_MAX = 5; // max dashes per passive burst
const BURST_INTERVAL = 320; // ms between dashes within a burst
const BURST_COOLDOWN = 3000; // ms between bursts (passive)
const ACTIVE_EVERY = 6; // frames between shots in active mode
const TAPER_SHOTS = 5; // shots fired after mouse leaves before going passive

/* ── types ────────────────────────────────────────────────────── */
interface Pellet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number; // locked at birth — never recalculated
  tx: number | null; // convergence target (active mode); null = passive, dies at wall
  ty: number | null;
  bounces: number;
  dead: boolean;
}

interface FallingShape {
  typeIdx: number; // index into FALLING_SHAPES
  x: number;
  y: number;
  vx: number; // world-space velocity per frame (scaled by dt)
  vy: number;
  dead: boolean;
}

interface AttachedShape {
  id: number;
  typeIdx: number;
  depth: number; // hops from the nearest head (0 = direct head child)
  lx: number;  // base local x (animated by attachment tween)
  ly: number;  // base local y
  rlx: number; // ripple offset x (tweened to 0 after each pulse)
  rly: number; // ripple offset y
  parentHeadIdx: number[];
  parentShapeIds: number[];
}

type Mode = "passive" | "active" | "tapering";

/* ══════════════════════════════════════════════════════════════ */
export default function BounceCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const svg = svgRef.current;
    if (!container || !canvas || !svg) return;

    /* ── canvas sizing ──────────────────────────────────────────── */
    const syncSize = () => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    };
    syncSize();
    const ro = new ResizeObserver(syncSize);
    ro.observe(container);
    const ctx = canvas.getContext("2d")!;

    /* ── SVG bounce state ───────────────────────────────────────── */
    let x = Math.random() * Math.max(0, container.offsetWidth - SVG_W);
    let y = Math.random() * Math.max(0, container.offsetHeight - SVG_H);
    let vx = AUTO_SPEED * (Math.random() > 0.5 ? 1 : -1);
    let vy = AUTO_SPEED * (Math.random() > 0.5 ? 1 : -1);
    let paused = false;
    let prevThrowX = x;
    let prevThrowY = y;
    gsap.set(svg, { x, y });

    /* ── pellet state ───────────────────────────────────────────── */
    const pellets: Pellet[] = [];
    let mode: Mode = "passive";
    let mouseX = 0,
      mouseY = 0;

    // passive burst state
    let nextBurstAt = performance.now() + 600; // first burst after 0.6 s
    let burstActive = false;
    let burstCount = 0;
    let burstMax = 0;
    let nextPelletAt = 0;

    // active
    let activeFrame = 0;

    // taper
    let taperLeft = 0;
    let taperFrame = 0;

    /* ── falling shapes state ──────────────────────────────────── */
    // Preload one HTMLImageElement per shape type
    const shapeImgs = new Map<number, HTMLImageElement>();
    FALLING_SHAPES.forEach((def, i) => {
      const img = new Image();
      img.src = def.src;
      shapeImgs.set(i, img);
    });

    const fallingShapes: FallingShape[] = [];
    let nextSpawnAt = performance.now() + SPAWN.minInterval;

    const attachedShapes: AttachedShape[] = [];
    const headChildCount = [0, 0, 0, 0]; // direct children per head
    const shapeChildCount = new Map<number, number>(); // direct children per non-head shape
    let nextShapeId = 0;

    /* ── helpers ────────────────────────────────────────────────── */
    const spawn = (
      wx: number,
      wy: number,
      ndx: number,
      ndy: number,
      tx: number | null = null,
      ty: number | null = null,
    ) => {
      const len = Math.hypot(ndx, ndy) || 1;
      const angle = Math.atan2(ndy, ndx); // locked once at birth
      pellets.push({
        x: wx,
        y: wy,
        vx: (ndx / len) * PELLET.speed,
        vy: (ndy / len) * PELLET.speed,
        angle,
        tx,
        ty,
        bounces: 0,
        dead: false,
      });
    };

    // Passive: all heads fire outward along their face normal
    const firePassive = () => {
      for (const e of EMITTERS) spawn(x + e.ox, y + e.oy, e.dx, e.dy);
    };

    // Active: all heads aim at current mouse position
    // Snapshot mx/my once so all 4 heads converge on the exact same point.
    // Pass the target so each pellet dies exactly when it reaches the cursor —
    // streams converge and vanish there instead of spreading past it.
    const fireMouse = () => {
      const mx = mouseX,
        my = mouseY;
      for (const e of EMITTERS) {
        const wx = x + e.ox,
          wy = y + e.oy;
        spawn(wx, wy, mx - wx, my - wy, mx, my);
      }
    };

    const connectShape = (s: FallingShape) => {
      // SVG center in world space
      const svgCx = x + SVG_W / 2;
      const svgCy = y + SVG_H / 2;

      // ── Step 1: find closest anchor — any head or any attached shape ──
      // Whichever is nearest to the impact point (s.x, s.y) becomes the parent.
      let bestDist = Infinity;
      let parentHeadIdx: number[] = [];
      let parentShapeIds: number[] = [];
      let parentX = svgCx; // fallback to SVG center (never actually used)
      let parentY = svgCy;

      // Check all 4 robot heads — directional gate + bias
      // Gate: only consider a head if the shape arrived on its outward side.
      //   dot = (impact - svgCenter) · headDir > 0  ↔  shape is "in front of" this head.
      // Bias: multiply the raw distance by HEAD_BIAS before the race so heads win
      //   even when a child shape is geometrically closer — tunable in CONNECTOR block.
      for (let i = 0; i < EMITTERS.length; i++) {
        const e = EMITTERS[i];
        const hwx = x + e.ox;
        const hwy = y + e.oy;
        // Directional gate — skip if shape landed on the wrong side of this head
        const dot = (s.x - svgCx) * e.dx + (s.y - svgCy) * e.dy;
        if (dot <= 0) continue;
        // Cap gate — skip if this head already has its max direct children
        if (headChildCount[i] >= CONNECTOR.HEAD_MAX_CHILDREN) continue;
        // Apply bias: heads feel closer than they really are
        const d = Math.hypot(s.x - hwx, s.y - hwy) * CONNECTOR.HEAD_BIAS;
        if (d < bestDist) {
          bestDist = d;
          parentHeadIdx = [i];
          parentShapeIds = [];
          parentX = hwx;
          parentY = hwy;
        }
      }

      // Check all already-attached shapes (use their live animated positions)
      for (const a of attachedShapes) {
        // Depth cap — shapes at CHAIN_MAX cannot extend the arm further
        if (a.depth >= CONNECTOR.CHAIN_MAX) continue;
        // Children cap — skip shapes already at their max direct children
        if ((shapeChildCount.get(a.id) ?? 0) >= CONNECTOR.SHAPE_MAX_CHILDREN) continue;
        const awx = x + a.lx + a.rlx;
        const awy = y + a.ly + a.rly;
        // Directional gate — skip child shapes on the opposite side of the SVG center.
        // Dot product of (impact → center) and (child → center): if negative they're
        // in the same half-plane; positive means they're on opposite sides → skip.
        const sameSide =
          (s.x - svgCx) * (awx - svgCx) + (s.y - svgCy) * (awy - svgCy);
        if (sameSide <= 0) continue;
        const d = Math.hypot(s.x - awx, s.y - awy);
        if (d < bestDist) {
          bestDist = d;
          parentHeadIdx = [];
          parentShapeIds = [a.id];
          parentX = awx;
          parentY = awy;
        }
      }

      // ── Step 2: attachment angle — parent → impact direction + jitter ──
      // The new node snaps roughly where the shape arrived from, relative to
      // its parent. Small random offset keeps the graph organic and non-linear.
      const rawAngle = Math.atan2(s.y - parentY, s.x - parentX);
      let attachAngle = rawAngle + (Math.random() - 0.5) * (Math.PI / 9); // ±20°

      // ── Step 2b: angular separation — spread siblings around their parent ──
      // Collect all shapes already attached to this same parent, measure their
      // angles, and if the new angle lands too close to any sibling, redirect it
      // into the center of the largest open arc instead.
      {
        const siblingAngles: number[] = [];
        for (const a of attachedShapes) {
          const sharesParent =
            (parentHeadIdx.length > 0 &&
              a.parentHeadIdx.some((h) => parentHeadIdx.includes(h))) ||
            (parentShapeIds.length > 0 &&
              a.parentShapeIds.some((pid) => parentShapeIds.includes(pid)));
          if (!sharesParent) continue;
          const awx = x + a.lx + a.rlx;
          const awy = y + a.ly + a.rly;
          siblingAngles.push(Math.atan2(awy - parentY, awx - parentX));
        }
        if (siblingAngles.length > 0) {
          // Smallest absolute angular distance between two angles (handles wrap)
          const wrapAbs = (a: number, b: number) => {
            const d = ((a - b) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
            return Math.min(d, 2 * Math.PI - d);
          };
          const tooClose = siblingAngles.some(
            (sa) => wrapAbs(attachAngle, sa) < CONNECTOR.MIN_SIBLING_ANGLE,
          );
          if (tooClose) {
            // Sort siblings and find the widest open arc
            const sorted = [...siblingAngles].sort((a, b) => a - b);
            let bestCenter = attachAngle; // fallback: no change
            let bestGap = 0;
            const n = sorted.length;
            for (let i = 0; i < n; i++) {
              const a0 = sorted[i];
              const a1 = sorted[(i + 1) % n];
              let gap = a1 - a0;
              if (gap <= 0) gap += 2 * Math.PI;
              if (gap > bestGap) {
                bestGap = gap;
                bestCenter = a0 + gap / 2;
              }
            }
            // Only redirect if the gap is meaningfully open; if every arc is tiny
            // (very crowded parent) leave the angle alone rather than placing oddly.
            if (bestGap >= CONNECTOR.MIN_SIBLING_ANGLE * 1.5) {
              attachAngle = bestCenter;
            }
          }
        }
      }

      // ── Step 3: SCALE-adjusted snap distance ─────────────────────────
      const minS = CONNECTOR.minSnap * CONNECTOR.SCALE;
      const maxS = CONNECTOR.maxSnap * CONNECTOR.SCALE;
      const snapDist = minS + Math.random() * (maxS - minS);

      // ── Step 4: snap world position ──────────────────────────────────
      let snapWx = parentX + Math.cos(attachAngle) * snapDist;
      let snapWy = parentY + Math.sin(attachAngle) * snapDist;

      // ── Step 5: exclusion zone — push outward if inside SVG body ─────
      const toDx = snapWx - svgCx;
      const toDy = snapWy - svgCy;
      const toDist = Math.hypot(toDx, toDy) || 1;
      if (toDist < CONNECTOR.exclusionRadius) {
        snapWx = svgCx + (toDx / toDist) * CONNECTOR.exclusionRadius;
        snapWy = svgCy + (toDy / toDist) * CONNECTOR.exclusionRadius;
      }

      // ── Step 6: local offset + id + GSAP elastic snap ────────────────
      const targetLx = snapWx - x;
      const targetLy = snapWy - y;
      const startLx = s.x - x;
      const startLy = s.y - y;

      const id = nextShapeId++;
      // Depth: 0 for direct head children, parent.depth + 1 for shape children
      const parentDepth =
        parentShapeIds.length > 0
          ? (attachedShapes.find((a) => a.id === parentShapeIds[0])?.depth ?? 0)
          : -1;
      const depth = parentDepth + 1;

      const entry: AttachedShape = {
        id,
        typeIdx: s.typeIdx,
        depth,
        lx: startLx,
        ly: startLy,
        rlx: 0,
        rly: 0,
        parentHeadIdx,
        parentShapeIds,
      };
      attachedShapes.push(entry);

      // Keep child counts current
      if (parentHeadIdx.length > 0) headChildCount[parentHeadIdx[0]]++;
      if (parentShapeIds.length > 0) {
        const pid = parentShapeIds[0];
        shapeChildCount.set(pid, (shapeChildCount.get(pid) ?? 0) + 1);
      }

      const anim = { lx: startLx, ly: startLy };
      gsap.to(anim, {
        lx: targetLx,
        ly: targetLy,
        duration: 0.6,
        ease: "elastic.out(1, 0.5)",
        onUpdate() {
          entry.lx = anim.lx;
          entry.ly = anim.ly;
        },
      });

      // ── Step 7: ripple settle ─────────────────────────────────────────────
      // Nearby shapes get a one-shot pulse: jump outward from the landing point,
      // then spring back with elastic.out. Uses rlx/rly so it never fights the
      // attachment tween (which animates lx/ly on a separate object).
      for (const a of attachedShapes) {
        if (a.id === id) continue; // skip the shape we just added
        const awx = x + a.lx + a.rlx;
        const awy = y + a.ly + a.rly;
        const dist = Math.hypot(awx - snapWx, awy - snapWy);
        if (dist >= CONNECTOR.RIPPLE_RADIUS || dist < 1) continue;
        const nx = (awx - snapWx) / dist;
        const ny = (awy - snapWy) / dist;
        // Strength falls off linearly — strongest closest to landing point
        const strength = (1 - dist / CONNECTOR.RIPPLE_RADIUS) * CONNECTOR.RIPPLE_PUSH;
        // Kill any in-flight ripple, apply new offset, tween back to zero
        gsap.killTweensOf(a); // only kills tweens on `a` itself; lx/ly tween uses `anim`
        a.rlx += nx * strength;
        a.rly += ny * strength;
        gsap.to(a, {
          rlx: 0,
          rly: 0,
          duration: 0.9,
          ease: "elastic.out(1, 0.45)",
        });
      }
    };

    /* ── main ticker ────────────────────────────────────────────── */
    const tick = () => {
      const now = performance.now();
      const W = canvas.width;
      const H = canvas.height;
      const dt = gsap.ticker.deltaRatio(60);

      /* — sync SVG world position during drag so emitters stay accurate — */
      if (paused) {
        x = Number(gsap.getProperty(svg, "x"));
        y = Number(gsap.getProperty(svg, "y"));
      }

      /* — SVG bounce — */
      if (!paused) {
        const maxX = W - SVG_W;
        const maxY = H - SVG_H;
        const spd = Math.hypot(vx, vy);

        if (spd > AUTO_SPEED + 0.1) {
          vx *= 0.97;
          vy *= 0.97;
        } else if (spd < AUTO_SPEED * 0.9) {
          const s = AUTO_SPEED / Math.max(spd, 0.01);
          vx *= s;
          vy *= s;
        }

        x += vx * dt;
        y += vy * dt;

        if (x <= 0) {
          x = 0;
          vx = Math.abs(vx);
        }
        if (x >= maxX) {
          x = maxX;
          vx = -Math.abs(vx);
        }
        if (y <= 0) {
          y = 0;
          vy = Math.abs(vy);
        }
        if (y >= maxY) {
          y = maxY;
          vy = -Math.abs(vy);
        }

        gsap.set(svg, { x, y });
      }

      /* — firing logic — */
      if (mode === "passive") {
        // Start a new burst when the cooldown expires
        if (!burstActive && now >= nextBurstAt) {
          burstActive = true;
          burstCount = 0;
          burstMax =
            BURST_COUNT_MIN +
            Math.floor(Math.random() * (BURST_COUNT_MAX - BURST_COUNT_MIN + 1));
          nextPelletAt = now;
        }
        // Fire one salvo per BURST_INTERVAL until burst is exhausted
        if (burstActive && now >= nextPelletAt) {
          firePassive();
          burstCount++;
          nextPelletAt = now + BURST_INTERVAL;
          if (burstCount >= burstMax) {
            burstActive = false;
            nextBurstAt = now + BURST_COOLDOWN;
          }
        }
      } else if (mode === "active") {
        if (++activeFrame >= ACTIVE_EVERY) {
          activeFrame = 0;
          fireMouse();
        }
      } else /* tapering */ {
        if (taperLeft > 0 && ++taperFrame >= ACTIVE_EVERY) {
          taperFrame = 0;
          fireMouse(); // last few aimed shots
          taperLeft--;
        }
        if (taperLeft <= 0) {
          mode = "passive";
          nextBurstAt = now + 800; // brief pause before first passive burst
          burstActive = false;
        }
      }

      /* — update pellets — */
      for (const p of pellets) {
        if (p.dead) continue;

        p.x += p.vx; // fixed step — no dt, no easing, no drift
        p.y += p.vy;

        // Convergence kill: die the moment the pellet passes its target point.
        // Dot product of "vector to target" with velocity flips negative once
        // the pellet has crossed the target — streams meet and vanish at the cursor.
        if (p.tx !== null && (p.tx - p.x) * p.vx + (p.ty! - p.y) * p.vy < 0) {
          p.dead = true;
          continue;
        }

        // Active-pellet × falling-shape AABB collision (passive pellets skip)
        if (p.tx !== null) {
          for (const s of fallingShapes) {
            if (s.dead) continue;
            const def = FALLING_SHAPES[s.typeIdx];
            const hw = def.w / 2,
              hh = def.h / 2;
            if (
              p.x >= s.x - hw &&
              p.x <= s.x + hw &&
              p.y >= s.y - hh &&
              p.y <= s.y + hh
            ) {
              p.dead = true;
              s.dead = true;
              connectShape(s);
              break; // one pellet hits one shape
            }
          }
          if (p.dead) continue; // skip wall check for consumed pellets
        }

        // Check wall crossings — reflect or die cleanly
        let hit = false;
        if (p.x < 0) {
          p.x = 0;
          p.vx = Math.abs(p.vx);
          hit = true;
        }
        if (p.x > W) {
          p.x = W;
          p.vx = -Math.abs(p.vx);
          hit = true;
        }
        if (p.y < 0) {
          p.y = 0;
          p.vy = Math.abs(p.vy);
          hit = true;
        }
        if (p.y > H) {
          p.y = H;
          p.vy = -Math.abs(p.vy);
          hit = true;
        }

        if (hit) {
          p.bounces++;
          // After maxBounces, die before drawing — no flash at the wall
          if (p.bounces > PELLET.maxBounces) p.dead = true;
        }
      }

      // Prune dead pellets when the array gets large
      if (pellets.length > 200) {
        pellets.splice(0, pellets.length, ...pellets.filter((p) => !p.dead));
      }

      /* — falling shapes: spawn from all 4 edges, move, prune — */
      {
        const activeCount = fallingShapes.filter((s) => !s.dead).length;
        if (activeCount < SPAWN.maxActive && now >= nextSpawnAt) {
          const typeIdx = Math.floor(Math.random() * FALLING_SHAPES.length);
          const roll = Math.random();
          let sx: number, sy: number, svx: number, svy: number;
          if (roll < 0.5) {
            // top edge — falls straight down
            sx = Math.random() * W;
            sy = -50;
            svx = 0;
            svy = SPAWN.speed;
          } else if (roll < 0.7) {
            // left edge — drifts right + down
            sx = -50;
            sy = Math.random() * H * 0.7;
            svx = SPAWN.speed * 0.6;
            svy = SPAWN.speed * 0.8;
          } else if (roll < 0.9) {
            // right edge — drifts left + down
            sx = W + 50;
            sy = Math.random() * H * 0.7;
            svx = -SPAWN.speed * 0.6;
            svy = SPAWN.speed * 0.8;
          } else {
            // bottom edge — rises straight up
            sx = Math.random() * W;
            sy = H + 50;
            svx = 0;
            svy = -SPAWN.speed;
          }
          fallingShapes.push({
            typeIdx,
            x: sx,
            y: sy,
            vx: svx,
            vy: svy,
            dead: false,
          });
          nextSpawnAt =
            now +
            SPAWN.minInterval +
            Math.random() * (SPAWN.maxInterval - SPAWN.minInterval);
        }

        for (const s of fallingShapes) {
          if (s.dead) continue;
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          if (s.x < -100 || s.x > W + 100 || s.y < -100 || s.y > H + 100)
            s.dead = true;
        }

        if (fallingShapes.length > 50) {
          fallingShapes.splice(
            0,
            fallingShapes.length,
            ...fallingShapes.filter((s) => !s.dead),
          );
        }
      }

      /* — draw pellets — */
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = PELLET.color;

      for (const p of pellets) {
        if (p.dead) continue;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle); // use angle locked at spawn — never recalculated
        ctx.fillRect(
          -PELLET.width / 2,
          -PELLET.height / 2,
          PELLET.width,
          PELLET.height,
        );
        ctx.restore();
      }

      /* — draw falling shapes (above pellets) — */
      for (const s of fallingShapes) {
        if (s.dead) continue;
        const def = FALLING_SHAPES[s.typeIdx];
        const img = shapeImgs.get(s.typeIdx);
        if (!img || !img.complete) continue;
        ctx.drawImage(img, s.x - def.w / 2, s.y - def.h / 2, def.w, def.h);
      }

      /* — draw attached shapes + connector lines — */
      ctx.strokeStyle = CONNECTOR.color;
      ctx.lineWidth = CONNECTOR.width;
      ctx.lineCap = "round";
      ctx.setLineDash([CONNECTOR.dashLen, CONNECTOR.dashGap]);

      // Build id→world-pos lookup. Includes ripple offset so lines follow pulses.
      const shapeWPos = new Map<number, { wx: number; wy: number }>();
      for (const a of attachedShapes) {
        shapeWPos.set(a.id, { wx: x + a.lx + a.rlx, wy: y + a.ly + a.rly });
      }

      // Pass 1 — connector lines: head→shape and shape→shape (explicit edges only)
      for (const a of attachedShapes) {
        const { wx: shapeWx, wy: shapeWy } = shapeWPos.get(a.id)!;

        // Head parent lines
        for (const hIdx of a.parentHeadIdx) {
          ctx.beginPath();
          ctx.moveTo(x + EMITTERS[hIdx].ox, y + EMITTERS[hIdx].oy);
          ctx.lineTo(shapeWx, shapeWy);
          ctx.stroke();
        }

        // Shape parent lines (depth 2+)
        for (const pid of a.parentShapeIds) {
          const pos = shapeWPos.get(pid);
          if (!pos) continue;
          ctx.beginPath();
          ctx.moveTo(pos.wx, pos.wy);
          ctx.lineTo(shapeWx, shapeWy);
          ctx.stroke();
        }
      }

      // Pass 2 — shape images drawn on top of all lines
      ctx.setLineDash([]); // reset so image rendering is unaffected
      for (const a of attachedShapes) {
        const { wx: shapeWx, wy: shapeWy } = shapeWPos.get(a.id)!;
        const def = FALLING_SHAPES[a.typeIdx];
        const img = shapeImgs.get(a.typeIdx);
        if (img && img.complete) {
          ctx.drawImage(
            img,
            shapeWx - def.w / 2,
            shapeWy - def.h / 2,
            def.w,
            def.h,
          );
        }
      }
    };

    gsap.ticker.add(tick);

    /* ── mouse event handlers ───────────────────────────────────── */
    const onMove = (e: MouseEvent) => {
      const r = container.getBoundingClientRect();
      mouseX = e.clientX - r.left;
      mouseY = e.clientY - r.top;
    };

    const onEnter = (e: MouseEvent) => {
      const r = container.getBoundingClientRect();
      mouseX = e.clientX - r.left;
      mouseY = e.clientY - r.top;
      // Immediate burst toward mouse on entry
      fireMouse();
      mode = "active";
      activeFrame = 0;
    };

    const onLeave = () => {
      if (mode === "active" || mode === "tapering") {
        mode = "tapering";
        taperLeft = TAPER_SHOTS;
        taperFrame = ACTIVE_EVERY; // fire the first taper shot on the very next tick
      }
    };

    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mouseleave", onLeave);

    /* ── Draggable + InertiaPlugin ──────────────────────────────── */
    Draggable.create(svg, {
      type: "x,y",
      bounds: container,
      inertia: true,
      cursor: "grab",
      activeCursor: "grabbing",

      onPress() {
        paused = true;
        prevThrowX = Number(gsap.getProperty(svg, "x"));
        prevThrowY = Number(gsap.getProperty(svg, "y"));
      },

      onThrowUpdate() {
        const cx = Number(gsap.getProperty(svg, "x"));
        const cy = Number(gsap.getProperty(svg, "y"));
        const maxX = container.offsetWidth - SVG_W;
        const maxY = container.offsetHeight - SVG_H;
        const dvx = cx - prevThrowX;
        const dvy = cy - prevThrowY;
        prevThrowX = cx;
        prevThrowY = cy;

        const hitX = cx <= 1 || cx >= maxX - 1;
        const hitY = cy <= 1 || cy >= maxY - 1;

        if (hitX || hitY) {
          vx = hitX ? -dvx : dvx;
          vy = hitY ? -dvy : dvy;
          x = Math.max(0, Math.min(maxX, cx));
          y = Math.max(0, Math.min(maxY, cy));
          gsap.set(svg, { x, y });
          gsap.killTweensOf(svg);
          paused = false;
        } else {
          x = cx;
          y = cy;
        }
      },

      onThrowComplete() {
        x = Number(gsap.getProperty(svg, "x"));
        y = Number(gsap.getProperty(svg, "y"));
        const angle = Math.atan2(vy || 1, vx || 1);
        vx = Math.cos(angle) * AUTO_SPEED;
        vy = Math.sin(angle) * AUTO_SPEED;
        paused = false;
      },

      onClick() {
        vx += (Math.random() - 0.5) * 2 * NUDGE_V;
        vy += (Math.random() - 0.5) * 2 * NUDGE_V;
        paused = false;
      },
    });

    return () => {
      gsap.ticker.remove(tick);
      Draggable.get(svg)?.kill();
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseenter", onEnter);
      container.removeEventListener("mouseleave", onLeave);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      {/* Pellet canvas — behind SVG, pointer-events off */}
      <canvas
        ref={canvasRef}
        className={styles.pelletCanvas}
        aria-hidden="true"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={svgRef}
        src="/SVG/the-connecter.svg"
        alt=""
        aria-hidden="true"
        draggable={false}
        width={SVG_W}
        height={SVG_H}
        className={styles.svg}
      />
    </div>
  );
}
