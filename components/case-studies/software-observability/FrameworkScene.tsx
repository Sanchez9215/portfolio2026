"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Label from "@/components/Label";
import styles from "./FrameworkScene.module.css";

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
 *  1. Overview, All Assets and Profiles start stacked concentric with
 *     Insights at the diagram's center (Figma start state); Insights
 *     settles first (so the inputs never track over it), then the three
 *     inputs unfurl in an overlapping stagger (Overview → All Assets →
 *     Profiles), each fading its label/body in as it lands.
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
 * points), never a transform:scale, so the shared 1px/6-4 dashed stroke
 * never scales with them.
 */

// Dash spec shared by every shape + connector.
const STROKE_WIDTH = 1;
const DASH_ARRAY = "6 4";

// Diagram center-X, in % of the measured diagram width — all 4 shapes
// start here (horizontally), stacked concentric (largest = Insights
// outermost), matching the Figma start state. Start-Y is derived at
// runtime from the settled row's own Y, so the stack sits vertically
// where the row will end up, not an independent guess.
const START_X_PERCENT = 50;

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

// Label anchor padding (px) at the fully top-anchored (stacked/start)
// extreme — matches the Figma start state's per-shape label pt, fading to
// 0 as the label transitions to fully centered (settled) — see anchorY().
const LABEL_TOP_PADDING = 16; // --spacing-md

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
  startSize: number; // px, bounding diameter at the stacked start state
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
    newBody: "A high-level portfolio view across lifecycle stages, surfacing spend, compliance risk, and renewal exposure at a glance.",
    kind: "polygon",
    sides: 7,
    startSize: 350,
    endSize: ROW_END_SIZE,
    endXPercent: 16,
  },
  {
    id: "all-assets",
    label: "All Assets",
    body: "A complete view of every asset owned, letting users segment by region, relationship, financial unit, or operational status.",
    newLabel: "All Software",
    newBody: "A complete, filterable catalog of every title in the organization, letting teams isolate exactly what they need to act on.",
    kind: "circle",
    startSize: 210,
    endSize: ROW_END_SIZE,
    endXPercent: 50,
  },
  {
    id: "profiles",
    label: "Profiles",
    body: "Combines core attributes, entity relationships and lifecycle events from purchased to retired in a single record.",
    newLabel: "Profiles",
    newBody: "A software title record that surfaces licensing posture, utilization health, spend, and compliance standing.",
    kind: "polygon",
    sides: 5,
    startSize: 96,
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
  newBody: "Surfaces portfolio trends to identify optimization opportunities, forecast renewals, and validate license reclamations.",
  kind: "star",
  spikes: 4,
  innerRatio: 0.55,
  startSize: 672,
  endSize: INSIGHTS_END_SIZE,
  endXPercent: 50,
};

const ALL_SHAPES = [INSIGHTS_SHAPE, ...INPUT_SHAPES];

// Beat lengths (scroll px). The timeline's ScrollTrigger end is
// `+=TOTAL_RUNWAY`, and the timeline duration is padded to exactly
// TOTAL_RUNWAY (trailing spacer below), so 1 timeline "second" here equals
// 1px of scroll (same convention as TheProblemPinnedScene's growTl).

// Beat 1 — settle + unfurl.
const INSIGHTS_MOVE_LENGTH = 500; // Insights travels + scales into place
const INSIGHTS_REVEAL_LENGTH = 250; // its label push-up + body fade, right after landing
const INSIGHTS_SETTLE = INSIGHTS_MOVE_LENGTH + INSIGHTS_REVEAL_LENGTH;
// Inputs unfurl overlapping-staggered: shape i starts INPUT_STAGGER after
// shape i-1 starts (not after it lands), so motion stays continuous.
const INPUT_STAGGER = 220;
const INPUT_MOVE_LENGTH = 500;
const INPUT_REVEAL_LENGTH = 250; // each input's own push-up + fade, starts the instant IT lands
const lastInputIndex = INPUT_SHAPES.length - 1;
const SETTLE_END =
  INSIGHTS_SETTLE +
  lastInputIndex * INPUT_STAGGER +
  INPUT_MOVE_LENGTH +
  INPUT_REVEAL_LENGTH;

// Beat 2 — rise (heading exits behind nav, row locks under it).
const RISE_LENGTH = 400;

// Beats 3–6 — connectors, holds, wipe.
const CONNECTOR_DRAW_LENGTH = 400; // all three draw together, once every shape has settled
const HOLD_AFTER_CONNECTORS = 250; // shapes sit untouched once connectors lock in
const WIPE_LENGTH = 250; // all 4 shapes wipe to blue-500 + swap content, simultaneously — a short beat
const HOLD_AFTER_WIPE = 500; // before the pin releases for good

// Absolute timeline offsets.
const RISE_START = SETTLE_END;
const CONNECTOR_START = RISE_START + RISE_LENGTH;
const WIPE_START = CONNECTOR_START + CONNECTOR_DRAW_LENGTH + HOLD_AFTER_CONNECTORS;
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
    pts.push({ x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) });
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
    const diff = Math.abs((((angle - targetAngleDeg + 540) % 360) + 360) % 360 - 180);
    if (diff < best.dist) best = { angle, dist: diff };
  }
  const rad = best.angle * (Math.PI / 180);
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
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
    pts.push({ point: { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }, isOuter });
  }
  return pts;
}

export default function FrameworkScene({ className }: { className?: string }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const shapeElRefs = useRef<Record<string, SVGCircleElement | SVGPolygonElement | null>>({});
  const connectorRefs = useRef<(SVGLineElement | null)[]>([]);
  const wipeFillRefs = useRef<Record<string, SVGCircleElement | SVGPolygonElement | null>>({});
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
    const greyBorder = rootStyle
      .getPropertyValue("--surface-card-border")
      .trim();
    const bodyGap = parseFloat(rootStyle.getPropertyValue("--spacing-sm")) || 8;
    const navHeightPx =
      parseFloat(rootStyle.getPropertyValue("--nav-height")) || 0;

    const ctx = gsap.context(() => {
      const sceneRect = sceneEl.getBoundingClientRect();
      const width = sceneRect.width;
      const headingBottom = headingEl.getBoundingClientRect().bottom - sceneRect.top;
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
      const riseAmount =
        sceneOffsetInSection + rowTopY - ROW_LOCK_TOP_MARGIN;

      // .scene's real height is the FULL diagram (can exceed one
      // viewport) — nothing here is clipped or panned; whatever doesn't
      // fit the pinned window simply becomes visible once the pin releases
      // and normal scroll continues past this (taller) element.
      sceneEl.style.height = `${sceneContentHeight}px`;
      svgEl.setAttribute("viewBox", `0 0 ${width} ${sceneContentHeight}`);

      const startCx = (START_X_PERCENT / 100) * width;
      // The stack starts at the row's own Y (not an independent guess) —
      // so once shapes separate, the row's 3 inputs barely have to move
      // vertically at all, only horizontally + Insights moves down away
      // from them.
      const startY = rowCenterY;

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

      // Natural body heights, measured before collapsing them for the reveal.
      const bodyHeights = bodyEls.map((el) => el!.scrollHeight);

      gsap.set(bodyEls, { height: 0, opacity: 0, marginTop: 0 });

      // A shape's label anchor Y transitions from "near its own top edge"
      // (anchor=1, matching the Figma start state's top-anchored, padded
      // per-shape label box — the reason stacked labels don't overlap:
      // different shape sizes put their top edges at different heights)
      // to "the shape's true center" (anchor=0, matching the settled end
      // state's centered label+body group).
      const anchorY = (cy: number, size: number, anchor: number) =>
        cy - (size / 2) * anchor + LABEL_TOP_PADDING * anchor;

      const shapePoints = (def: ShapeDef, cx: number, cy: number, r: number) => {
        if (def.kind === "circle") return null;
        if (def.kind === "polygon") return pointsToAttr(polygonVertices(cx, cy, r, def.sides!));
        return pointsToAttr(
          starVertices(cx, cy, r, def.innerRatio!, def.spikes!).map((v) => v.point),
        );
      };

      // Renders a shape's geometry + label position at a given
      // center/size/anchor — same function drives both the initial
      // gsap.set and every animation frame.
      const renderShape = (
        def: ShapeDef,
        cx: number,
        cy: number,
        size: number,
        anchor: number,
      ) => {
        const el = shapeElRefs.current[def.id]!;
        const r = size / 2;
        if (def.kind === "circle") {
          el.setAttribute("cx", String(cx));
          el.setAttribute("cy", String(cy));
          el.setAttribute("r", String(r));
        } else {
          el.setAttribute("points", shapePoints(def, cx, cy, r)!);
        }
        const wrap = labelWrapRefs.current[def.id]!;
        wrap.style.left = `${cx}px`;
        wrap.style.top = `${anchorY(cy, size, anchor)}px`;
      };

      // Start state: every shape stacked concentric (at the row's own Y,
      // so the inputs barely travel vertically once separated), its own
      // start size, fully top-anchored labels, blue stroke.
      ALL_SHAPES.forEach((def) => {
        renderShape(def, startCx, startY, def.startSize, 1);
        gsap.set(shapeElRefs.current[def.id], { attr: { stroke: blueAccent } });
      });

      // Wipe fills: a filled (blue-500) twin of each shape's FINAL settled
      // geometry, set once up front (nothing moves them — only their clip
      // rect's height animates, during the wipe beat). Clipped to a rect
      // pinned to the shape's own bounding-box top edge, revealing
      // top-to-bottom as the rect's height grows from 0 to the full box.
      ALL_SHAPES.forEach((def) => {
        const { cx, cy, r } = finalPos[def.id];
        const fillEl = wipeFillRefs.current[def.id]!;
        if (def.kind === "circle") {
          fillEl.setAttribute("cx", String(cx));
          fillEl.setAttribute("cy", String(cy));
          fillEl.setAttribute("r", String(r));
        } else {
          fillEl.setAttribute("points", shapePoints(def, cx, cy, r)!);
        }
        const clipRectEl = wipeClipRectRefs.current[def.id]!;
        clipRectEl.setAttribute("x", String(cx - r));
        clipRectEl.setAttribute("y", String(cy - r));
        clipRectEl.setAttribute("width", String(2 * r));
        clipRectEl.setAttribute("height", "0");
      });

      // The height/viewBox mutation above just reflowed this element —
      // force a synchronous layout read so ScrollTrigger measures the
      // settled result (same pattern as TheProblemPinnedScene).
      void sceneEl.offsetHeight;
      ScrollTrigger.refresh();

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

      // ── Beat 1: settle + unfurl ──────────────────────────────────────

      // Reveals one shape's label push-up + body fade-in at `at` — the body
      // grows from 0 to its measured natural height while the label wrap
      // simultaneously finishes its anchor transition (handled by the move
      // tween), so by the time the body appears the label is already
      // dead-center and rises together with the group centering.
      const revealShape = (index: number, duration: number, at: number) => {
        tl.to(
          bodyEls[index],
          {
            height: bodyHeights[index],
            opacity: 1,
            marginTop: bodyGap,
            duration,
            ease: "none",
          },
          at,
        );
      };

      // Insights moves + scales into its final spot first, then reveals.
      const insightsDef = INSIGHTS_SHAPE;
      const insightsProxy = {
        cx: startCx,
        cy: startY,
        size: insightsDef.startSize,
        anchor: 1,
      };
      tl.to(
        insightsProxy,
        {
          cx: finalPos[insightsDef.id].cx,
          cy: finalPos[insightsDef.id].cy,
          size: insightsDef.endSize,
          anchor: 0,
          duration: INSIGHTS_MOVE_LENGTH,
          ease: "none",
          onUpdate: () =>
            renderShape(
              insightsDef,
              insightsProxy.cx,
              insightsProxy.cy,
              insightsProxy.size,
              insightsProxy.anchor,
            ),
        },
        0,
      );
      tl.to(
        shapeElRefs.current[insightsDef.id],
        { attr: { stroke: greyBorder }, duration: INSIGHTS_MOVE_LENGTH, ease: "none" },
        0,
      );
      revealShape(0, INSIGHTS_REVEAL_LENGTH, INSIGHTS_MOVE_LENGTH);

      // Three inputs unfurl overlapping-staggered, each fading in the
      // instant its own move finishes.
      INPUT_SHAPES.forEach((def, i) => {
        const startAt = INSIGHTS_SETTLE + i * INPUT_STAGGER;
        const proxy = { cx: startCx, cy: startY, size: def.startSize, anchor: 1 };
        tl.to(
          proxy,
          {
            cx: finalPos[def.id].cx,
            cy: finalPos[def.id].cy,
            size: def.endSize,
            anchor: 0,
            duration: INPUT_MOVE_LENGTH,
            ease: "none",
            onUpdate: () =>
              renderShape(def, proxy.cx, proxy.cy, proxy.size, proxy.anchor),
          },
          startAt,
        );
        tl.to(
          shapeElRefs.current[def.id],
          { attr: { stroke: greyBorder }, duration: INPUT_MOVE_LENGTH, ease: "none" },
          startAt,
        );
        revealShape(i + 1, INPUT_REVEAL_LENGTH, startAt + INPUT_MOVE_LENGTH);
      });

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
      // Endpoints are corner-to-corner (not center-to-center): the left
      // input's bottom-right corner to the star's farthest-left point, the
      // right input's bottom-left corner to the star's farthest-right
      // point, and the center input's bottom-center to the star's
      // top-center (longer, given the 128px gap). All derived from each
      // shape's already-known final geometry.
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
      const insightsRightPoint = starOuter.reduce((a, b) => (b.x > a.x ? b : a));
      const insightsTopPoint = starOuter.reduce((a, b) => (b.y < a.y ? b : a));

      const connectorSpecs = [
        {
          def: INPUT_SHAPES[0], // Overview (left) — bottom-right corner → star's farthest-left point.
          corner: (cx: number, cy: number) =>
            nearestPolygonVertex(cx, cy, ROW_END_SIZE / 2, INPUT_SHAPES[0].sides!, 45),
          target: insightsLeftPoint,
        },
        {
          def: INPUT_SHAPES[1], // All Assets (center) — bottom-center → star's top-center.
          corner: (cx: number, cy: number) => ({ x: cx, y: cy + ROW_END_SIZE / 2 }),
          target: insightsTopPoint,
        },
        {
          def: INPUT_SHAPES[2], // Profiles (right) — bottom-left corner → star's farthest-right point.
          corner: (cx: number, cy: number) =>
            nearestPolygonVertex(cx, cy, ROW_END_SIZE / 2, INPUT_SHAPES[2].sides!, 135),
          target: insightsRightPoint,
        },
      ];

      connectorSpecs.forEach((spec, i) => {
        const lineEl = connectorRefs.current[i];
        if (!lineEl) return;
        const cx = finalPos[spec.def.id].cx;
        const start = spec.corner(cx, rowCenterY);
        lineEl.setAttribute("x1", String(start.x));
        lineEl.setAttribute("y1", String(start.y));
        lineEl.setAttribute("x2", String(spec.target.x));
        lineEl.setAttribute("y2", String(spec.target.y));
        const length = Math.hypot(spec.target.x - start.x, spec.target.y - start.y);
        gsap.set(lineEl, {
          attr: { stroke: greyBorder, "stroke-dasharray": length, "stroke-dashoffset": length },
        });
        tl.to(
          lineEl,
          {
            attr: { "stroke-dashoffset": 0 },
            duration: CONNECTOR_DRAW_LENGTH,
            ease: "none",
          },
          CONNECTOR_START,
        );
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
        const { r } = finalPos[def.id];
        tl.to(
          wipeClipRectRefs.current[def.id],
          { attr: { height: 2 * r }, duration: WIPE_LENGTH, ease: "none" },
          WIPE_START,
        );

        const innerEl = contentInnerRefs.current[def.id]!;
        const labelSpanEl = labelSpanRefs.current[def.id]!;
        const bodyEl = bodyRefs.current[def.id]!;
        const wrapEl = labelWrapRefs.current[def.id]!;
        const halfWipe = WIPE_LENGTH / 2;
        tl.to(innerEl, { opacity: 0, duration: halfWipe, ease: "none" }, WIPE_START);
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
        tl.to(innerEl, { opacity: 1, duration: halfWipe, ease: "none" }, WIPE_START + halfWipe);
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
    <div ref={sceneRef} className={`${styles.scene}${className ? ` ${className}` : ""}`}>
      <div ref={contentRef} className={styles.content}>
        <h2 ref={headingRef} className={styles.heading}>The Framework.</h2>
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
          {INPUT_SHAPES.map((_, i) => (
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
