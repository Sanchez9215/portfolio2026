"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Label from "@/components/Label";
import styles from "./FrameworkScene.module.css";
import { scheduleScrollTriggerRefresh } from "./scrollTriggerRefresh";

gsap.registerPlugin(ScrollTrigger);

/**
 * "The Framework." — ONE pinned diagram, ONE scrubbed timeline (the
 * canonical ScrollTrigger pattern: a single `pin:true` trigger driving a
 * timeline of sequential beats). An earlier draft used two ScrollTriggers
 * both pinning the same element to fake an unpin→scroll→repin; that's
 * unsupported (one element = one pin) and corrupted the layout. This is
 * the correct single-pin version — the "heading scrolls away / shapes rise
 * to the top" beat is done by translating the content group up WITHIN the
 * one pin, which is visually identical and structurally sound.
 *
 * Beats, in order (all on one scrubbed timeline):
 *  1. Overview, All Assets, Profiles and Insights render already settled in
 *     their final composition (no unfurl-in animation), blue-stroked, with
 *     their original label/body visible.
 *  2. Rise: the whole content group translates up so the heading exits
 *     behind the nav and the row locks just below the nav's bottom edge.
 *  3. Three connectors draw in from the inputs into Insights, together.
 *  4. Hold.
 *  5. All 4 shapes wipe to solid blue-500 from the top simultaneously,
 *     their old (grey) label/body swapped for new (dark) content.
 *  6. Hold, then the pin releases — free scroll reveals the star's lower
 *     portion (`.scene`'s real height is the full diagram, taller than one
 *     viewport, so nothing needs to fit on screen at once).
 *
 * All 4 shapes + 3 connectors + the 4 wipe fills live in ONE shared inline
 * SVG canvas whose viewBox is fixed to the diagram's measured pixel size (1
 * unit = 1px) — shapes animate their real geometry (radius / polygon
 * points), never a transform:scale, so the shared 1px/6-8 dashed stroke
 * never scales with them.
 */

// Dash spec shared by every shape + connector.
const STROKE_WIDTH = 1;
const DASH_LENGTH = 6;
const DASH_GAP = 8;
const DASH_ARRAY = `${DASH_LENGTH} ${DASH_GAP}`;
const DASH_UNIT = DASH_LENGTH + DASH_GAP; // one dash+gap pair, px

// Once the wipe fill completes, each connector gets a second, blue overlay
// line pulsing "data" across it in blocks of PULSE_GROUP dashes on, then
// PULSE_GROUP dashes off — a compound dasharray (below) rather than a
// second uniform dash spacing, so the blue blocks land exactly on top of
// whole dashes of the base grey pattern instead of cutting across them.
const PULSE_GROUP = 4; // dash units per pulse block
const PULSE_PERIOD = PULSE_GROUP * 2 * DASH_UNIT; // one full on+off cycle, px
const PULSE_DURATION = 2.5; // seconds per cycle — tune to taste

// [dash,gap] x(PULSE_GROUP-1) normal pairs, then a final pair whose gap is
// extended by PULSE_GROUP more units — skipping the "off" block — so the
// whole repeating sequence covers exactly PULSE_PERIOD px.
const PULSE_DASH_ARRAY = Array.from({ length: PULSE_GROUP }, (_, i) => {
  const isLast = i === PULSE_GROUP - 1;
  return `${DASH_LENGTH} ${isLast ? DASH_GAP + PULSE_GROUP * DASH_UNIT : DASH_GAP}`;
}).join(" ");

// Absolute spacing (px), measured from the heading's own bottom edge.
const GAP_HEADING_TO_ROW = 64; // row's top edge, below the heading's bottom edge
const GAP_ROW_TO_INSIGHTS = 128; // row's bottom edge to Insights's top edge
const SCENE_BOTTOM_PADDING = 48; // --spacing-2xl, breathing room past Insights's bottom edge

// Where the row's top edge locks once it has risen under the nav (px below
// the nav's bottom edge). Tunable — the row "hitting the bottom edge of
// the nav" with a small breathing gap.
const ROW_LOCK_TOP_MARGIN = 48; // --spacing-2xl

const ROW_END_SIZE = 320; // all 3 inputs settle at this size
const INSIGHTS_END_SIZE = 502;

// Gap (px) between the shape's border and its solid wipe fill — the fill
// sits inset from the true bounds so the border reads as a distinct ring
// around it, rather than the fill running flush to the border's inner edge.
const FILL_INSET = 16;

type ShapeKind = "circle" | "polygon" | "star";

interface ShapeDef {
  id: string;
  label: string;
  body: string;
  newLabel: string; // final content, once the shape wipes to blue-500
  newBody: string;
  kind: ShapeKind;
  sides?: number; // polygon only
  spikes?: number; // star only
  innerRatio?: number; // star only — inner/outer radius ratio
  endSize: number; // px, bounding diameter at rest
  endXPercent: number; // final center, % of diagram width
}

// Three inputs, in unfurl order (left → right, per confirmed direction).
// All 3 share the row's center Y (computed at runtime), since it's one row.
const INPUT_SHAPES: ShapeDef[] = [
  {
    id: "overview",
    label: "Overview",
    body: "Real-time distribution view of assets across lifecycle stages, filterable from a single worksite to global operations.",
    newLabel: "Software Overview",
    newBody:
      "A high-level portfolio view across lifecycle stages, surfacing spend, compliance risk, and renewal exposure at a glance.",
    kind: "polygon",
    sides: 7,
    endSize: ROW_END_SIZE,
    endXPercent: 16,
  },
  {
    id: "all-assets",
    label: "All Assets",
    body: "A complete view of every asset owned, letting users segment by region, relationship, financial unit, or operational status.",
    newLabel: "All Software",
    newBody:
      "A complete, filterable catalog of every title in the organization, letting teams isolate exactly what they need to act on.",
    kind: "circle",
    endSize: ROW_END_SIZE,
    endXPercent: 50,
  },
  {
    id: "profiles",
    label: "Profiles",
    body: "Combines core attributes, entity relationships and lifecycle events from purchased to retired in a single record.",
    newLabel: "Profiles",
    newBody:
      "A software title record that surfaces licensing posture, utilization health, spend, and compliance standing.",
    kind: "polygon",
    sides: 5,
    endSize: ROW_END_SIZE,
    endXPercent: 84,
  },
];

// Settles first, alone — see file comment on why.
const INSIGHTS_SHAPE: ShapeDef = {
  id: "insights",
  label: "Insights",
  body: "Translates lifecycle data into clear trends and signals to maximize operational efficiency, unlock cost reductions, and validate autonomous execution.",
  newLabel: "Software Insights",
  newBody:
    "Surfaces portfolio trends to identify optimization opportunities, forecast renewals, and validate license reclamations.",
  kind: "star",
  spikes: 4,
  innerRatio: 0.55,
  endSize: INSIGHTS_END_SIZE,
  endXPercent: 50,
};

const ALL_SHAPES = [INSIGHTS_SHAPE, ...INPUT_SHAPES];

// 3 diagonal (each input → Insights) + 2 horizontal (All Assets' sides →
// Overview/Profiles), see the connectorSpecs built in the effect below.
const CONNECTOR_COUNT = INPUT_SHAPES.length + 2;

// Beat lengths (scroll px). The timeline's ScrollTrigger end is
// `+=TOTAL_RUNWAY`, and the timeline duration is padded to exactly
// TOTAL_RUNWAY (trailing spacer below), so 1 timeline "second" here equals
// 1px of scroll (same convention as TheProblemPinnedScene's growTl).

// Beat 2 — rise (heading exits behind nav, row locks under it).
const RISE_LENGTH = 400;

// Beats 3–6 — connectors, holds, wipe.
const CONNECTOR_DRAW_LENGTH = 400; // all three draw together, once every shape has settled
const HOLD_AFTER_CONNECTORS = 250; // shapes sit untouched once connectors lock in
const WIPE_LENGTH = 250; // all 4 shapes wipe to blue-500 + swap content, simultaneously — a short beat
const HOLD_AFTER_WIPE = 500; // before the pin releases for good

// Absolute timeline offsets. Shapes render already settled, so the rise
// beat is the timeline's first beat.
const RISE_START = 0;
const CONNECTOR_START = RISE_START + RISE_LENGTH;
const WIPE_START =
  CONNECTOR_START + CONNECTOR_DRAW_LENGTH + HOLD_AFTER_CONNECTORS;
const WIPE_END = WIPE_START + WIPE_LENGTH;
const TOTAL_RUNWAY = WIPE_END + HOLD_AFTER_WIPE;

interface Point {
  x: number;
  y: number;
}

// Regular polygon vertices, first vertex pointing straight up.
function polygonVertices(
  cx: number,
  cy: number,
  radius: number,
  sides: number,
): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = ((360 / sides) * i - 90) * (Math.PI / 180);
    pts.push({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });
  }
  return pts;
}

function pointsToAttr(pts: Point[]) {
  return pts.map((p) => `${p.x},${p.y}`).join(" ");
}

// The polygon vertex nearest a target compass angle (degrees, 0=right,
// 90=down, 180=left, -90/270=up, screen coords) — used to find a regular
// polygon's "bottom-right"/"bottom-left" corner, which isn't necessarily
// an exact vertex on an odd-sided shape.
function nearestPolygonVertex(
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  targetAngleDeg: number,
): Point {
  let best = { angle: -90, dist: Infinity };
  for (let i = 0; i < sides; i++) {
    const angle = (360 / sides) * i - 90;
    const diff = Math.abs(
      ((((angle - targetAngleDeg + 540) % 360) + 360) % 360) - 180,
    );
    if (diff < best.dist) best = { angle, dist: diff };
  }
  const rad = best.angle * (Math.PI / 180);
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

// True boundary point where a horizontal line at the shape's own center
// height (y=cy) exits its left/right side — a circle's is simply cx±r, a
// (vertex-up, so left-right symmetric) polygon's requires the actual
// edge-line intersection, since no vertex generally sits exactly on that
// line. Unlike nearestPolygonVertex (used for the corner-to-corner
// diagonal connectors), this gives the true "centered edge" point.
function shapeEdgeAtOwnCenter(
  kind: ShapeKind,
  sides: number | undefined,
  cx: number,
  cy: number,
  radius: number,
  side: "left" | "right",
): Point {
  if (kind !== "polygon") return { x: cx + (side === "right" ? radius : -radius), y: cy };
  const verts = polygonVertices(cx, cy, radius, sides!);
  for (let i = 0; i < verts.length; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % verts.length];
    if ((a.y - cy) * (b.y - cy) <= 0 && a.y !== b.y) {
      const t = (cy - a.y) / (b.y - a.y);
      const x = a.x + t * (b.x - a.x);
      if (side === "right" ? x >= cx : x <= cx) return { x, y: cy };
    }
  }
  return { x: cx + (side === "right" ? radius : -radius), y: cy }; // unreachable for a convex polygon
}

// Star vertices alternating outer/inner radius, first spike pointing up.
function starVertices(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRatio: number,
  spikes: number,
): { point: Point; isOuter: boolean }[] {
  const innerRadius = outerRadius * innerRatio;
  const pts: { point: Point; isOuter: boolean }[] = [];
  const step = 360 / (spikes * 2);
  for (let i = 0; i < spikes * 2; i++) {
    const isOuter = i % 2 === 0;
    const r = isOuter ? outerRadius : innerRadius;
    const angle = (step * i - 90) * (Math.PI / 180);
    pts.push({
      point: { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) },
      isOuter,
    });
  }
  return pts;
}

export default function FrameworkScene({ className }: { className?: string }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const shapeElRefs = useRef<
    Record<string, SVGCircleElement | SVGPolygonElement | null>
  >({});
  const connectorRefs = useRef<(SVGLineElement | null)[]>([]);
  const pulseRefs = useRef<(SVGLineElement | null)[]>([]);
  const wipeFillRefs = useRef<
    Record<string, SVGCircleElement | SVGPolygonElement | null>
  >({});
  const wipeClipRectRefs = useRef<Record<string, SVGRectElement | null>>({});
  const labelWrapRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const contentInnerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const labelSpanRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const bodyRefs = useRef<Record<string, HTMLParagraphElement | null>>({});

  useEffect(() => {
    const sceneEl = sceneRef.current;
    const contentEl = contentRef.current;
    const headingEl = headingRef.current;
    const svgEl = svgRef.current;
    if (!sceneEl || !contentEl || !headingEl || !svgEl) return;

    const shapeEls = ALL_SHAPES.map((s) => shapeElRefs.current[s.id]);
    const labelWraps = ALL_SHAPES.map((s) => labelWrapRefs.current[s.id]);
    const bodyEls = ALL_SHAPES.map((s) => bodyRefs.current[s.id]);
    if (
      shapeEls.some((el) => !el) ||
      labelWraps.some((el) => !el) ||
      bodyEls.some((el) => !el)
    )
      return;

    const rootStyle = getComputedStyle(document.documentElement);
    const blueAccent = rootStyle.getPropertyValue("--accent-primary").trim();
    const greyStroke500 = rootStyle.getPropertyValue("--color-grey-500").trim();
    const navHeightPx =
      parseFloat(rootStyle.getPropertyValue("--nav-height")) || 0;

    const ctx = gsap.context(() => {
      const sceneRect = sceneEl.getBoundingClientRect();
      const width = sceneRect.width;
      const headingBottom =
        headingEl.getBoundingClientRect().bottom - sceneRect.top;
      // .scene's own top offset within the padded <Section> — the pin
      // engages when the section's top hits nav-bottom, at which moment
      // .scene sits this far below nav-bottom. Needed for the rise amount.
      const sectionEl = sceneEl.parentElement as HTMLElement;
      const sceneOffsetInSection =
        sceneRect.top - sectionEl.getBoundingClientRect().top;

      // Absolute Y positions (px, relative to .scene's own top) — derived
      // from the measured heading + the gap constants, not independent
      // guesses, so both gaps stay exactly what was asked for regardless
      // of shape size or where the heading itself lands.
      const rowTopY = headingBottom + GAP_HEADING_TO_ROW;
      const rowCenterY = rowTopY + ROW_END_SIZE / 2;
      const rowBottomY = rowTopY + ROW_END_SIZE;
      const insightsCenterY =
        rowBottomY + GAP_ROW_TO_INSIGHTS + INSIGHTS_END_SIZE / 2;
      const sceneContentHeight =
        insightsCenterY + INSIGHTS_END_SIZE / 2 + SCENE_BOTTOM_PADDING;

      // How far the content group rises so the row's top edge lands
      // ROW_LOCK_TOP_MARGIN below the nav. When pinned, the row's top sits
      // at viewport (navHeight + sceneOffsetInSection + rowTopY); the
      // target is (navHeight + ROW_LOCK_TOP_MARGIN); the difference is the
      // rise (nav height cancels out).
      const riseAmount = sceneOffsetInSection + rowTopY - ROW_LOCK_TOP_MARGIN;

      // .scene's real height is the FULL diagram (can exceed one
      // viewport) — nothing here is clipped or panned; whatever doesn't
      // fit the pinned window simply becomes visible once the pin releases
      // and normal scroll continues past this (taller) element.
      sceneEl.style.height = `${sceneContentHeight}px`;
      svgEl.setAttribute("viewBox", `0 0 ${width} ${sceneContentHeight}`);

      // Every shape's final (settled) geometry — computed once, reused by
      // the move targets, the connectors, and the wipe fills below.
      const finalPos: Record<string, { cx: number; cy: number; r: number }> = {
        [INSIGHTS_SHAPE.id]: {
          cx: (INSIGHTS_SHAPE.endXPercent / 100) * width,
          cy: insightsCenterY,
          r: INSIGHTS_SHAPE.endSize / 2,
        },
      };
      INPUT_SHAPES.forEach((def) => {
        finalPos[def.id] = {
          cx: (def.endXPercent / 100) * width,
          cy: rowCenterY,
          r: def.endSize / 2,
        };
      });

      const shapePoints = (
        def: ShapeDef,
        cx: number,
        cy: number,
        r: number,
      ) => {
        if (def.kind === "circle") return null;
        if (def.kind === "polygon")
          return pointsToAttr(polygonVertices(cx, cy, r, def.sides!));
        return pointsToAttr(
          starVertices(cx, cy, r, def.innerRatio!, def.spikes!).map(
            (v) => v.point,
          ),
        );
      };

      // Renders a shape's geometry + centered label position at a given
      // center/size. The border is drawn OUTSIDE the shape's true bounds
      // (Figma "stroke position: outside") — SVG strokes are centered on
      // the path by default, so the outline geometry itself is inflated by
      // half the stroke width; `size`/finalPos's own r (used by the wipe
      // fill + connectors) stay the true bounds, unaffected.
      const renderShape = (
        def: ShapeDef,
        cx: number,
        cy: number,
        size: number,
      ) => {
        const el = shapeElRefs.current[def.id]!;
        const r = size / 2 + STROKE_WIDTH / 2;
        if (def.kind === "circle") {
          el.setAttribute("cx", String(cx));
          el.setAttribute("cy", String(cy));
          el.setAttribute("r", String(r));
        } else {
          el.setAttribute("points", shapePoints(def, cx, cy, r)!);
        }
        const wrap = labelWrapRefs.current[def.id]!;
        wrap.style.left = `${cx}px`;
        wrap.style.top = `${cy}px`;
      };

      // Start state: every shape already in its final settled composition,
      // centered labels, original label/body visible, blue stroke.
      ALL_SHAPES.forEach((def) => {
        const { cx, cy } = finalPos[def.id];
        renderShape(def, cx, cy, def.endSize);
        gsap.set(shapeElRefs.current[def.id], { attr: { stroke: blueAccent } });
      });

      // Wipe fills: a filled (blue-500) twin of each shape's FINAL settled
      // geometry, inset by FILL_INSET from the true bounds (border sits at
      // the true bounds), set once up front (nothing moves them — only
      // their clip rect's height animates, during the wipe beat). Clipped
      // to a rect pinned to the shape's own bounding-box top edge,
      // revealing top-to-bottom as the rect's height grows from 0 to the
      // full box.
      ALL_SHAPES.forEach((def) => {
        const { cx, cy, r } = finalPos[def.id];
        const fillR = r - FILL_INSET;
        const fillEl = wipeFillRefs.current[def.id]!;
        if (def.kind === "circle") {
          fillEl.setAttribute("cx", String(cx));
          fillEl.setAttribute("cy", String(cy));
          fillEl.setAttribute("r", String(fillR));
        } else {
          fillEl.setAttribute("points", shapePoints(def, cx, cy, fillR)!);
        }
        const clipRectEl = wipeClipRectRefs.current[def.id]!;
        clipRectEl.setAttribute("x", String(cx - fillR));
        clipRectEl.setAttribute("y", String(cy - fillR));
        clipRectEl.setAttribute("width", String(2 * fillR));
        clipRectEl.setAttribute("height", "0");
      });

      // The height/viewBox mutation above just reflowed this element —
      // force a synchronous layout read so ScrollTrigger measures the
      // settled result (same pattern as TheProblemPinnedScene).
      void sceneEl.offsetHeight;
      scheduleScrollTriggerRefresh();

      // ONE pinned timeline for everything. Timing is off the actual
      // <Section> (padding-aware) but the pinned element is .scene itself —
      // our own simple, position:relative div — never the shared,
      // display:grid <Section> component (pinning that, especially more
      // than once, is what corrupted the layout before). GSAP pins .scene
      // wherever it currently sits (128px below the section top, preserving
      // the padding). pin:true is correct here — unlike TheProblemPinned
      // Scene, nothing changes .scene's height mid-animation, so the
      // pin-spacer never desyncs.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionEl,
          pin: sceneEl,
          start: `top top+=${navHeightPx}`,
          end: `+=${TOTAL_RUNWAY}`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      const insightsDef = INSIGHTS_SHAPE;

      // ── Beat 2: rise ─────────────────────────────────────────────────
      // The whole content group translates up so the heading exits behind
      // the fixed nav and the row locks under it. One transform on the
      // wrapper moves shapes, connectors, wipe fills and labels together.
      tl.to(
        contentEl,
        { y: -riseAmount, duration: RISE_LENGTH, ease: "power2.inOut" },
        RISE_START,
      );

      // ── Beat 3: connectors ───────────────────────────────────────────
      // Drawn once every shape has settled and risen — nothing else moves.
      // Two groups, both corner-to-corner (not center-to-center):
      //  - 3 diagonals, each input into Insights (left input's
      //    bottom-right corner to the star's farthest-left point, right
      //    input's bottom-left corner to the star's farthest-right point,
      //    center input's bottom-center to the star's top-center).
      //  - 2 horizontals linking the row itself: All Assets' left/right
      //    side (vertically centered on the row, per its own request) to
      //    Overview's/Profiles' facing vertex.
      // All derived from each shape's already-known final geometry.
      const starOuter = starVertices(
        finalPos[insightsDef.id].cx,
        finalPos[insightsDef.id].cy,
        finalPos[insightsDef.id].r,
        insightsDef.innerRatio!,
        insightsDef.spikes!,
      )
        .filter((v) => v.isOuter)
        .map((v) => v.point);
      const insightsLeftPoint = starOuter.reduce((a, b) => (b.x < a.x ? b : a));
      const insightsRightPoint = starOuter.reduce((a, b) =>
        b.x > a.x ? b : a,
      );
      const insightsTopPoint = starOuter.reduce((a, b) => (b.y < a.y ? b : a));

      const overviewCx = finalPos[INPUT_SHAPES[0].id].cx;
      const allAssetsCx = finalPos[INPUT_SHAPES[1].id].cx;
      const profilesCx = finalPos[INPUT_SHAPES[2].id].cx;

      const connectorSpecs: {
        start: Point;
        target: Point;
        // The post-wipe data pulse always reads as "flowing toward
        // Insights" — true for the two row connectors, since their own
        // line runs start(All Assets) → target(Overview/Profiles), the
        // opposite of the flow direction we want for the pulse.
        reversePulse?: boolean;
      }[] = [
        {
          // Overview (left) — bottom-right corner → star's farthest-left point.
          start: nearestPolygonVertex(
            overviewCx,
            rowCenterY,
            ROW_END_SIZE / 2,
            INPUT_SHAPES[0].sides!,
            45,
          ),
          target: insightsLeftPoint,
        },
        {
          // All Assets (center) — bottom-center → star's top-center.
          start: { x: allAssetsCx, y: rowCenterY + ROW_END_SIZE / 2 },
          target: insightsTopPoint,
        },
        {
          // Profiles (right) — bottom-left corner → star's farthest-right point.
          start: nearestPolygonVertex(
            profilesCx,
            rowCenterY,
            ROW_END_SIZE / 2,
            INPUT_SHAPES[2].sides!,
            135,
          ),
          target: insightsRightPoint,
        },
        {
          // All Assets' centered left edge → Overview's centered right
          // edge — true boundary points at row-center height (not vertex
          // snapped), so both ends sit exactly at half the shape's height.
          start: shapeEdgeAtOwnCenter(
            "circle",
            undefined,
            allAssetsCx,
            rowCenterY,
            ROW_END_SIZE / 2,
            "left",
          ),
          target: shapeEdgeAtOwnCenter(
            "polygon",
            INPUT_SHAPES[0].sides,
            overviewCx,
            rowCenterY,
            ROW_END_SIZE / 2,
            "right",
          ),
          reversePulse: true,
        },
        {
          // All Assets' centered right edge → Profiles' centered left edge.
          start: shapeEdgeAtOwnCenter(
            "circle",
            undefined,
            allAssetsCx,
            rowCenterY,
            ROW_END_SIZE / 2,
            "right",
          ),
          target: shapeEdgeAtOwnCenter(
            "polygon",
            INPUT_SHAPES[2].sides,
            profilesCx,
            rowCenterY,
            ROW_END_SIZE / 2,
            "left",
          ),
          reversePulse: true,
        },
      ];

      connectorSpecs.forEach((spec, i) => {
        const lineEl = connectorRefs.current[i];
        if (!lineEl) return;
        const { start, target } = spec;
        lineEl.setAttribute("x1", String(start.x));
        lineEl.setAttribute("y1", String(start.y));
        lineEl.setAttribute("x2", String(target.x));
        lineEl.setAttribute("y2", String(target.y));
        const length = Math.hypot(target.x - start.x, target.y - start.y);
        // Marching-dash reveal: the real DASH_ARRAY pattern stays on the
        // line throughout (set via the strokeDasharray JSX prop, left
        // untouched here) — the connector fades in while its dashoffset
        // runs down several pattern cycles, giving the dashes a sense of
        // motion from the shape toward Insights (decreasing dashoffset
        // marches the pattern in the direction the line is drawn, x1,y1 →
        // x2,y2) instead of literally growing the line.
        gsap.set(lineEl, {
          opacity: 0,
          attr: { stroke: blueAccent, "stroke-dashoffset": 10 * length },
        });
        tl.to(
          lineEl,
          {
            opacity: 1,
            attr: { "stroke-dashoffset": 0 },
            duration: CONNECTOR_DRAW_LENGTH,
            ease: "none",
          },
          CONNECTOR_START,
        );
      });

      // Connectors follow the same stroke color as the shapes: blue by
      // default, grey-500 once the wipe reveals.
      connectorRefs.current.forEach((lineEl) => {
        if (!lineEl) return;
        tl.to(
          lineEl,
          {
            attr: { stroke: greyStroke500 },
            duration: WIPE_LENGTH,
            ease: "none",
          },
          WIPE_START,
        );
      });

      // "Data" pulse: a second blue overlay per connector, same endpoints,
      // using PULSE_DASH_ARRAY (blocks of PULSE_GROUP dashes on/off) so it
      // reads as alternating groups of dashes lit up rather than a solid
      // block. Runs on its own real-time (non-scrubbed) repeating
      // timeline, independent of the scrubbed `tl` above — a scroll-driven
      // tween can't loop on its own. Direction always flows toward
      // Insights: decreasing dashoffset marches the pattern from x1,y1 →
      // x2,y2 (the connector's own drawn direction), so reversePulse
      // connectors (the two row connectors, drawn All Assets → Overview/
      // Profiles) get the opposite sign.
      const pulseTl = gsap.timeline({ repeat: -1, paused: true });
      connectorSpecs.forEach((spec, i) => {
        const pulseEl = pulseRefs.current[i];
        if (!pulseEl) return;
        const { start, target } = spec;
        pulseEl.setAttribute("x1", String(start.x));
        pulseEl.setAttribute("y1", String(start.y));
        pulseEl.setAttribute("x2", String(target.x));
        pulseEl.setAttribute("y2", String(target.y));
        gsap.set(pulseEl, {
          opacity: 0,
          attr: {
            stroke: blueAccent,
            "stroke-dasharray": PULSE_DASH_ARRAY,
            "stroke-dashoffset": 0,
          },
        });
        const direction = spec.reversePulse ? 1 : -1;
        pulseTl.fromTo(
          pulseEl,
          { attr: { "stroke-dashoffset": 0 } },
          {
            attr: { "stroke-dashoffset": direction * PULSE_PERIOD },
            duration: PULSE_DURATION,
            ease: "none",
          },
          0,
        );
      });

      // The pulse only plays while pinned AND past the wipe (the fill has
      // to actually be "done" for a data-pulse to make sense) — a second,
      // independent ScrollTrigger sharing the same trigger/pin timing,
      // scoped to just that trailing window of the pin.
      ScrollTrigger.create({
        trigger: sectionEl,
        start: `top top+=${navHeightPx + WIPE_END}`,
        end: `top top+=${navHeightPx + TOTAL_RUNWAY}`,
        onEnter: () => {
          gsap.set(pulseRefs.current, { opacity: 1 });
          pulseTl.play(0);
        },
        onEnterBack: () => {
          gsap.set(pulseRefs.current, { opacity: 1 });
          pulseTl.play(0);
        },
        onLeave: () => {
          pulseTl.pause(0);
          gsap.set(pulseRefs.current, { opacity: 0 });
        },
        onLeaveBack: () => {
          pulseTl.pause(0);
          gsap.set(pulseRefs.current, { opacity: 0 });
        },
      });

      // ── Beat 5: wipe + content swap ──────────────────────────────────
      // All 4 shapes together, after HOLD_AFTER_CONNECTORS. Each shape's
      // clip rect grows from 0 to its full bounding-box height (revealing
      // the blue-500 fill top-to-bottom). The label+body content
      // crossfades at the midpoint of that same window — old (grey) fades
      // out, text + color swap to the new (dark, grey-900) content, then
      // fades back in — approximating "covered by the wipe, new content
      // appears on top of it" without needing pixel-exact paint-order sync
      // between the SVG wipe and the DOM text layers.
      ALL_SHAPES.forEach((def) => {
        const fillR = finalPos[def.id].r - FILL_INSET;
        tl.to(
          wipeClipRectRefs.current[def.id],
          { attr: { height: 2 * fillR }, duration: WIPE_LENGTH, ease: "none" },
          WIPE_START,
        );
        tl.to(
          shapeElRefs.current[def.id],
          {
            attr: { stroke: greyStroke500 },
            duration: WIPE_LENGTH,
            ease: "none",
          },
          WIPE_START,
        );

        const innerEl = contentInnerRefs.current[def.id]!;
        const labelSpanEl = labelSpanRefs.current[def.id]!;
        const bodyEl = bodyRefs.current[def.id]!;
        const wrapEl = labelWrapRefs.current[def.id]!;
        const halfWipe = WIPE_LENGTH / 2;
        tl.to(
          innerEl,
          { opacity: 0, duration: halfWipe, ease: "none" },
          WIPE_START,
        );
        // GSAP's tl.call() fires the same callback for both onComplete and
        // onReverseComplete (a delayed call has no motion to reverse), so a
        // single unconditional assignment here would re-apply the "new"
        // state on scroll-up too. Branch on the timeline's own scroll
        // direction so scrubbing back past this point restores the
        // pre-wipe label/body/color instead of leaving them stuck.
        tl.call(
          () => {
            const scrollingForward = (tl.scrollTrigger?.direction ?? 1) === 1;
            if (scrollingForward) {
              labelSpanEl.textContent = def.newLabel;
              bodyEl.textContent = def.newBody;
              wrapEl.classList.add(styles.revealed);
            } else {
              labelSpanEl.textContent = def.label;
              bodyEl.textContent = def.body;
              wrapEl.classList.remove(styles.revealed);
            }
          },
          undefined,
          WIPE_START + halfWipe,
        );
        tl.to(
          innerEl,
          { opacity: 1, duration: halfWipe, ease: "none" },
          WIPE_START + halfWipe,
        );
      });

      // ── Beat 6: trailing hold ────────────────────────────────────────
      // An empty tween so the timeline's duration reaches exactly
      // TOTAL_RUNWAY — otherwise trailing empty time isn't counted in the
      // duration, and the scrub would stretch the wipe to the very end
      // instead of leaving HOLD_AFTER_WIPE of held, fully-revealed state.
      tl.to({}, { duration: HOLD_AFTER_WIPE }, WIPE_END);
    });

    return () => {
      ctx.revert();
      sceneEl.style.height = "";
    };
  }, []);

  return (
    <div
      ref={sceneRef}
      className={`${styles.scene}${className ? ` ${className}` : ""}`}
    >
      <div ref={contentRef} className={styles.content}>
        <h2 ref={headingRef} className={styles.heading}>
          The Framework.
        </h2>
        <svg ref={svgRef} className={styles.svgLayer} aria-hidden="true">
          <defs>
            {ALL_SHAPES.map((def) => (
              <clipPath key={def.id} id={`wipeClip-${def.id}`}>
                <rect
                  ref={(el) => {
                    wipeClipRectRefs.current[def.id] = el;
                  }}
                />
              </clipPath>
            ))}
          </defs>
          {/* Connectors render first so they paint BEHIND the shapes'
              strokes (SVG paints in document order) — otherwise a
              connector's straight end would visibly cut across a shape's
              dashed outline instead of appearing to originate from it. */}
          {Array.from({ length: CONNECTOR_COUNT }, (_, i) => (
            <line
              key={i}
              className={styles.connector}
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={DASH_ARRAY}
              strokeLinecap="round"
              ref={(el) => {
                connectorRefs.current[i] = el;
              }}
            />
          ))}
          {/* Blue "data pulse" overlay, same geometry as the base
              connectors above (set in JS) — painted on top of them, still
              behind the shapes. Hidden (opacity 0) until the wipe
              finishes. */}
          {Array.from({ length: CONNECTOR_COUNT }, (_, i) => (
            <line
              key={i}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              ref={(el) => {
                pulseRefs.current[i] = el;
              }}
            />
          ))}
          {ALL_SHAPES.map((def) => {
            const commonProps = {
              key: def.id,
              className: styles.shape,
              strokeWidth: STROKE_WIDTH,
              strokeDasharray: DASH_ARRAY,
              strokeLinecap: "round" as const,
              ref: (el: SVGCircleElement | SVGPolygonElement | null) => {
                shapeElRefs.current[def.id] = el;
              },
            };
            return def.kind === "circle" ? (
              <circle {...commonProps} />
            ) : (
              <polygon {...commonProps} />
            );
          })}
          {ALL_SHAPES.map((def) => {
            const fillProps = {
              key: def.id,
              fill: "var(--accent-primary)",
              clipPath: `url(#wipeClip-${def.id})`,
              ref: (el: SVGCircleElement | SVGPolygonElement | null) => {
                wipeFillRefs.current[def.id] = el;
              },
            };
            return def.kind === "circle" ? (
              <circle {...fillProps} />
            ) : (
              <polygon {...fillProps} />
            );
          })}
        </svg>
        {ALL_SHAPES.map((def) => (
          <div
            key={def.id}
            ref={(el) => {
              labelWrapRefs.current[def.id] = el;
            }}
            className={styles.shapeLabelWrap}
          >
            <div
              ref={(el) => {
                contentInnerRefs.current[def.id] = el;
              }}
              className={styles.shapeContent}
            >
              <Label
                size="sm"
                ref={(el) => {
                  labelSpanRefs.current[def.id] = el;
                }}
              >
                {def.label}
              </Label>
              <p
                ref={(el) => {
                  bodyRefs.current[def.id] = el;
                }}
                className={styles.body}
              >
                {def.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
