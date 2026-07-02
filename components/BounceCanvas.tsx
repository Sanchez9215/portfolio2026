"use client";

/**
 * BounceCanvas — full-page fixed canvas layer
 *
 * Villains enter from a screen edge, travel straight across, disappear off far edge.
 *   Rotation: left/right → 0° (default), top → 90° CW, bottom → 90° CCW
 *   Hit robot → spawn AutonomousCluster (center shape + up to 5 branches,
 *               full bounce physics, spring-force internal layout, yellow connector lines)
 *   Hit cluster → scatter all nodes as free nodes
 *
 * Falling shapes connect to robot network on direct contact with robot bounding box.
 *
 * Exclusion zones:
 *   textZones — robot overlaps `overlapPx` into the zone (behind text)
 *   gapZones  — robot stays `gapPx` clear of the zone edge
 */

import { useEffect, useRef, useState } from "react";
import type React from "react";
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
import BulletBaby, { type VillainHandle } from "./BulletBaby";

gsap.registerPlugin(Draggable, InertiaPlugin);

/* ── SVG size ─────────────────────────────────────────────────── */
const SVG_W = 120;
const SVG_H = 120;

/* ── bounce physics ───────────────────────────────────────────── */
const AUTO_SPEED = 2.5;
const NUDGE_V = 1;

/* ── attached shape outline ───────────────────────────────────── */
const SHAPE_OUTLINE = {
  color: "#0F8EFE",
  width: 0,
};

/* ── falling shape types ─────────────────────────────────────── */
const FALLING_SHAPES = [
  { src: "/SVG/object.svg", w: 20, h: 20 },
  { src: "/SVG/object2.svg", w: 20, h: 20 },
  { src: "/SVG/baby-star.svg", w: 16, h: 16 },
  { src: "/SVG/baby-diamond.svg", w: 20, h: 20 },
  { src: "/SVG/baby-clover.svg", w: 20, h: 20 },
  { src: "/SVG/baby-pieChart.svg", w: 20, h: 20 },
  { src: "/SVG/baby-pieChart-1.svg", w: 20, h: 20 },
  { src: "/SVG/double-diamond.svg", w: 20, h: 20 },
  { src: "/SVG/beach-ball.svg", w: 20, h: 20 },
];

/* ── falling shape spawn config ──────────────────────────────── */
const SPAWN = {
  minInterval: 1500,
  maxInterval: 3500,
  speed: 1.5,
  maxActive: 4,
};

/* ── connector line style + topology rules ───────────────────── */
const CONNECTOR = {
  color: "#ffffff",
  width: 0.5,
  dashLen: 4,
  dashGap: 4,
  HEAD_BIAS: 0.6,
  HEAD_MAX_CHILDREN: 3,
  SHAPE_MAX_CHILDREN: 2,
  CHAIN_MAX: 2,
  // Cross-link config — proximity links between adjacent outer branches
  CROSS_LINK_DIST: 250,       // max px between two nodes to allow a cross-link
  CROSS_LINK_MAX_PER_NODE: 1, // max cross-links a single node can have
  CROSS_LINK_SCAN_INTERVAL: 90, // frames between periodic all-pairs scans
};

/* ── d3-force simulation config ──────────────────────────────── */
const SIM = {
  linkDistance: 120,
  linkStrength: 0.8,
  chargeStrength: -120,
  collideRadius: 30,
  alphaDecay: 0.02,
  alphaOnAdd: 0.3,
  alphaIdleTarget: 0.05,
  alphaDragTarget: 0.3,
  dragHitRadius: 20,
};

/* ── head emitter offsets (local SVG coords) — for d3 head placement ── */
const EMITTERS = [
  { ox: 60, oy: 10, dx: 0, dy: -1 },
  { ox: 60, oy: 110, dx: 0, dy: 1 },
  { ox: 10, oy: 60, dx: -1, dy: 0 },
  { ox: 110, oy: 60, dx: 1, dy: 0 },
] as const;

/* ── pellet visual config ─────────────────────────────────────── */
const PELLET = {
  width: 10,
  height: 5,
  color: "#ffffff",
  speed: 8,
  maxBounces: 0,
};

/* ── firing timing ────────────────────────────────────────────── */
const ACTIVE_EVERY = 8;
const TAPER_SHOTS = 5;
const MOUSE_FIRING_ENABLED = false;

/* ── passive cadence ─────────────────────────────────────────── */
const PASSIVE = {
  shortDelay: 180,
  rapidInterval: 300,
  rapidCount: 2,
  longCooldown: 2800,
};

/* ── villain config ───────────────────────────────────────────── */
const VILLAIN = {
  w: 120,
  h: 120,
  speed: 1.8,
  maxCount: 0,
  spawnDelay: 6000,
  hitFlashDur: 10,
  hitCooldown: 45,
  burstSpeed: 3,
};

/* ── free node reconnect config ──────────────────────────────── */
const RECONNECT = {
  radius: 100,
  lerpSpeed: 0.06,
  snapDist: 24,
};

/* ── autonomous cluster config ────────────────────────────────── */
const CLUSTER = {
  speed: AUTO_SPEED,
  branchCount: 5,
  springK: 0.04, // stiffness pulling branch toward rest offset
  damping: 0.88, // branch velocity multiplier per frame
};

/* ── types ────────────────────────────────────────────────────── */
interface Pellet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  bounces: number;
  dead: boolean;
}

interface FallingShape {
  typeIdx: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  dead: boolean;
}

interface SimNode extends SimulationNodeDatum {
  id: number;
}
type SimLink = SimulationLinkDatum<SimNode>;

interface AttachedShape {
  id: number;
  typeIdx: number;
  depth: number;
  parentHeadIdx: number[];
  parentShapeIds: number[];
  /** Which root emitter (0–3) this node traces back to. Used for cross-link branch checks. */
  branchIdx: number;
}

interface Villain {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rotation: number;
  flipY: boolean;
  flashFrames: number;
  hitCooldown: number;
  dead: boolean;
  slotIdx: number;
  isHit: boolean;
}

interface FreeNode {
  typeIdx: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  reconnecting: boolean;
  dead: boolean;
}

interface ClusterNode {
  typeIdx: number;
  relX: number;
  relY: number;
  relVX: number;
  relVY: number;
  targetRelX: number;
  targetRelY: number;
}

interface AutonomousCluster {
  cx: number;
  cy: number;
  cvx: number;
  cvy: number;
  nodes: ClusterNode[];
  links: { a: number; b: number }[];
  hitCooldown: number;
  dead: boolean;
}

/* ── prop types ───────────────────────────────────────────────── */
interface BounceCanvasProps {
  textZones?: React.RefObject<HTMLElement>[];
  gapZones?: React.RefObject<HTMLElement>[];
  overlapPx?: number;
  gapPx?: number;
  activeZoneRef?: React.RefObject<HTMLElement>;
  spawnZoneRef?: React.RefObject<HTMLElement>;
  heroTopContentRef?: React.RefObject<HTMLDivElement>;
  /** Goal 2 — zone the robot migrates toward as the web grows. Wire to imgZoneRef. */
  attractZoneRef?: React.RefObject<HTMLElement>;
}

/* ══════════════════════════════════════════════════════════════ */
export default function BounceCanvas({
  textZones,
  gapZones,
  overlapPx = 16,
  gapPx = 16,
  activeZoneRef,
  spawnZoneRef,
  heroTopContentRef,
}: BounceCanvasProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<HTMLImageElement>(null);
  const villainDomRefs = useRef<(HTMLDivElement | null)[]>([null, null]);
  const villainBabyRefs = useRef<(VillainHandle | null)[]>([null, null]);

  const [slotSizes, setSlotSizes] = useState<[number, number]>([
    VILLAIN.w,
    VILLAIN.w,
  ]);

  const zonesRef = useRef({
    textZones,
    gapZones,
    overlapPx,
    gapPx,
    activeZoneRef,
    spawnZoneRef,
    heroTopContentRef,
  });
  zonesRef.current = {
    textZones,
    gapZones,
    overlapPx,
    gapPx,
    activeZoneRef,
    spawnZoneRef,
    heroTopContentRef,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const bgCanvas = bgCanvasRef.current;
    const svg = svgRef.current;
    if (!canvas || !bgCanvas || !svg) return;

    /* ── canvas sizing ───────────────────────────────────────────── */
    const syncSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      bgCanvas.width = window.innerWidth;
      bgCanvas.height = window.innerHeight;
    };
    syncSize();
    window.addEventListener("resize", syncSize);
    const ctx = canvas.getContext("2d")!;
    const bgCtx = bgCanvas.getContext("2d")!;

    /* ── robot bounce state ──────────────────────────────────────── */
    const heroEl0 = zonesRef.current.activeZoneRef?.current;
    const hr0 = heroEl0 ? heroEl0.getBoundingClientRect() : null;
    const heroMinY0 = hr0 ? hr0.top : 0;
    const heroMaxY0 = hr0 ? hr0.bottom - SVG_H : window.innerHeight - SVG_H;
    const spawnMinX = window.innerWidth * 0.55;
    const spawnMaxX = window.innerWidth - SVG_W;
    let x = spawnMinX + Math.random() * Math.max(0, spawnMaxX - spawnMinX);
    let y =
      heroMinY0 + Math.random() * Math.max(0, (heroMaxY0 - heroMinY0) * 0.55);
    let vx = AUTO_SPEED * (Math.random() > 0.5 ? 1 : -1);
    let vy = AUTO_SPEED * (Math.random() > 0.5 ? 1 : -1);
    let paused = false;
    let prevThrowX = x;
    let prevThrowY = y;
    gsap.set(svg, { x, y });

    /* ── exclusion-zone bound helper ─────────────────────────────── */
    const getEffectiveBounds = (sx: number, sy: number, svy = 0) => {
      const W = canvas.width;
      const H = canvas.height;
      let minX = 0,
        maxX = W - SVG_W,
        minY = 0,
        maxY = H - SVG_H;
      const heroEl = zonesRef.current.activeZoneRef?.current;
      if (heroEl) {
        const hr = heroEl.getBoundingClientRect();
        minY = Math.max(0, hr.top);
        maxY = Math.min(H - SVG_H, hr.bottom - SVG_H);
      }
      const {
        textZones: tz,
        gapZones: gz,
        overlapPx: op,
        gapPx: gp,
      } = zonesRef.current;
      const look = 60;

      for (const ref of tz ?? []) {
        const el = ref.current;
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (
          sy + SVG_H < r.top - op - (svy > 0 ? look : 0) ||
          sy > r.bottom + op + (svy < 0 ? look : 0)
        )
          continue;
        if (r.left + r.width / 2 < W / 2) minX = Math.max(minX, r.right - op);
        else maxX = Math.min(maxX, r.left + op - SVG_W);
      }
      for (const ref of gz ?? []) {
        const el = ref.current;
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (
          sy + SVG_H < r.top - gp - (svy > 0 ? look : 0) ||
          sy > r.bottom + gp + (svy < 0 ? look : 0)
        )
          continue;
        if (r.left + r.width / 2 < W / 2) minX = Math.max(minX, r.right + gp);
        else maxX = Math.min(maxX, r.left - gp - SVG_W);
      }
      return { minX, maxX, minY, maxY };
    };

    /* ── shape image cache + silhouette outline cache ────────────── */
    const shapeImgs = new Map<number, HTMLImageElement>();
    FALLING_SHAPES.forEach((def, i) => {
      const img = new Image();
      img.src = def.src;
      shapeImgs.set(i, img);
    });

    const outlineCanvases = new Map<number, HTMLCanvasElement>();
    const getOutlineCanvas = (typeIdx: number): HTMLCanvasElement | null => {
      if (outlineCanvases.has(typeIdx)) return outlineCanvases.get(typeIdx)!;
      const img = shapeImgs.get(typeIdx);
      const def = FALLING_SHAPES[typeIdx];
      if (!img || !img.complete) return null;
      const pad = SHAPE_OUTLINE.width + 1;
      const ow = def.w + pad * 2,
        oh = def.h + pad * 2;
      const oc = document.createElement("canvas");
      oc.width = ow;
      oc.height = oh;
      const octx = oc.getContext("2d")!;
      for (let dx = -SHAPE_OUTLINE.width; dx <= SHAPE_OUTLINE.width; dx++) {
        for (let dy = -SHAPE_OUTLINE.width; dy <= SHAPE_OUTLINE.width; dy++) {
          if (dx === 0 && dy === 0) continue;
          octx.drawImage(img, pad + dx, pad + dy, def.w, def.h);
        }
      }
      octx.globalCompositeOperation = "source-in";
      octx.fillStyle = SHAPE_OUTLINE.color;
      octx.fillRect(0, 0, ow, oh);
      octx.globalCompositeOperation = "source-over";
      octx.drawImage(img, pad, pad, def.w, def.h);
      outlineCanvases.set(typeIdx, oc);
      return oc;
    };

    /* ── falling shapes state ─────────────────────────────────────── */
    const fallingShapes: FallingShape[] = [];
    let nextSpawnAt = performance.now() + SPAWN.minInterval;

    /* ── villain state ────────────────────────────────────────────── */
    const villainImg = new Image();
    villainImg.src = "/SVG/bullet-baby.svg";
    const villains: Villain[] = [];
    const freeNodes: FreeNode[] = [];
    let nextVillainSpawnAt = performance.now() + VILLAIN.spawnDelay;

    /* ── autonomous cluster state ─────────────────────────────────── */
    const autonomousClusters: AutonomousCluster[] = [];

    /* ── d3-force graph state ─────────────────────────────────────── */
    const headNodes: SimNode[] = EMITTERS.map((e, i) => ({
      id: -(i + 1),
      x: x + e.ox,
      y: y + e.oy,
      fx: x + e.ox,
      fy: y + e.oy,
    }));
    const shapeNodes: SimNode[] = [];
    const simLinks: SimLink[] = [];
    const nodeMap = new Map<number, SimNode>();
    headNodes.forEach((n) => nodeMap.set(n.id, n));

    const linkForce = forceLink<SimNode, SimLink>(simLinks)
      .distance(SIM.linkDistance)
      .strength(SIM.linkStrength);

    const simulation = forceSimulation<SimNode>([...headNodes])
      .force("link", linkForce)
      .force("charge", forceManyBody<SimNode>().strength(SIM.chargeStrength))
      .force("collide", forceCollide<SimNode>(SIM.collideRadius))
      .alphaDecay(SIM.alphaDecay)
      .stop();

    const attachedShapes: AttachedShape[] = [];
    const headChildCount = [0, 0, 0, 0];
    const shapeChildCount = new Map<number, number>();
    let nextShapeId = 0;

    /* ── cross-link bookkeeping ───────────────────────────────────── */
    // crossLinkSet  — "minId-maxId" strings for pairs already cross-linked
    // crossLinkCount — how many cross-links each node currently has
    const crossLinkSet = new Set<string>();
    const crossLinkCount = new Map<number, number>();

    /**
     * Returns true if emitter indices a and b are adjacent (share a corner
     * of the robot) rather than directly opposite through the centre.
     * EMITTERS: 0=top, 1=bottom, 2=left, 3=right
     * Opposite pairs: (0,1) and (2,3) — a cross-link between these would
     * always pass through the robot body.
     */
    const areBranchesAdjacent = (a: number, b: number): boolean => {
      if (a === b) return false;
      if ((a === 0 && b === 1) || (a === 1 && b === 0)) return false;
      if ((a === 2 && b === 3) || (a === 3 && b === 2)) return false;
      return true;
    };

    /**
     * All-pairs cross-link scan. Checks every pair of attached shape nodes
     * and adds a cross-link where both nodes are on adjacent (non-opposite)
     * branches and within CROSS_LINK_DIST of each other.
     *
     * Called immediately after each node attachment AND periodically from
     * the tick loop so pairs that drift into range post-settlement are caught.
     */
    const scanCrossLinks = () => {
      if (attachedShapes.length < 2) return;
      let simDirty = false;

      for (let i = 0; i < attachedShapes.length; i++) {
        const shapeA = attachedShapes[i];
        if (
          (crossLinkCount.get(shapeA.id) ?? 0) >=
          CONNECTOR.CROSS_LINK_MAX_PER_NODE
        )
          continue;
        const nodeA = nodeMap.get(shapeA.id);
        if (!nodeA) continue;
        const ax = nodeA.x ?? 0,
          ay = nodeA.y ?? 0;

        for (let j = i + 1; j < attachedShapes.length; j++) {
          const shapeB = attachedShapes[j];
          if (!areBranchesAdjacent(shapeA.branchIdx, shapeB.branchIdx))
            continue;
          if (
            (crossLinkCount.get(shapeB.id) ?? 0) >=
            CONNECTOR.CROSS_LINK_MAX_PER_NODE
          )
            continue;

          // Deduplication key — smaller id always first
          const key =
            Math.min(shapeA.id, shapeB.id) +
            "-" +
            Math.max(shapeA.id, shapeB.id);
          if (crossLinkSet.has(key)) continue;

          const nodeB = nodeMap.get(shapeB.id);
          if (!nodeB) continue;
          const bx = nodeB.x ?? 0,
            by = nodeB.y ?? 0;

          if (Math.hypot(bx - ax, by - ay) > CONNECTOR.CROSS_LINK_DIST)
            continue;

          // Commit cross-link
          simLinks.push({ source: nodeA, target: nodeB });
          crossLinkSet.add(key);
          crossLinkCount.set(shapeA.id, (crossLinkCount.get(shapeA.id) ?? 0) + 1);
          crossLinkCount.set(shapeB.id, (crossLinkCount.get(shapeB.id) ?? 0) + 1);
          simDirty = true;

          if (
            (crossLinkCount.get(shapeA.id) ?? 0) >=
            CONNECTOR.CROSS_LINK_MAX_PER_NODE
          )
            break; // shapeA is saturated, move on
        }
      }

      if (simDirty) {
        simulation.nodes([...headNodes, ...shapeNodes]);
        (simulation.force("link") as ForceLink<SimNode, SimLink>).links(simLinks);
        simulation
          .alphaTarget(SIM.alphaIdleTarget)
          .alpha(SIM.alphaOnAdd)
          .restart();
      }
    };

    /* ── helpers ──────────────────────────────────────────────────── */
    const connectShape = (s: FallingShape) => {
      const svgCx = x + SVG_W / 2;
      const svgCy = y + SVG_H / 2;
      let bestDist = Infinity;
      let parentHeadIdx: number[] = [];
      let parentShapeIds: number[] = [];
      let parentNodeId: number | null = null;

      for (let i = 0; i < EMITTERS.length; i++) {
        const e = EMITTERS[i];
        const hwx = x + e.ox,
          hwy = y + e.oy;
        const dot = (s.x - svgCx) * e.dx + (s.y - svgCy) * e.dy;
        if (dot <= 0) continue;
        if (headChildCount[i] >= CONNECTOR.HEAD_MAX_CHILDREN) continue;
        const d = Math.hypot(s.x - hwx, s.y - hwy) * CONNECTOR.HEAD_BIAS;
        if (d < bestDist) {
          bestDist = d;
          parentHeadIdx = [i];
          parentShapeIds = [];
          parentNodeId = -(i + 1);
        }
      }
      for (const a of attachedShapes) {
        if (a.depth >= CONNECTOR.CHAIN_MAX) continue;
        if ((shapeChildCount.get(a.id) ?? 0) >= CONNECTOR.SHAPE_MAX_CHILDREN)
          continue;
        const aNode = nodeMap.get(a.id);
        if (!aNode) continue;
        const awx = aNode.x ?? 0,
          awy = aNode.y ?? 0;
        const sameSide =
          (s.x - svgCx) * (awx - svgCx) + (s.y - svgCy) * (awy - svgCy);
        if (sameSide <= 0) continue;
        const d = Math.hypot(s.x - awx, s.y - awy);
        if (d < bestDist) {
          bestDist = d;
          parentHeadIdx = [];
          parentShapeIds = [a.id];
          parentNodeId = a.id;
        }
      }
      if (parentNodeId === null) return;
      const parentNode = nodeMap.get(parentNodeId);
      if (!parentNode) return;

      const id = nextShapeId++;
      const newNode: SimNode = { id, x: s.x, y: s.y };
      shapeNodes.push(newNode);
      nodeMap.set(id, newNode);
      simLinks.push({ source: parentNode, target: newNode });
      simulation.nodes([...headNodes, ...shapeNodes]);
      (simulation.force("link") as ForceLink<SimNode, SimLink>).links(simLinks);
      simulation
        .alphaTarget(SIM.alphaIdleTarget)
        .alpha(SIM.alphaOnAdd)
        .restart();

      const parentDepth =
        parentShapeIds.length > 0
          ? (attachedShapes.find((a) => a.id === parentShapeIds[0])?.depth ?? 0)
          : -1;
      const branchIdx =
        parentHeadIdx.length > 0
          ? parentHeadIdx[0]
          : (attachedShapes.find((a) => a.id === parentShapeIds[0])?.branchIdx ?? 0);
      attachedShapes.push({
        id,
        typeIdx: s.typeIdx,
        depth: parentDepth + 1,
        parentHeadIdx,
        parentShapeIds,
        branchIdx,
      });

      if (parentHeadIdx.length > 0) headChildCount[parentHeadIdx[0]]++;
      if (parentShapeIds.length > 0) {
        const pid = parentShapeIds[0];
        shapeChildCount.set(pid, (shapeChildCount.get(pid) ?? 0) + 1);
      }
      scanCrossLinks();
    };

    /** Detach a set of shape IDs from the main d3 network, updating all bookkeeping. */
    const removeShapesFromNetwork = (ids: Set<number>) => {
      for (const id of Array.from(ids)) {
        const a = attachedShapes.find((as) => as.id === id);
        if (!a) continue;
        for (const hIdx of a.parentHeadIdx)
          headChildCount[hIdx] = Math.max(0, headChildCount[hIdx] - 1);
        for (const pid of a.parentShapeIds)
          shapeChildCount.set(
            pid,
            Math.max(0, (shapeChildCount.get(pid) ?? 0) - 1),
          );
        nodeMap.delete(id);
        // Clean up cross-link bookkeeping for this node
        crossLinkCount.delete(id);
        for (const key of Array.from(crossLinkSet)) {
          const [a, b] = key.split("-").map(Number);
          if (a === id || b === id) {
            crossLinkSet.delete(key);
            const otherId = a === id ? b : a;
            const c = crossLinkCount.get(otherId);
            if (c !== undefined)
              crossLinkCount.set(otherId, Math.max(0, c - 1));
          }
        }
      }
      attachedShapes.splice(
        0,
        attachedShapes.length,
        ...attachedShapes.filter((a) => !ids.has(a.id)),
      );
      shapeNodes.splice(
        0,
        shapeNodes.length,
        ...shapeNodes.filter((n) => !ids.has(n.id)),
      );
      simLinks.splice(
        0,
        simLinks.length,
        ...simLinks.filter((l) => {
          const sid =
            typeof l.source === "object"
              ? (l.source as SimNode).id
              : Number(l.source);
          const tid =
            typeof l.target === "object"
              ? (l.target as SimNode).id
              : Number(l.target);
          return !ids.has(sid) && !ids.has(tid);
        }),
      );
      simulation.nodes([...headNodes, ...shapeNodes]);
      (simulation.force("link") as ForceLink<SimNode, SimLink>).links(simLinks);
      if (shapeNodes.length > 0) simulation.alpha(SIM.alphaOnAdd).restart();
    };

    const reattachFreeNode = (fn: FreeNode): boolean => {
      let bestDist = Infinity;
      let parentNodeId: number | null = null;
      let parentHeadIdx: number[] = [];
      let parentShapeIds: number[] = [];

      for (let i = 0; i < EMITTERS.length; i++) {
        if (headChildCount[i] >= CONNECTOR.HEAD_MAX_CHILDREN) continue;
        const hx = x + EMITTERS[i].ox,
          hy = y + EMITTERS[i].oy;
        const d = Math.hypot(fn.x - hx, fn.y - hy);
        if (d < bestDist) {
          bestDist = d;
          parentHeadIdx = [i];
          parentShapeIds = [];
          parentNodeId = -(i + 1);
        }
      }
      for (const a of attachedShapes) {
        if (a.depth >= CONNECTOR.CHAIN_MAX) continue;
        if ((shapeChildCount.get(a.id) ?? 0) >= CONNECTOR.SHAPE_MAX_CHILDREN)
          continue;
        const n = nodeMap.get(a.id);
        if (!n) continue;
        const d = Math.hypot(fn.x - (n.x ?? 0), fn.y - (n.y ?? 0));
        if (d < bestDist) {
          bestDist = d;
          parentHeadIdx = [];
          parentShapeIds = [a.id];
          parentNodeId = a.id;
        }
      }
      if (parentNodeId === null) return false;
      const parentNode = nodeMap.get(parentNodeId);
      if (!parentNode) return false;

      const id = nextShapeId++;
      const newNode: SimNode = { id, x: fn.x, y: fn.y };
      shapeNodes.push(newNode);
      nodeMap.set(id, newNode);
      simLinks.push({ source: parentNode, target: newNode });
      simulation.nodes([...headNodes, ...shapeNodes]);
      (simulation.force("link") as ForceLink<SimNode, SimLink>).links(simLinks);
      simulation
        .alphaTarget(SIM.alphaIdleTarget)
        .alpha(SIM.alphaOnAdd)
        .restart();

      const parentDepth =
        parentShapeIds.length > 0
          ? (attachedShapes.find((a) => a.id === parentShapeIds[0])?.depth ?? 0)
          : -1;
      const branchIdx =
        parentHeadIdx.length > 0
          ? parentHeadIdx[0]
          : (attachedShapes.find((a) => a.id === parentShapeIds[0])?.branchIdx ?? 0);
      attachedShapes.push({
        id,
        typeIdx: fn.typeIdx,
        depth: parentDepth + 1,
        parentHeadIdx,
        parentShapeIds,
        branchIdx,
      });

      if (parentHeadIdx.length > 0) headChildCount[parentHeadIdx[0]]++;
      if (parentShapeIds.length > 0) {
        const pid = parentShapeIds[0];
        shapeChildCount.set(pid, (shapeChildCount.get(pid) ?? 0) + 1);
      }
      scanCrossLinks();
      return true;
    };

    /**
     * Spawn an AutonomousCluster from the shape closest to (hitX, hitY)
     * plus up to CLUSTER.branchCount nearest neighbours.
     */
    const spawnCluster = (hitX: number, hitY: number) => {
      if (attachedShapes.length === 0) return;

      // Find center shape — closest network node to the impact point
      let centerIdx = 0,
        bestDist = Infinity;
      for (let i = 0; i < attachedShapes.length; i++) {
        const n = nodeMap.get(attachedShapes[i].id);
        if (!n) continue;
        const d = Math.hypot((n.x ?? 0) - hitX, (n.y ?? 0) - hitY);
        if (d < bestDist) {
          bestDist = d;
          centerIdx = i;
        }
      }

      const centerShape = attachedShapes[centerIdx];
      const centerNode = nodeMap.get(centerShape.id);
      if (!centerNode) return;
      const originX = centerNode.x ?? 0;
      const originY = centerNode.y ?? 0;

      // Gather up to branchCount nearest shapes (excluding center)
      const branches = attachedShapes
        .filter((a) => a.id !== centerShape.id)
        .map((a) => {
          const n = nodeMap.get(a.id);
          return {
            shape: a,
            dist: n
              ? Math.hypot((n.x ?? 0) - originX, (n.y ?? 0) - originY)
              : Infinity,
          };
        })
        .sort((a, b) => a.dist - b.dist)
        .slice(0, CLUSTER.branchCount)
        .map((e) => e.shape);

      const allShapes = [centerShape, ...branches];
      const detachIds = new Set(allShapes.map((a) => a.id));

      // Build cluster nodes (relX/relY = offset from cluster origin)
      const clusterNodes: ClusterNode[] = allShapes.map((a) => {
        const n = nodeMap.get(a.id);
        const wx = n?.x ?? originX;
        const wy = n?.y ?? originY;
        const rx = wx - originX,
          ry = wy - originY;
        return {
          typeIdx: a.typeIdx,
          relX: rx,
          relY: ry,
          relVX: 0,
          relVY: 0,
          targetRelX: rx,
          targetRelY: ry,
        };
      });

      // Star topology: index 0 (center) connected to each branch
      const links = branches.map((_, i) => ({ a: 0, b: i + 1 }));

      // Random initial direction
      const angle = Math.random() * Math.PI * 2;
      autonomousClusters.push({
        cx: originX,
        cy: originY,
        cvx: Math.cos(angle) * CLUSTER.speed,
        cvy: Math.sin(angle) * CLUSTER.speed,
        nodes: clusterNodes,
        links,
        hitCooldown: 0,
        dead: false,
      });

      removeShapesFromNetwork(detachIds);
    };

    /* ── villain helpers ──────────────────────────────────────────── */
    const spawnVillain = () => {
      const W = canvas.width;
      const H = canvas.height;
      const spd = VILLAIN.speed;

      const usedSlots = new Set(villains.map((v) => v.slotIdx));
      const slotIdx = ([1] as const).find((i) => !usedSlots.has(i)) ?? 1;
      const size = VILLAIN.w;

      const edge = Math.floor(Math.random() * 4); // 0=left 1=right 2=top 3=bottom
      let sx = 0,
        sy = 0,
        svx = 0,
        svy = 0,
        rotation = 0;
      switch (edge) {
        case 0:
          sx = -size;
          sy = Math.random() * (H - size);
          svx = spd;
          svy = 0;
          rotation = 0;
          break;
        case 1:
          sx = W;
          sy = Math.random() * (H - size);
          svx = -spd;
          svy = 0;
          rotation = 0;
          break;
        case 2:
          sx = Math.random() * (W - size);
          sy = -size;
          svx = 0;
          svy = spd;
          rotation = Math.PI / 2;
          break;
        case 3:
          sx = Math.random() * (W - size);
          sy = H;
          svx = 0;
          svy = -spd;
          rotation = -Math.PI / 2;
          break;
      }
      villains.push({
        x: sx,
        y: sy,
        vx: svx,
        vy: svy,
        w: size,
        h: size,
        rotation,
        flipY: edge === 1,
        flashFrames: 0,
        hitCooldown: 0,
        dead: false,
        slotIdx,
        isHit: false,
      });
      setSlotSizes((prev) => {
        const next = [prev[0], prev[1]] as [number, number];
        next[slotIdx] = size;
        return next;
      });
    };

    /* ── pellet state ─────────────────────────────────────────────── */
    const pellets: Pellet[] = [];
    type Mode = "passive" | "active" | "tapering";
    let mode: Mode = "passive";
    type PassivePhase =
      | "longCooldown"
      | "shortPause1"
      | "rapid"
      | "shortPause2";
    let passivePhase: PassivePhase = "longCooldown";
    let nextPhaseAt = performance.now() + 600;
    let rapidShotsFired = 0;
    let activeFrame = 0;
    let taperLeft = 0;
    let taperFrame = 0;
    let isInActiveZone = false;

    const firePellet = (wx: number, wy: number, ndx: number, ndy: number) => {
      const len = Math.hypot(ndx, ndy) || 1;
      const angle = Math.atan2(ndy, ndx);
      pellets.push({
        x: wx,
        y: wy,
        vx: (ndx / len) * PELLET.speed,
        vy: (ndy / len) * PELLET.speed,
        angle,
        bounces: 0,
        dead: false,
      });
    };
    const firePassive = () => {
      for (const e of EMITTERS) firePellet(x + e.ox, y + e.oy, e.dx, e.dy);
    };
    const fireMouse = (mx: number, my: number) => {
      for (const e of EMITTERS)
        firePellet(x + e.ox, y + e.oy, mx - (x + e.ox), my - (y + e.oy));
    };

    /* ── shared mouse state ───────────────────────────────────────── */
    let mouseX = 0,
      mouseY = 0;
    let draggingNode: SimNode | null = null;

    /* ── main ticker ──────────────────────────────────────────────── */
    let tickFrame = 0;
    const tick = () => {
      const now = performance.now();
      const W = canvas.width;
      const H = canvas.height;
      const dt = gsap.ticker.deltaRatio(60);

      /* — periodic cross-link scan — catches pairs that drift into range — */
      tickFrame++;
      if (tickFrame % CONNECTOR.CROSS_LINK_SCAN_INTERVAL === 0) scanCrossLinks();

      /* — sync SVG world position during throw — */
      if (paused) {
        x = Number(gsap.getProperty(svg, "x"));
        y = Number(gsap.getProperty(svg, "y"));
      }

      /* — drive head nodes to robot world position every frame — */
      for (let i = 0; i < headNodes.length; i++) {
        headNodes[i].fx = x + EMITTERS[i].ox;
        headNodes[i].fy = y + EMITTERS[i].oy;
      }

      if (
        attachedShapes.length > 0 &&
        simulation.alpha() < SIM.alphaIdleTarget
      ) {
        simulation.alpha(SIM.alphaIdleTarget).restart();
      }
      if (draggingNode) {
        draggingNode.fx = mouseX;
        draggingNode.fy = mouseY;
      }

      /* — robot bounce — */
      if (!paused) {
        const bounds = getEffectiveBounds(x, y, vy);
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
        if (y <= bounds.minY) {
          y = bounds.minY;
          vy = Math.abs(vy);
        }
        if (y >= bounds.maxY) {
          y = bounds.maxY;
          vy = -Math.abs(vy);
        }
        if (x < bounds.minX) {
          vx = Math.abs(vx);
          x += (bounds.minX - x) * 0.18;
        }
        if (x > bounds.maxX) {
          vx = -Math.abs(vx);
          x += (bounds.maxX - x) * 0.18;
        }
        gsap.set(svg, { x, y });
      }

      /* — passive / active / taper firing — */
      if (mode === "passive") {
        if (now >= nextPhaseAt) {
          switch (passivePhase) {
            case "longCooldown":
              firePassive();
              passivePhase = "shortPause1";
              nextPhaseAt = now + PASSIVE.shortDelay;
              break;
            case "shortPause1":
              rapidShotsFired = 0;
              passivePhase = "rapid";
              nextPhaseAt = now;
              break;
            case "rapid":
              firePassive();
              rapidShotsFired++;
              if (rapidShotsFired >= PASSIVE.rapidCount) {
                passivePhase = "shortPause2";
                nextPhaseAt = now + PASSIVE.shortDelay;
              } else nextPhaseAt = now + PASSIVE.rapidInterval;
              break;
            case "shortPause2":
              firePassive();
              passivePhase = "longCooldown";
              nextPhaseAt = now + PASSIVE.longCooldown;
              break;
          }
        }
      } else if (mode === "active") {
        if (MOUSE_FIRING_ENABLED) {
          if (++activeFrame >= ACTIVE_EVERY) {
            activeFrame = 0;
            fireMouse(mouseX, mouseY);
          }
        } else {
          mode = "passive";
          passivePhase = "longCooldown";
          nextPhaseAt = now + 800;
        }
      } else {
        if (
          MOUSE_FIRING_ENABLED &&
          taperLeft > 0 &&
          ++taperFrame >= ACTIVE_EVERY
        ) {
          taperFrame = 0;
          fireMouse(mouseX, mouseY);
          taperLeft--;
        }
        if (taperLeft <= 0 || !MOUSE_FIRING_ENABLED) {
          mode = "passive";
          passivePhase = "longCooldown";
          nextPhaseAt = now + 800;
        }
      }

      /* — pellets: move, shape-hit, wall-bounce — */
      for (const p of pellets) {
        if (p.dead) continue;
        p.x += p.vx;
        p.y += p.vy;
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
            break;
          }
        }
        // Pellet hits villain
        if (!p.dead) {
          for (const v of villains) {
            if (v.dead || v.isHit) continue;
            if (
              p.x >= v.x &&
              p.x <= v.x + v.w &&
              p.y >= v.y &&
              p.y <= v.y + v.h
            ) {
              p.dead = true;
              v.isHit = true;
              villainBabyRefs.current[v.slotIdx]?.triggerHit();
              setTimeout(() => {
                v.isHit = false;
              }, 650); // matches BulletBaby HIT_HOLD(500ms) + fade(150ms)
              break;
            }
          }
        }
        if (p.dead) continue;
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
          if (p.bounces > PELLET.maxBounces) p.dead = true;
        }
      }
      if (pellets.length > 200)
        pellets.splice(0, pellets.length, ...pellets.filter((p) => !p.dead));

      /* — falling shapes: spawn, move, connect on robot contact, prune — */
      {
        const activeCount = fallingShapes.filter((s) => !s.dead).length;
        if (activeCount < SPAWN.maxActive && now >= nextSpawnAt) {
          const typeIdx = Math.floor(Math.random() * FALLING_SHAPES.length);
          const spawnEl = zonesRef.current.spawnZoneRef?.current;
          const sr = spawnEl ? spawnEl.getBoundingClientRect() : null;
          const spawnLeft = sr ? sr.left : 0;
          const spawnRight = sr ? sr.right : W;
          const spawnX =
            spawnLeft + Math.random() * Math.max(0, spawnRight - spawnLeft);
          const spawnDef = FALLING_SHAPES[typeIdx];
          fallingShapes.push({
            typeIdx,
            x: spawnX,
            y: sr ? sr.top - spawnDef.h : -50,
            vx: 0,
            vy: SPAWN.speed,
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
          // Connect when the shape's bounding box overlaps the robot bounding box
          const def = FALLING_SHAPES[s.typeIdx];
          const robotHit =
            s.x + def.w / 2 > x &&
            s.x - def.w / 2 < x + SVG_W &&
            s.y + def.h / 2 > y &&
            s.y - def.h / 2 < y + SVG_H;
          if (robotHit) {
            s.dead = true;
            connectShape(s);
            continue;
          }
          if (s.x < -100 || s.x > W + 100 || s.y < -100 || s.y > H + 100)
            s.dead = true;
        }
        if (fallingShapes.length > 50)
          fallingShapes.splice(
            0,
            fallingShapes.length,
            ...fallingShapes.filter((s) => !s.dead),
          );
      }

      /* — villains: spawn, move, off-screen death, robot contact, cluster contact — */
      {
        const activeVillains = villains.filter((v) => !v.dead).length;
        if (now >= nextVillainSpawnAt && activeVillains < VILLAIN.maxCount) {
          spawnVillain();
          nextVillainSpawnAt = now + VILLAIN.spawnDelay;
        }

        for (const v of villains) {
          if (v.dead) continue;
          v.x += v.vx * dt;
          v.y += v.vy * dt;
          if (v.flashFrames > 0) v.flashFrames--;
          if (v.hitCooldown > 0) v.hitCooldown--;

          // Die when fully off-screen
          if (
            v.x + v.w < -20 ||
            v.x > W + 20 ||
            v.y + v.h < -20 ||
            v.y > H + 20
          ) {
            v.dead = true;
            villainBabyRefs.current[v.slotIdx]?.reset();
            continue;
          }

          // Contact with robot → spawn cluster
          const overlapsRobot =
            v.x < x + SVG_W &&
            v.x + v.w > x &&
            v.y < y + SVG_H &&
            v.y + v.h > y;
          if (overlapsRobot && v.hitCooldown === 0) {
            spawnCluster(v.x + v.w / 2, v.y + v.h / 2);
            v.flashFrames = VILLAIN.hitFlashDur;
            v.hitCooldown = VILLAIN.hitCooldown;
          }

          // Contact with autonomous clusters → scatter
          for (const cl of autonomousClusters) {
            if (cl.dead || cl.hitCooldown > 0) continue;
            // Check villain against each cluster node's bounding box
            let clusterHit = false;
            for (const cn of cl.nodes) {
              const absX = cl.cx + cn.relX;
              const absY = cl.cy + cn.relY;
              const def = FALLING_SHAPES[cn.typeIdx];
              if (
                v.x < absX + def.w / 2 + v.w / 2 &&
                v.x + v.w > absX - def.w / 2 &&
                v.y < absY + def.h / 2 + v.h / 2 &&
                v.y + v.h > absY - def.h / 2
              ) {
                clusterHit = true;
                break;
              }
            }
            if (!clusterHit) continue;
            // Scatter cluster nodes as free nodes
            for (const cn of cl.nodes) {
              const absX = cl.cx + cn.relX;
              const absY = cl.cy + cn.relY;
              const dx = absX - cl.cx,
                dy = absY - cl.cy;
              const dist = Math.hypot(dx, dy) || 1;
              const spd = VILLAIN.burstSpeed + Math.random() * 2;
              freeNodes.push({
                typeIdx: cn.typeIdx,
                x: absX,
                y: absY,
                vx: (dx / dist) * spd,
                vy: (dy / dist) * spd,
                reconnecting: false,
                dead: false,
              });
            }
            cl.dead = true;
            v.flashFrames = VILLAIN.hitFlashDur;
          }
        }

        villains.splice(0, villains.length, ...villains.filter((v) => !v.dead));
        autonomousClusters.splice(
          0,
          autonomousClusters.length,
          ...autonomousClusters.filter((cl) => !cl.dead),
        );

        // Sync villain DOM overlay positions
        villainDomRefs.current.forEach((el, i) => {
          if (!el) return;
          const v = villains.find((v) => v.slotIdx === i);
          if (!v) {
            el.style.display = "none";
            return;
          }
          el.style.display = "block";
          // Rotate around the villain's center: translate center to (cx,cy),
          // rotate, then shift back so the element's top-left lands at (v.x, v.y)
          const cx = v.x + v.w / 2;
          const cy = v.y + v.h / 2;
          el.style.transform = `translate(${cx}px, ${cy}px) rotate(${v.rotation}rad) translate(${-v.w / 2}px, ${-v.h / 2}px)`;
        });
      }

      /* — autonomous clusters: center bounce + spring branch nodes — */
      for (const cl of autonomousClusters) {
        if (cl.dead) continue;
        if (cl.hitCooldown > 0) cl.hitCooldown--;

        // Bounce cluster center like robot
        const spd = Math.hypot(cl.cvx, cl.cvy);
        if (spd > CLUSTER.speed + 0.1) {
          cl.cvx *= 0.97;
          cl.cvy *= 0.97;
        } else if (spd < CLUSTER.speed * 0.9) {
          const s = CLUSTER.speed / Math.max(spd, 0.01);
          cl.cvx *= s;
          cl.cvy *= s;
        }
        cl.cx += cl.cvx * dt;
        cl.cy += cl.cvy * dt;
        if (cl.cx < 0) {
          cl.cx = 0;
          cl.cvx = Math.abs(cl.cvx);
        }
        if (cl.cx > W) {
          cl.cx = W;
          cl.cvx = -Math.abs(cl.cvx);
        }
        if (cl.cy < 0) {
          cl.cy = 0;
          cl.cvy = Math.abs(cl.cvy);
        }
        if (cl.cy > H) {
          cl.cy = H;
          cl.cvy = -Math.abs(cl.cvy);
        }

        // Spring: pull each branch node toward its target offset
        for (const cn of cl.nodes) {
          const ax = (cn.targetRelX - cn.relX) * CLUSTER.springK;
          const ay = (cn.targetRelY - cn.relY) * CLUSTER.springK;
          cn.relVX = (cn.relVX + ax) * CLUSTER.damping;
          cn.relVY = (cn.relVY + ay) * CLUSTER.damping;
          cn.relX += cn.relVX * dt;
          cn.relY += cn.relVY * dt;
        }
      }

      /* — free nodes: drift, bounce, reconnect to robot on proximity — */
      {
        const robotCx = x + SVG_W / 2,
          robotCy = y + SVG_H / 2;
        let attracting = freeNodes.some((fn) => fn.reconnecting && !fn.dead);

        for (const fn of freeNodes) {
          if (fn.dead) continue;

          if (fn.reconnecting) {
            let nearX = x + EMITTERS[0].ox,
              nearY = y + EMITTERS[0].oy,
              nearDist = Infinity;
            for (let i = 0; i < EMITTERS.length; i++) {
              const hx = x + EMITTERS[i].ox,
                hy = y + EMITTERS[i].oy;
              const d = Math.hypot(fn.x - hx, fn.y - hy);
              if (d < nearDist) {
                nearDist = d;
                nearX = hx;
                nearY = hy;
              }
            }
            for (const n of shapeNodes) {
              const d = Math.hypot(fn.x - (n.x ?? 0), fn.y - (n.y ?? 0));
              if (d < nearDist) {
                nearDist = d;
                nearX = n.x ?? 0;
                nearY = n.y ?? 0;
              }
            }
            fn.x += (nearX - fn.x) * RECONNECT.lerpSpeed;
            fn.y += (nearY - fn.y) * RECONNECT.lerpSpeed;
            fn.vx = 0;
            fn.vy = 0;
            if (nearDist < RECONNECT.snapDist) fn.dead = reattachFreeNode(fn);
            continue;
          }

          fn.x += fn.vx * dt;
          fn.y += fn.vy * dt;
          fn.vx *= 0.995;
          fn.vy *= 0.995;
          const def = FALLING_SHAPES[fn.typeIdx];
          if (fn.x < 0) {
            fn.x = 0;
            fn.vx = Math.abs(fn.vx);
          }
          if (fn.x > W - def.w) {
            fn.x = W - def.w;
            fn.vx = -Math.abs(fn.vx);
          }
          if (fn.y < 0) {
            fn.y = 0;
            fn.vy = Math.abs(fn.vy);
          }
          if (fn.y > H - def.h) {
            fn.y = H - def.h;
            fn.vy = -Math.abs(fn.vy);
          }

          if (!attracting) {
            const fnCx = fn.x + def.w / 2,
              fnCy = fn.y + def.h / 2;
            if (Math.hypot(fnCx - robotCx, fnCy - robotCy) < RECONNECT.radius) {
              fn.reconnecting = true;
              attracting = true;
            }
          }
        }
        if (freeNodes.length > 50)
          freeNodes.splice(
            0,
            freeNodes.length,
            ...freeNodes.filter((fn) => !fn.dead),
          );
      }

      /* ─────────────────────── DRAW ────────────────────────────── */
      ctx.clearRect(0, 0, W, H);
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

      /* — main network: connector lines + attached shapes (drawn first = below everything) — */
      if (attachedShapes.length > 0) {
        ctx.strokeStyle = CONNECTOR.color;
        ctx.lineWidth = CONNECTOR.width;
        ctx.lineCap = "round";
        ctx.setLineDash([CONNECTOR.dashLen, CONNECTOR.dashGap]);

        for (const a of attachedShapes) {
          const aNode = nodeMap.get(a.id);
          if (!aNode) continue;
          const awx = aNode.x ?? 0,
            awy = aNode.y ?? 0;
          for (const hIdx of a.parentHeadIdx) {
            ctx.beginPath();
            ctx.moveTo(x + EMITTERS[hIdx].ox, y + EMITTERS[hIdx].oy);
            ctx.lineTo(awx, awy);
            ctx.stroke();
          }
          for (const pid of a.parentShapeIds) {
            const pNode = nodeMap.get(pid);
            if (!pNode) continue;
            ctx.beginPath();
            ctx.moveTo(pNode.x ?? 0, pNode.y ?? 0);
            ctx.lineTo(awx, awy);
            ctx.stroke();
          }
        }

        ctx.setLineDash([]);
        for (const a of attachedShapes) {
          const aNode = nodeMap.get(a.id);
          if (!aNode) continue;
          const awx = aNode.x ?? 0,
            awy = aNode.y ?? 0;
          const def = FALLING_SHAPES[a.typeIdx];
          const oc = getOutlineCanvas(a.typeIdx);
          if (oc) {
            const pad = SHAPE_OUTLINE.width + 1;
            ctx.drawImage(oc, awx - def.w / 2 - pad, awy - def.h / 2 - pad);
          } else {
            const img = shapeImgs.get(a.typeIdx);
            if (img && img.complete)
              ctx.drawImage(
                img,
                awx - def.w / 2,
                awy - def.h / 2,
                def.w,
                def.h,
              );
          }
        }
      }

      /* — pellets — */
      for (const p of pellets) {
        if (p.dead) continue;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = PELLET.color;
        ctx.beginPath();
        ctx.roundRect(
          -PELLET.width / 2,
          -PELLET.height / 2,
          PELLET.width,
          PELLET.height,
          PELLET.height / 2,
        );
        ctx.fill();
        ctx.restore();
      }

      /* — falling shapes — background canvas — */
      for (const s of fallingShapes) {
        if (s.dead) continue;
        const def = FALLING_SHAPES[s.typeIdx];
        const img = shapeImgs.get(s.typeIdx);
        if (!img || !img.complete) continue;
        bgCtx.drawImage(img, s.x - def.w / 2, s.y - def.h / 2, def.w, def.h);
      }

      /* — free nodes — */
      for (const fn of freeNodes) {
        if (fn.dead) continue;
        const def = FALLING_SHAPES[fn.typeIdx];
        const img = shapeImgs.get(fn.typeIdx);
        if (!img || !img.complete) continue;
        ctx.globalAlpha = fn.reconnecting ? 1 : 0.65;
        ctx.drawImage(img, fn.x, fn.y, def.w, def.h);
        ctx.globalAlpha = 1;
      }

      /* — villains rendered as DOM overlays — */

      /* — autonomous clusters — */
      ctx.strokeStyle = CONNECTOR.color;
      ctx.lineWidth = CONNECTOR.width;
      ctx.lineCap = "round";
      for (const cl of autonomousClusters) {
        if (cl.dead) continue;

        ctx.setLineDash([CONNECTOR.dashLen, CONNECTOR.dashGap]);
        ctx.beginPath();
        for (const link of cl.links) {
          const na = cl.nodes[link.a],
            nb = cl.nodes[link.b];
          if (!na || !nb) continue;
          ctx.moveTo(cl.cx + na.relX, cl.cy + na.relY);
          ctx.lineTo(cl.cx + nb.relX, cl.cy + nb.relY);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        for (const cn of cl.nodes) {
          const absX = cl.cx + cn.relX;
          const absY = cl.cy + cn.relY;
          const def = FALLING_SHAPES[cn.typeIdx];
          const oc = getOutlineCanvas(cn.typeIdx);
          if (oc) {
            const pad = SHAPE_OUTLINE.width + 1;
            ctx.drawImage(oc, absX - def.w / 2 - pad, absY - def.h / 2 - pad);
          } else {
            const img = shapeImgs.get(cn.typeIdx);
            if (img && img.complete)
              ctx.drawImage(
                img,
                absX - def.w / 2,
                absY - def.h / 2,
                def.w,
                def.h,
              );
          }
        }
      }
    };

    gsap.ticker.add(tick);

    /* ── mouse event handlers ─────────────────────────────────────── */
    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!draggingNode) {
        const over = shapeNodes.some(
          (n) =>
            Math.hypot(mouseX - (n.x ?? 0), mouseY - (n.y ?? 0)) <
            SIM.dragHitRadius,
        );
        document.body.style.cursor = over ? "grab" : "";
      }
      if (MOUSE_FIRING_ENABLED) {
        const az = zonesRef.current.activeZoneRef?.current;
        if (az) {
          const r = az.getBoundingClientRect();
          const nowIn =
            e.clientX >= r.left &&
            e.clientX <= r.right &&
            e.clientY >= r.top &&
            e.clientY <= r.bottom;
          if (nowIn && !isInActiveZone) {
            isInActiveZone = true;
            fireMouse(e.clientX, e.clientY);
            mode = "active";
            activeFrame = 0;
          } else if (!nowIn && isInActiveZone) {
            isInActiveZone = false;
            if (mode === "active" || mode === "tapering") {
              mode = "tapering";
              taperLeft = TAPER_SHOTS;
              taperFrame = ACTIVE_EVERY;
            }
          }
        }
      }
    };

    const onNodeDown = (e: MouseEvent) => {
      if (e.target === svg) return;
      const mx = e.clientX,
        my = e.clientY;
      for (const node of shapeNodes) {
        const wx = node.x ?? 0,
          wy = node.y ?? 0;
        if (Math.hypot(mx - wx, my - wy) < SIM.dragHitRadius) {
          draggingNode = node;
          node.fx = wx;
          node.fy = wy;
          simulation.alphaTarget(SIM.alphaDragTarget).restart();
          document.body.style.cursor = "grabbing";
          break;
        }
      }
    };

    const onNodeUp = () => {
      if (draggingNode) {
        simulation.alphaTarget(SIM.alphaIdleTarget);
        draggingNode.fx = null;
        draggingNode.fy = null;
        draggingNode = null;
        document.body.style.cursor = "";
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onNodeDown);
    window.addEventListener("mouseup", onNodeUp);

    /* ── Draggable + InertiaPlugin ────────────────────────────────── */
    Draggable.create(svg, {
      type: "x,y",
      bounds: {
        minX: 0,
        minY: 0,
        maxX: window.innerWidth - SVG_W,
        maxY: window.innerHeight - SVG_H,
      },
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
        const maxX = window.innerWidth - SVG_W;
        const maxY = window.innerHeight - SVG_H;
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
      simulation.stop();
      Draggable.get(svg)?.kill();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onNodeDown);
      window.removeEventListener("mouseup", onNodeUp);
      window.removeEventListener("resize", syncSize);
      document.body.style.cursor = "";
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <canvas
        ref={bgCanvasRef}
        className={styles.bgCanvas}
        aria-hidden="true"
      />
      <div className={styles.container}>
        {/* Effect canvas — behind SVG, never captures pointer events */}
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
      {/* Villain DOM overlays — positioned each frame via direct style update */}
      {([0, 1] as const).map((i) => (
        <div
          key={i}
          ref={(el) => {
            villainDomRefs.current[i] = el;
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            pointerEvents: "none",
            display: "none",
            zIndex: 4 /* above heroTopContent(3), below nav(~100) */,
          }}
        >
          <BulletBaby
            ref={(el) => {
              villainBabyRefs.current[i] = el;
            }}
            size={slotSizes[i]}
          />
        </div>
      ))}
    </>
  );
}
