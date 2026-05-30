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
 *
 * Graph layout: d3-force simulation in local SVG coordinates.
 * Head nodes are fixed (fx/fy = emitter offsets). Shape nodes are free.
 * connectShape() decides WHO connects to WHO (topology rules).
 * d3-force decides WHERE nodes end up (physics).
 * Rendering adds SVG world position to all local node coords each frame.
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCollide,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
  type ForceLink,
} from "d3-force";
import styles from "./BounceCanvas.module.css";

gsap.registerPlugin(Draggable, InertiaPlugin);

/* ── SVG size ─────────────────────────────────────────────────── */
const SVG_W = 120;
const SVG_H = 120;

/* ── bounce physics ───────────────────────────────────────────── */
const AUTO_SPEED = 2.5; // px/frame at 60 fps
const NUDGE_V = 1;      // px/frame added per nudge axis

/* ── pellet visual config ─────────────────────────────────────── */
const PELLET = {
  width: 8,
  height: 4,
  color: "#ffffff",
  speed: 30,      // px per frame at 60 fps
  maxBounces: 0,  // disappears on the (maxBounces+1)th wall crossing
};

/* ── emitter offsets — local SVG coordinates (120 × 120) ─────── */
const EMITTERS = [
  { ox: 60, oy: 10,  dx:  0, dy: -1 }, // top    — fires up
  { ox: 60, oy: 110, dx:  0, dy:  1 }, // bottom — fires down
  { ox: 10, oy: 60,  dx: -1, dy:  0 }, // left   — fires left
  { ox: 110, oy: 60, dx:  1, dy:  0 }, // right  — fires right
] as const;

/* ── falling shape types ─────────────────────────────────────── */
const FALLING_SHAPES = [
  { src: "/SVG/object.svg",  w: 40, h: 40 },
  { src: "/SVG/object2.svg", w: 20, h: 20 },
];

/* ── falling shape spawn config ──────────────────────────────── */
const SPAWN = {
  minInterval: 1500, // ms — shortest wait before next shape
  maxInterval: 3500, // ms — longest wait before next shape
  speed: 1.5,        // px/frame downward (scaled by dt)
  maxActive: 4,      // cap on simultaneous falling shapes
};

/* ── connector line style + topology rules ───────────────────── */
const CONNECTOR = {
  color: "#FFD53C",
  width: 2,
  dashLen: 6,  // px — dashed segment length
  dashGap: 4,  // px — gap between dashes
  // Topology rules control WHO connects to WHO.
  // d3-force controls WHERE nodes end up.
  HEAD_BIAS: 0.6,        // multiply head dist by this before closest-anchor race
  HEAD_MAX_CHILDREN: 3,  // max direct children per head
  SHAPE_MAX_CHILDREN: 2, // max direct children per non-head shape
  CHAIN_MAX: 3,          // max chain depth from a head
};

/* ── d3-force simulation config ──────────────────────────────── */
const SIM = {
  linkDistance: 70,   // target edge length in local SVG px
  linkStrength: 0.8,  // spring stiffness (0–1)
  chargeStrength: -80, // node repulsion — negative = push apart
  collideRadius: 22,  // hard collision radius (≈ half of 40px shape)
  alphaDecay: 0.02,       // cooling rate — lower = longer settle time
  alphaOnAdd: 0.3,        // alpha kick when a new shape is connected
  alphaIdleTarget: 0.05,  // persistent target — sim stays alive as SVG bounces
  alphaDragTarget: 0.3,   // keeps sim hot while a node is held
  dragHitRadius: 20,      // px — click detection radius around a node center
};

/* ── burst timing ─────────────────────────────────────────────── */
const BURST_COUNT_MIN = 3;
const BURST_COUNT_MAX = 5;
const BURST_INTERVAL  = 320;  // ms between dashes within a burst
const BURST_COOLDOWN  = 3000; // ms between bursts (passive)
const ACTIVE_EVERY    = 6;    // frames between shots in active mode
const TAPER_SHOTS     = 5;    // shots fired after mouse leaves

/* ── types ────────────────────────────────────────────────────── */
interface Pellet {
  x: number; y: number; vx: number; vy: number;
  angle: number;       // locked at birth — never recalculated
  tx: number | null;   // convergence target (active mode); null = passive
  ty: number | null;
  bounces: number;
  dead: boolean;
}

interface FallingShape {
  typeIdx: number;
  x: number; y: number; vx: number; vy: number;
  dead: boolean;
}

/** Node in the d3-force simulation — positions are LOCAL to the SVG */
interface SimNode extends SimulationNodeDatum {
  id: number; // -(i+1) for head nodes (-1 to -4), 0+ for captured shapes
}

type SimLink = SimulationLinkDatum<SimNode>;

interface AttachedShape {
  id: number;
  typeIdx: number;
  depth: number;          // hops from nearest head (0 = direct head child)
  parentHeadIdx: number[];
  parentShapeIds: number[];
}

type Mode = "passive" | "active" | "tapering";

/* ══════════════════════════════════════════════════════════════ */
export default function BounceCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const svgRef       = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas    = canvasRef.current;
    const svg       = svgRef.current;
    if (!container || !canvas || !svg) return;

    /* ── canvas sizing ──────────────────────────────────────────── */
    const syncSize = () => {
      canvas.width  = container.offsetWidth;
      canvas.height = container.offsetHeight;
    };
    syncSize();
    const ro = new ResizeObserver(syncSize);
    ro.observe(container);
    const ctx = canvas.getContext("2d")!;

    /* ── SVG bounce state ───────────────────────────────────────── */
    let x  = Math.random() * Math.max(0, container.offsetWidth  - SVG_W);
    let y  = Math.random() * Math.max(0, container.offsetHeight - SVG_H);
    let vx = AUTO_SPEED * (Math.random() > 0.5 ? 1 : -1);
    let vy = AUTO_SPEED * (Math.random() > 0.5 ? 1 : -1);
    let paused     = false;
    let prevThrowX = x;
    let prevThrowY = y;
    gsap.set(svg, { x, y });

    /* ── pellet state ───────────────────────────────────────────── */
    const pellets: Pellet[] = [];
    let mode: Mode = "passive";
    let mouseX = 0, mouseY = 0;

    // passive burst state
    let nextBurstAt  = performance.now() + 600; // first burst after 0.6 s
    let burstActive  = false;
    let burstCount   = 0;
    let burstMax     = 0;
    let nextPelletAt = 0;

    // active
    let activeFrame = 0;

    // taper
    let taperLeft  = 0;
    let taperFrame = 0;

    // node drag
    let draggingNode: SimNode | null = null;

    /* ── falling shapes state ──────────────────────────────────── */
    const shapeImgs = new Map<number, HTMLImageElement>();
    FALLING_SHAPES.forEach((def, i) => {
      const img = new Image();
      img.src = def.src;
      shapeImgs.set(i, img);
    });

    const fallingShapes: FallingShape[] = [];
    let nextSpawnAt = performance.now() + SPAWN.minInterval;

    /* ── d3-force graph state ───────────────────────────────────── */
    // 4 head nodes — pinned to SVG world position + emitter offset each tick
    const headNodes: SimNode[] = EMITTERS.map((e, i) => ({
      id: -(i + 1), // -1, -2, -3, -4
      x:  x + e.ox, // world coords — updated every tick via fx/fy
      y:  y + e.oy,
      fx: x + e.ox,
      fy: y + e.oy,
    }));

    const shapeNodes: SimNode[] = [];
    const simLinks:   SimLink[] = [];

    // id → SimNode lookup used in connectShape and drawing
    const nodeMap = new Map<number, SimNode>();
    headNodes.forEach((n) => nodeMap.set(n.id, n));

    const linkForce = forceLink<SimNode, SimLink>(simLinks)
      .distance(SIM.linkDistance)
      .strength(SIM.linkStrength);

    const simulation = forceSimulation<SimNode>([...headNodes])
      .force("link",    linkForce)
      .force("charge",  forceManyBody<SimNode>().strength(SIM.chargeStrength))
      .force("collide", forceCollide<SimNode>(SIM.collideRadius))
      .alphaDecay(SIM.alphaDecay)
      .stop(); // idle until first shape is connected

    const attachedShapes: AttachedShape[] = [];
    const headChildCount  = [0, 0, 0, 0];
    const shapeChildCount = new Map<number, number>();
    let   nextShapeId     = 0;

    /* ── helpers ────────────────────────────────────────────────── */
    const spawn = (
      wx: number, wy: number,
      ndx: number, ndy: number,
      tx: number | null = null,
      ty: number | null = null,
    ) => {
      const len   = Math.hypot(ndx, ndy) || 1;
      const angle = Math.atan2(ndy, ndx); // locked once at birth
      pellets.push({
        x: wx, y: wy,
        vx: (ndx / len) * PELLET.speed,
        vy: (ndy / len) * PELLET.speed,
        angle, tx, ty, bounces: 0, dead: false,
      });
    };

    // Passive: all heads fire outward along their face normal
    const firePassive = () => {
      for (const e of EMITTERS) spawn(x + e.ox, y + e.oy, e.dx, e.dy);
    };

    // Active: all heads aim at current mouse position
    const fireMouse = () => {
      const mx = mouseX, my = mouseY;
      for (const e of EMITTERS) {
        const wx = x + e.ox, wy = y + e.oy;
        spawn(wx, wy, mx - wx, my - wy, mx, my);
      }
    };

    /**
     * connectShape — topology rules pick the parent; d3-force finds the position.
     *
     * Keeps:  directional gate, HEAD_BIAS, HEAD_MAX_CHILDREN,
     *         SHAPE_MAX_CHILDREN, CHAIN_MAX, depth tracking.
     * Removes: snap distance, exclusion zone, elastic tween, ripple settle —
     *          d3-force handles all placement organically.
     */
    const connectShape = (s: FallingShape) => {
      const svgCx = x + SVG_W / 2;
      const svgCy = y + SVG_H / 2;

      /* ── Step 1: find closest eligible parent ──────────────────── */
      let bestDist     = Infinity;
      let parentHeadIdx:  number[] = [];
      let parentShapeIds: number[] = [];
      let parentNodeId: number | null = null;

      // Check all 4 robot heads — directional gate + bias
      for (let i = 0; i < EMITTERS.length; i++) {
        const e   = EMITTERS[i];
        const hwx = x + e.ox;
        const hwy = y + e.oy;
        // Gate: shape must be on the outward side of this head
        const dot = (s.x - svgCx) * e.dx + (s.y - svgCy) * e.dy;
        if (dot <= 0) continue;
        // Cap: skip heads already at max direct children
        if (headChildCount[i] >= CONNECTOR.HEAD_MAX_CHILDREN) continue;
        // Bias: heads appear closer than they are → win more aggressively
        const d = Math.hypot(s.x - hwx, s.y - hwy) * CONNECTOR.HEAD_BIAS;
        if (d < bestDist) {
          bestDist       = d;
          parentHeadIdx  = [i];
          parentShapeIds = [];
          parentNodeId   = -(i + 1);
        }
      }

      // Check already-attached shapes (live world positions from d3 simulation)
      for (const a of attachedShapes) {
        if (a.depth >= CONNECTOR.CHAIN_MAX) continue;
        if ((shapeChildCount.get(a.id) ?? 0) >= CONNECTOR.SHAPE_MAX_CHILDREN) continue;
        const aNode = nodeMap.get(a.id);
        if (!aNode) continue;
        const awx = aNode.x ?? 0; // world coords — no offset needed
        const awy = aNode.y ?? 0;
        // Same-side gate: skip shapes on the opposite half of the SVG center
        const sameSide =
          (s.x - svgCx) * (awx - svgCx) + (s.y - svgCy) * (awy - svgCy);
        if (sameSide <= 0) continue;
        const d = Math.hypot(s.x - awx, s.y - awy);
        if (d < bestDist) {
          bestDist       = d;
          parentHeadIdx  = [];
          parentShapeIds = [a.id];
          parentNodeId   = a.id;
        }
      }

      // No eligible parent found — shape vanishes without connecting
      if (parentNodeId === null) return;
      const parentNode = nodeMap.get(parentNodeId);
      if (!parentNode) return;

      /* ── Step 2: create d3 node at world impact position ────── */
      // Simulation is now world-space — no offset conversion needed.
      const id      = nextShapeId++;
      const newNode: SimNode = {
        id,
        x: s.x, // world coords directly
        y: s.y,
      };
      shapeNodes.push(newNode);
      nodeMap.set(id, newNode);

      /* ── Step 3: create link parent → new shape ─────────────── */
      simLinks.push({ source: parentNode, target: newNode });

      /* ── Step 4: update simulation — graph breathes open ─────── */
      simulation.nodes([...headNodes, ...shapeNodes]);
      (simulation.force("link") as ForceLink<SimNode, SimLink>).links(simLinks);
      // alphaTarget keeps the sim alive indefinitely so it responds to
      // head position changes as the SVG bounces around the canvas.
      simulation.alphaTarget(SIM.alphaIdleTarget).alpha(SIM.alphaOnAdd).restart();

      /* ── Step 5: record topology ─────────────────────────────── */
      const parentDepth =
        parentShapeIds.length > 0
          ? (attachedShapes.find((a) => a.id === parentShapeIds[0])?.depth ?? 0)
          : -1;
      attachedShapes.push({
        id, typeIdx: s.typeIdx,
        depth: parentDepth + 1,
        parentHeadIdx, parentShapeIds,
      });

      if (parentHeadIdx.length > 0)  headChildCount[parentHeadIdx[0]]++;
      if (parentShapeIds.length > 0) {
        const pid = parentShapeIds[0];
        shapeChildCount.set(pid, (shapeChildCount.get(pid) ?? 0) + 1);
      }
    };

    /* ── main ticker ────────────────────────────────────────────── */
    const tick = () => {
      const now = performance.now();
      const W   = canvas.width;
      const H   = canvas.height;
      const dt  = gsap.ticker.deltaRatio(60);

      /* — sync SVG world position during drag — */
      if (paused) {
        x = Number(gsap.getProperty(svg, "x"));
        y = Number(gsap.getProperty(svg, "y"));
      }

      /* — drive head nodes to SVG world position every frame — */
      for (let i = 0; i < headNodes.length; i++) {
        headNodes[i].fx = x + EMITTERS[i].ox;
        headNodes[i].fy = y + EMITTERS[i].oy;
      }
      // Keep sim alive when shapes are connected (SVG bounces continuously)
      if (attachedShapes.length > 0 && simulation.alpha() < SIM.alphaIdleTarget) {
        simulation.alpha(SIM.alphaIdleTarget).restart();
      }

      /* — keep dragged node pinned to cursor in world space — */
      if (draggingNode) {
        draggingNode.fx = mouseX; // already world coords
        draggingNode.fy = mouseY;
      }

      /* — SVG bounce — */
      if (!paused) {
        const maxX = W - SVG_W;
        const maxY = H - SVG_H;
        const spd  = Math.hypot(vx, vy);

        if (spd > AUTO_SPEED + 0.1) {
          vx *= 0.97; vy *= 0.97;
        } else if (spd < AUTO_SPEED * 0.9) {
          const s = AUTO_SPEED / Math.max(spd, 0.01);
          vx *= s; vy *= s;
        }

        x += vx * dt; y += vy * dt;

        if (x <= 0)    { x = 0;    vx =  Math.abs(vx); }
        if (x >= maxX) { x = maxX; vx = -Math.abs(vx); }
        if (y <= 0)    { y = 0;    vy =  Math.abs(vy); }
        if (y >= maxY) { y = maxY; vy = -Math.abs(vy); }

        gsap.set(svg, { x, y });
      }

      /* — firing logic — */
      if (mode === "passive") {
        if (!burstActive && now >= nextBurstAt) {
          burstActive = true;
          burstCount  = 0;
          burstMax    = BURST_COUNT_MIN +
            Math.floor(Math.random() * (BURST_COUNT_MAX - BURST_COUNT_MIN + 1));
          nextPelletAt = now;
        }
        if (burstActive && now >= nextPelletAt) {
          firePassive();
          burstCount++;
          nextPelletAt = now + BURST_INTERVAL;
          if (burstCount >= burstMax) {
            burstActive  = false;
            nextBurstAt  = now + BURST_COOLDOWN;
          }
        }
      } else if (mode === "active") {
        if (++activeFrame >= ACTIVE_EVERY) { activeFrame = 0; fireMouse(); }
      } else /* tapering */ {
        if (taperLeft > 0 && ++taperFrame >= ACTIVE_EVERY) {
          taperFrame = 0; fireMouse(); taperLeft--;
        }
        if (taperLeft <= 0) {
          mode        = "passive";
          nextBurstAt = now + 800;
          burstActive = false;
        }
      }

      /* — update pellets — */
      for (const p of pellets) {
        if (p.dead) continue;

        p.x += p.vx; // fixed step — no dt, no drift
        p.y += p.vy;

        // Convergence kill: die when the pellet passes its target
        if (
          p.tx !== null &&
          (p.tx - p.x) * p.vx + (p.ty! - p.y) * p.vy < 0
        ) {
          p.dead = true; continue;
        }

        // Pellet × falling-shape AABB collision — passive AND active
        for (const s of fallingShapes) {
          if (s.dead) continue;
          const def = FALLING_SHAPES[s.typeIdx];
          const hw  = def.w / 2, hh = def.h / 2;
          if (
            p.x >= s.x - hw && p.x <= s.x + hw &&
            p.y >= s.y - hh && p.y <= s.y + hh
          ) {
            p.dead = true; s.dead = true;
            connectShape(s);
            break;
          }
        }
        if (p.dead) continue;

        // Wall bounce / die
        let hit = false;
        if (p.x < 0)  { p.x = 0;  p.vx =  Math.abs(p.vx); hit = true; }
        if (p.x > W)  { p.x = W;  p.vx = -Math.abs(p.vx); hit = true; }
        if (p.y < 0)  { p.y = 0;  p.vy =  Math.abs(p.vy); hit = true; }
        if (p.y > H)  { p.y = H;  p.vy = -Math.abs(p.vy); hit = true; }
        if (hit) {
          p.bounces++;
          if (p.bounces > PELLET.maxBounces) p.dead = true;
        }
      }

      if (pellets.length > 200) {
        pellets.splice(0, pellets.length, ...pellets.filter((p) => !p.dead));
      }

      /* — falling shapes: spawn, move, prune — */
      {
        const activeCount = fallingShapes.filter((s) => !s.dead).length;
        if (activeCount < SPAWN.maxActive && now >= nextSpawnAt) {
          const typeIdx = Math.floor(Math.random() * FALLING_SHAPES.length);
          const roll    = Math.random();
          let sx: number, sy: number, svx: number, svy: number;
          if (roll < 0.5) {
            sx = Math.random() * W; sy = -50;     svx = 0;               svy =  SPAWN.speed;
          } else if (roll < 0.7) {
            sx = -50;               sy = Math.random() * H * 0.7; svx =  SPAWN.speed * 0.6; svy = SPAWN.speed * 0.8;
          } else if (roll < 0.9) {
            sx = W + 50;            sy = Math.random() * H * 0.7; svx = -SPAWN.speed * 0.6; svy = SPAWN.speed * 0.8;
          } else {
            sx = Math.random() * W; sy = H + 50;  svx = 0;               svy = -SPAWN.speed;
          }
          fallingShapes.push({ typeIdx, x: sx, y: sy, vx: svx, vy: svy, dead: false });
          nextSpawnAt = now + SPAWN.minInterval +
            Math.random() * (SPAWN.maxInterval - SPAWN.minInterval);
        }

        for (const s of fallingShapes) {
          if (s.dead) continue;
          s.x += s.vx * dt; s.y += s.vy * dt;
          if (s.x < -100 || s.x > W + 100 || s.y < -100 || s.y > H + 100) s.dead = true;
        }
        if (fallingShapes.length > 50) {
          fallingShapes.splice(0, fallingShapes.length, ...fallingShapes.filter((s) => !s.dead));
        }
      }

      /* ─────────────────────── DRAW ────────────────────────────── */
      ctx.clearRect(0, 0, W, H);

      /* — pellets — */
      ctx.fillStyle = PELLET.color;
      for (const p of pellets) {
        if (p.dead) continue;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle); // angle locked at spawn
        ctx.fillRect(-PELLET.width / 2, -PELLET.height / 2, PELLET.width, PELLET.height);
        ctx.restore();
      }

      /* — falling shapes (above pellets) — */
      for (const s of fallingShapes) {
        if (s.dead) continue;
        const def = FALLING_SHAPES[s.typeIdx];
        const img = shapeImgs.get(s.typeIdx);
        if (!img || !img.complete) continue;
        ctx.drawImage(img, s.x - def.w / 2, s.y - def.h / 2, def.w, def.h);
      }

      /* — attached shapes + connector lines — */
      if (attachedShapes.length > 0) {
        ctx.strokeStyle = CONNECTOR.color;
        ctx.lineWidth   = CONNECTOR.width;
        ctx.lineCap     = "round";
        ctx.setLineDash([CONNECTOR.dashLen, CONNECTOR.dashGap]);

        // Pass 1 — connector lines: head→shape and shape→shape
        // All node positions are now world coords — no SVG offset needed.
        for (const a of attachedShapes) {
          const aNode = nodeMap.get(a.id);
          if (!aNode) continue;
          const awx = aNode.x ?? 0; // world coords
          const awy = aNode.y ?? 0;

          for (const hIdx of a.parentHeadIdx) {
            ctx.beginPath();
            ctx.moveTo(x + EMITTERS[hIdx].ox, y + EMITTERS[hIdx].oy); // head stays exact
            ctx.lineTo(awx, awy);
            ctx.stroke();
          }
          for (const pid of a.parentShapeIds) {
            const pNode = nodeMap.get(pid);
            if (!pNode) continue;
            ctx.beginPath();
            ctx.moveTo(pNode.x ?? 0, pNode.y ?? 0); // world coords
            ctx.lineTo(awx, awy);
            ctx.stroke();
          }
        }

        // Pass 2 — shape images on top of all connector lines
        ctx.setLineDash([]);
        for (const a of attachedShapes) {
          const aNode = nodeMap.get(a.id);
          if (!aNode) continue;
          const awx = aNode.x ?? 0; // world coords
          const awy = aNode.y ?? 0;
          const def = FALLING_SHAPES[a.typeIdx];
          const img = shapeImgs.get(a.typeIdx);
          if (img && img.complete) {
            ctx.drawImage(img, awx - def.w / 2, awy - def.h / 2, def.w, def.h);
          }
        }
      }
    };

    gsap.ticker.add(tick);

    /* ── mouse event handlers ───────────────────────────────────── */
    const onMove = (e: MouseEvent) => {
      const r = container.getBoundingClientRect();
      mouseX = e.clientX - r.left;
      mouseY = e.clientY - r.top;
      // Show grab cursor when hovering a graph node
      if (!draggingNode) {
        const over = shapeNodes.some((n) => {
          const wx = n.x ?? 0; // world coords
          const wy = n.y ?? 0;
          return Math.hypot(mouseX - wx, mouseY - wy) < SIM.dragHitRadius;
        });
        canvas.style.cursor = over ? "grab" : "";
      }
    };

    const onEnter = (e: MouseEvent) => {
      const r = container.getBoundingClientRect();
      mouseX = e.clientX - r.left;
      mouseY = e.clientY - r.top;
      fireMouse();
      mode        = "active";
      activeFrame = 0;
    };

    const onLeave = () => {
      if (mode === "active" || mode === "tapering") {
        mode       = "tapering";
        taperLeft  = TAPER_SHOTS;
        taperFrame = ACTIVE_EVERY; // fire the first taper shot on the very next tick
      }
    };

    /** Pin a graph node under the cursor and heat the simulation. */
    const onNodeDown = (e: MouseEvent) => {
      if (e.target === svg) return; // let GSAP Draggable handle the robot
      const r  = container.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      for (const node of shapeNodes) {
        const wx = node.x ?? 0; // world coords
        const wy = node.y ?? 0;
        if (Math.hypot(mx - wx, my - wy) < SIM.dragHitRadius) {
          draggingNode = node;
          node.fx = node.x ?? 0;
          node.fy = node.y ?? 0;
          simulation.alphaTarget(SIM.alphaDragTarget).restart();
          canvas.style.cursor = "grabbing";
          break;
        }
      }
    };

    /** Release the pinned node — drop back to idle target, not zero. */
    const onNodeUp = () => {
      if (draggingNode) {
        simulation.alphaTarget(SIM.alphaIdleTarget); // keep sim alive for bouncing
        draggingNode.fx = null;
        draggingNode.fy = null;
        draggingNode    = null;
        canvas.style.cursor = "";
      }
    };

    container.addEventListener("mousemove",  onMove);
    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mouseleave", onLeave);
    container.addEventListener("mousedown",  onNodeDown);
    container.addEventListener("mouseup",    onNodeUp);

    /* ── Draggable + InertiaPlugin ──────────────────────────────── */
    Draggable.create(svg, {
      type: "x,y",
      bounds: container,
      inertia: true,
      cursor: "grab",
      activeCursor: "grabbing",

      onPress() {
        paused     = true;
        prevThrowX = Number(gsap.getProperty(svg, "x"));
        prevThrowY = Number(gsap.getProperty(svg, "y"));
      },

      onThrowUpdate() {
        const cx   = Number(gsap.getProperty(svg, "x"));
        const cy   = Number(gsap.getProperty(svg, "y"));
        const maxX = container.offsetWidth  - SVG_W;
        const maxY = container.offsetHeight - SVG_H;
        const dvx  = cx - prevThrowX;
        const dvy  = cy - prevThrowY;
        prevThrowX = cx;
        prevThrowY = cy;

        const hitX = cx <= 1 || cx >= maxX - 1;
        const hitY = cy <= 1 || cy >= maxY - 1;

        if (hitX || hitY) {
          vx = hitX ? -dvx : dvx;
          vy = hitY ? -dvy : dvy;
          x  = Math.max(0, Math.min(maxX, cx));
          y  = Math.max(0, Math.min(maxY, cy));
          gsap.set(svg, { x, y });
          gsap.killTweensOf(svg);
          paused = false;
        } else {
          x = cx; y = cy;
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
      simulation.stop();
      Draggable.get(svg)?.kill();
      container.removeEventListener("mousemove",  onMove);
      container.removeEventListener("mouseenter", onEnter);
      container.removeEventListener("mouseleave", onLeave);
      container.removeEventListener("mousedown",  onNodeDown);
      container.removeEventListener("mouseup",    onNodeUp);
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
