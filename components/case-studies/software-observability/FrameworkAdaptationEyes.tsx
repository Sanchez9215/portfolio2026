"use client";

// First pass (not yet visually confirmed) — "eyes" reusing ObservabilityEyes'
// own Almond shape, but everything besides the shape itself is new for this
// section: outline instead of solid fill, a hub-and-spoke layout (one big
// center "hub" eye, 2 satellites + 1 scatter eye as its children, each
// connected to the hub), plus 5 small "leaf" eyes each hanging off one
// randomly-chosen child — connected by straight lines in the same style as
// SoftwareSystemMap's hub connectors. Sizes, rotations, and positions below
// are first-pass placeholders — tune directly, or drag the scatter eyes/
// leaves live and read the logged positions back (see useDragPlacementLogger).

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, Ref } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { Almond } from "./ObservabilityEyes";
import {
  useDragPlacementLogger,
  type PlacementPoint,
} from "../../../hooks/useDragPlacementLogger";
import {
  EYES_HUB_UPDATED,
  FAN_DROP_LINE_UPDATED,
} from "./frameworkAdaptationSync";
import Label from "../../Label";
import labelBlockStyles from "../../LabelBlock.module.css";
import styles from "./FrameworkAdaptationEyes.module.css";

interface Point {
  x: number;
  y: number;
}

type ScatterKey = "scatter-0";
type ChildKey = "satelliteA" | "satelliteB" | "bigEye" | ScatterKey;
type LeafKey = string;

const CHILD_KEYS: ChildKey[] = [
  "satelliteA",
  "satelliteB",
  "bigEye",
  "scatter-0",
];

// Confirmed load placement — the last logged position per key from a manual
// drag-tuning pass (see useDragPlacementLogger), seeded as the INITIAL
// position rather than a hardcoded final layout, so every eye still drags
// and re-logs from here like before.
const CHILD_INITIAL_POSITIONS: Record<ChildKey, PlacementPoint> = {
  satelliteA: { x: -134.24609375, y: -216.91015625 },
  satelliteB: { x: 596.52734375, y: 1.90625 },
  bigEye: { x: -463.16015625, y: 872.33203125 },
  "scatter-0": { x: 468.5, y: 686.859375 },
};
const LEAF_INITIAL_POSITIONS: Partial<Record<LeafKey, PlacementPoint>> = {};
// satelliteA/B's confirmed rotation lives only in CSS (rotate(-8deg)/
// rotate(14deg)) — since they're seeded as already-placed above (not
// actually dragged this load), getRotationDeg never runs for them unless
// dragged again, so seed dragRotations with those same CSS values up front.
const CHILD_INITIAL_ROTATIONS: Partial<Record<ChildKey, number>> = {
  satelliteA: -8,
  satelliteB: 14,
  bigEye: 0,
};

// Arbitrary starting spots (% of wrap), clear of the hub/satelliteA/B —
// scratch placeholders only, meant to be dragged into their real positions
// (drag logs the result to the console; see useDragPlacementLogger).
const SCATTER_START: { key: ScatterKey; left: number; top: number }[] = [
  { key: "scatter-0", left: 35, top: 6 },
];

// Random once per mount: rotation matches satelliteA/B's own range
// (-8deg to +14deg), and width is clamped between a ~64px-tall floor and
// the satellites' own 28% width so no scatter eye reads bigger than the
// smallest eyes already on screen (confirmed ranges — not re-randomized
// on re-render).
function randomScatterStyle() {
  const rotation = -8 + Math.random() * 22;
  const widthPct = 10 + Math.random() * 16;
  return {
    transform: `translate(-50%, -50%) rotate(${rotation.toFixed(2)}deg)`,
    width: `clamp(155px, ${widthPct.toFixed(2)}%, 28%)`,
  };
}

interface LeafConfig {
  key: LeafKey;
  parent: ChildKey;
  angle: number;
  distance: number;
  widthPx: number;
  rotation: number;
}

// Explicit, no longer randomized — each entry below is a confirmed leaf:
// its parent (one of CHILD_KEYS), angle (radians) + distance (px, off the
// parent's edge), size (widthPx), and rotation (deg). Randomizing this on
// every mount meant the connection (which parent each leaf hangs off)
// changed on every reload — add leaves here one at a time with concrete,
// confirmed values instead.
const LEAF_CONFIGS: LeafConfig[] = [];

const EYE_STROKE = "var(--color-grey-500)";
const CONNECTOR_STROKE = "var(--color-grey-500)";
const EYE_DASH = undefined;
// Extra clearance past a child's pupil edge before its connector line
// starts — same CONNECTOR_GAP convention as SoftwareSystemMap.
const CONNECTOR_GAP = 8;
// Pupil is 38% of its own eye's width (see .pupil in the CSS module) — used
// to derive a leaf's own pupil radius directly from its known width,
// without needing to measure its DOM rect.
const PUPIL_RATIO = 0.3;

// Flat-top-cone beam, shooting from bigEye's pupil (confirmed values):
// top circle radius = 75% of the pupil's own radius, base circle radius =
// 3x the top radius at rest, base center = BEAM_ANGLE (down-right) from the
// top center at BEAM_DISTANCE_RATIO x bigEye's own real width — this is the
// RESTING position; while the pointer is within the section, the base
// instead eases toward the cursor (see the mouse-tracking effect below),
// stretching the cone while keeping this same taper angle (computeBeam()).
const BEAM_ANGLE = Math.PI / 4;
const BEAM_TOP_RATIO = 0.75;
const BEAM_DISTANCE_RATIO = 1.8;
const BEAM_BASE_RATIO = 3;

// Same circle-edge-point math as SoftwareSystemMap's circleEdge — the point
// on a circle (cx,cy,r) along the line toward (tx,ty).
function circleEdge(
  cx: number,
  cy: number,
  r: number,
  tx: number,
  ty: number,
): Point {
  const dx = tx - cx;
  const dy = ty - cy;
  const dist = Math.hypot(dx, dy) || 1;
  return { x: cx + (dx / dist) * r, y: cy + (dy / dist) * r };
}

// Reads an element's current rotation straight from its computed transform
// matrix(a, b, ...) — rotation = atan2(b, a) — rather than duplicating a
// rotation value that already lives in CSS.
function getRotationDeg(el: Element): number {
  const transform = getComputedStyle(el).transform;
  const match = transform.match(/^matrix\(([^,]+),\s*([^,]+),/);
  if (!match) return 0;
  const a = parseFloat(match[1]);
  const b = parseFloat(match[2]);
  return (Math.atan2(b, a) * 180) / Math.PI;
}

// Flat-top-cone silhouette = the classic "belt around two pulleys" external-
// tangent construction between a small circle (the cone's flat top) and a
// large circle (its base): two tangent lines plus one arc per circle (each
// circle's own far-side cap, away from the other). Replaces the earlier
// lightbeam.svg teardrop asset with an exact, accurate frustum instead of
// an approximation.
function frustumPath(
  c1: Point,
  r1: number,
  c2: Point,
  r2: number,
): string {
  const dx = c2.x - c1.x;
  const dy = c2.y - c1.y;
  const d = Math.hypot(dx, dy) || 1;
  const theta = Math.atan2(dy, dx);
  const alpha = Math.asin(Math.max(-1, Math.min(1, (r2 - r1) / d)));
  const t1 = theta + Math.PI / 2 + alpha;
  const t2 = theta - Math.PI / 2 - alpha;

  const p1a = { x: c1.x + r1 * Math.cos(t1), y: c1.y + r1 * Math.sin(t1) };
  const p2a = { x: c2.x + r2 * Math.cos(t1), y: c2.y + r2 * Math.sin(t1) };
  const p1b = { x: c1.x + r1 * Math.cos(t2), y: c1.y + r1 * Math.sin(t2) };
  const p2b = { x: c2.x + r2 * Math.cos(t2), y: c2.y + r2 * Math.sin(t2) };

  // sweep-flag=0 on both arcs — each must trace its OWN circle (c1/c2),
  // not the mirrored circle sweep=1 would resolve to for these endpoints,
  // which is what made the base circle not actually line up with the
  // tangent lines.
  return [
    `M ${p1a.x} ${p1a.y}`,
    `L ${p2a.x} ${p2a.y}`,
    `A ${r2} ${r2} 0 1 0 ${p2b.x} ${p2b.y}`,
    `L ${p1b.x} ${p1b.y}`,
    `A ${r1} ${r1} 0 0 0 ${p1a.x} ${p1a.y}`,
    "Z",
  ].join(" ");
}

// Full-circle subpath for a clip-path union (CSS clip-path: path() accepts
// the same path-data syntax as SVG d, including multiple M...Z subpaths
// unioned via the default nonzero fill rule).
function circlePathD(cx: number, cy: number, r: number): string {
  return [
    `M ${cx - r} ${cy}`,
    `A ${r} ${r} 0 1 0 ${cx + r} ${cy}`,
    `A ${r} ${r} 0 1 0 ${cx - r} ${cy}`,
    "Z",
  ].join(" ");
}

// Shared by the static measure() pass and the mouse-tracking effect: given
// the real top circle (pupil) and a base CENTER (either the static default
// or the eased mouse-follow position), derives a base RADIUS that keeps the
// same cone angle as the confirmed static proportions (topRadius, 3x base,
// at BEAM_DISTANCE_RATIO x bigEye's width) — so as the beam stretches
// toward the cursor, it flares consistently rather than keeping a fixed
// absolute base size that would look wrong at a different length.
function computeBeam(
  topCenter: Point,
  topRadius: number,
  baseCenter: Point,
  bigEyeWidthPx: number,
) {
  const flareRate =
    ((BEAM_BASE_RATIO - 1) * topRadius) /
    (BEAM_DISTANCE_RATIO * bigEyeWidthPx);
  const distance = Math.hypot(
    baseCenter.x - topCenter.x,
    baseCenter.y - topCenter.y,
  );
  const baseRadius = topRadius + flareRate * distance;
  return {
    path: frustumPath(topCenter, topRadius, baseCenter, baseRadius),
    caps: {
      top: { cx: topCenter.x, cy: topCenter.y, r: topRadius },
      base: { cx: baseCenter.x, cy: baseCenter.y, r: baseRadius },
    },
  };
}

// Pupil is hollow (outline only, matching the Figma reference) — not
// ObservabilityEyes' solid-filled version. Size is a first-pass placeholder.
function EyeShape({
  className,
  pupilRef,
}: {
  className?: string;
  pupilRef?: Ref<HTMLDivElement>;
}) {
  return (
    <div className={className}>
      <Almond
        className={styles.eyeShape}
        fill="var(--surface-base)"
        stroke={EYE_STROKE}
        strokeWidth={1}
        strokeDasharray={EYE_DASH}
      />
      <div className={styles.pupil} ref={pupilRef} />
    </div>
  );
}

export default function FrameworkAdaptationEyes({
  className,
  beamTextOverlayLabel,
  beamTextOverlayBody,
}: {
  className?: string;
  // Content for the black-text mask overlay (see outerWrapEl/textOverlay
  // below) — a clone of the Observability text, colored solid black,
  // clipped to the same shape as the beam, so the beam reads as turning
  // the text black where it passes instead of the diffed/tinted look a
  // plain mix-blend-mode result gives against that text's real color.
  beamTextOverlayLabel?: string;
  beamTextOverlayBody?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  // Every satellite/scatter eye ("child" of the hub) registers itself here —
  // one shared map instead of a named ref per eye, since both their count
  // and their connector-line math are now identical.
  const childRefs = useRef<Partial<Record<ChildKey, HTMLDivElement | null>>>(
    {},
  );
  const childPupilRefs = useRef<
    Partial<Record<ChildKey, HTMLDivElement | null>>
  >({});

  const [childLines, setChildLines] = useState<{ from: Point; to: Point }[]>(
    [],
  );
  const [leafLines, setLeafLines] = useState<{ from: Point; to: Point }[]>([]);
  const [leafBasePositions, setLeafBasePositions] = useState<
    Partial<Record<LeafKey, Point>>
  >({});

  const scatterStyles = useMemo(
    () =>
      Object.fromEntries(
        SCATTER_START.map((s) => [s.key, randomScatterStyle()]),
      ) as Record<ScatterKey, { transform: string; width: string }>,
    [],
  );
  // Covers every non-hub eye (satelliteA/B + the 1 scatter eye) — the hub
  // itself stays fixed (pinned to the fan-drop line / section center below),
  // everything else is draggable.
  const { positions: childPositions, startDrag: startChildDrag } =
    useDragPlacementLogger<ChildKey>(
      wrapRef,
      "children",
      CHILD_INITIAL_POSITIONS,
    );
  const { positions: leafPositions, startDrag: startLeafDrag } =
    useDragPlacementLogger<LeafKey>(wrapRef, "leaf-eyes", LEAF_INITIAL_POSITIONS);
  // satelliteA/B's rotation lives only in CSS (rotate(-8deg)/rotate(14deg))
  // — captured from the real computed style the first time each is
  // dragged, so the drag override can preserve it without duplicating
  // those values here. Seeded with those same CSS values up front since
  // their position above is already seeded (not an actual drag this load).
  const dragRotations = useRef<Partial<Record<ChildKey, number>>>({
    ...CHILD_INITIAL_ROTATIONS,
  });

  function handleChildPointerDown(
    key: ChildKey,
    e: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (dragRotations.current[key] === undefined) {
      const el = childRefs.current[key];
      if (el) dragRotations.current[key] = getRotationDeg(el);
    }
    startChildDrag(key, e);
  }

  // Hub's x is pinned to DataDictionaryScene's fan-drop line (the connector
  // that grows down from the table's bottom fan into this section) — read
  // from that line's own real rendered position, not duplicated/guessed
  // here, via the data-fan-drop-line marker it sets on its <path>. Hub's y
  // is pinned the same way, to the enclosing <section>'s own real vertical
  // center, rather than relying on nested-box CSS centering (wrap centered
  // in section, hub centered in wrap).
  const [hubLeftPx, setHubLeftPx] = useState<number | null>(null);
  const [hubTopPx, setHubTopPx] = useState<number | null>(null);
  const hubLeftPxRef = useRef<number | null>(null);
  const hubTopPxRef = useRef<number | null>(null);

  // Portal target for the beam layer — a div's background/clip-path can't
  // paint past its own box the way an <svg overflow="visible"> could, so
  // the beam can't live inside this component's own (eyes-row-sized) .wrap
  // if it needs to reach down into the Observability row. Portaled into
  // [data-framework-observability-wrap] (page.tsx) instead, which spans
  // both rows, and all beam geometry below is measured relative to IT, not
  // this component's own wrapRef.
  const [outerWrapEl, setOuterWrapEl] = useState<HTMLElement | null>(null);
  const outerWrapElRef = useRef<HTMLElement | null>(null);

  // Real position/size of the Observability text block (data-observability-
  // text-block, page.tsx), relative to the outer wrap — used to lay the
  // black-text mask overlay exactly on top of the real text.
  const [textOverlayRect, setTextOverlayRect] = useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);

  const [beamPath, setBeamPath] = useState<string | null>(null);
  // Top/base caps rendered as their own full circles (not just whatever
  // partial arc happens to fall out of the tangent path) so both ends read
  // as clean filled yellow circles.
  const [beamCaps, setBeamCaps] = useState<{
    top: { cx: number; cy: number; r: number };
    base: { cx: number; cy: number; r: number };
  } | null>(null);
  // Real current geometry, refreshed by the measure() pass below — read by
  // the mouse-tracking effect so it doesn't duplicate measuring bigEye's
  // pupil/width itself.
  const beamGeometryRef = useRef<{
    topCenter: Point;
    topRadius: number;
    bigEyeWidthPx: number;
    staticBaseCenter: Point;
  } | null>(null);
  // True once the pointer has entered the section at least once — while
  // true, the measure() pass above leaves beamPath/beamCaps alone (the
  // mouse-tracking effect owns them instead), so a resize mid-hover doesn't
  // fight the eased tween by snapping back to the static default.
  const beamTrackingActiveRef = useRef(false);
  // The eased (GSAP-tweened) base position the beam currently follows —
  // a plain object (not a DOM element) tweened via onUpdate, since what's
  // being animated is derived SVG path geometry, not a literal CSS property.
  const smoothedBaseRef = useRef<Point | null>(null);

  useLayoutEffect(() => {
    function measure() {
      const wrapEl = wrapRef.current;
      const hubEl = hubRef.current;
      if (!wrapEl || !hubEl) return;

      const wrapRect = wrapEl.getBoundingClientRect();
      const centerOf = (el: HTMLDivElement) => {
        const r = el.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - wrapRect.left,
          y: r.top + r.height / 2 - wrapRect.top,
        };
      };
      const radiusOf = (el: HTMLDivElement | null | undefined) =>
        el ? el.getBoundingClientRect().width / 2 : 0;

      const outerEl = document.querySelector<HTMLElement>(
        "[data-framework-observability-wrap]",
      );
      if (outerEl && outerWrapElRef.current !== outerEl) {
        outerWrapElRef.current = outerEl;
        setOuterWrapEl(outerEl);
      }
      const outerRect = outerEl?.getBoundingClientRect();
      const outerCenterOf = (el: HTMLDivElement) => {
        const r = el.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - (outerRect?.left ?? 0),
          y: r.top + r.height / 2 - (outerRect?.top ?? 0),
        };
      };

      // Real box of the Observability text (display:contents marker, so
      // its firstElementChild is the actual LabelBlock with the real box)
      // — relative to the outer wrap, same space as the beam/clip-path.
      const textBlockMarker = document.querySelector(
        "[data-observability-text-block]",
      );
      const textBlockEl = textBlockMarker?.firstElementChild;
      if (textBlockEl && outerRect) {
        const r = textBlockEl.getBoundingClientRect();
        const next = {
          left: r.left - outerRect.left,
          top: r.top - outerRect.top,
          width: r.width,
        };
        setTextOverlayRect((prev) =>
          prev &&
          prev.left === next.left &&
          prev.top === next.top &&
          prev.width === next.width
            ? prev
            : next,
        );
      }

      const dropLineEl = document.querySelector("[data-fan-drop-line]");
      const hub = centerOf(hubEl);
      if (dropLineEl) {
        const r = dropLineEl.getBoundingClientRect();
        const dropX = r.left + r.width / 2 - wrapRect.left;
        if (hubLeftPxRef.current !== dropX) {
          hubLeftPxRef.current = dropX;
          setHubLeftPx(dropX);
        }
        hub.x = dropX;
      }

      // Hub sits flush with its own section's inner bottom padding edge —
      // its bottom edge lines up with the padding box, not the border box
      // — rather than vertically centered, so it reads as grounded to the
      // bottom rather than floating mid-section. Framework Adaptation is
      // its own independent <section> again (data-eyes-row marks it,
      // page.tsx), so this is just that section's own box.
      const rowEl = wrapEl.closest("[data-eyes-row]");
      if (rowEl) {
        const r = rowEl.getBoundingClientRect();
        const paddingBottom = parseFloat(
          getComputedStyle(rowEl).paddingBottom,
        );
        const hubHeight = hubEl.getBoundingClientRect().height;
        const sectionBottomY =
          r.top + r.height - paddingBottom - wrapRect.top;
        const hubFlushY = sectionBottomY - hubHeight / 2;
        if (hubTopPxRef.current !== hubFlushY) {
          hubTopPxRef.current = hubFlushY;
          setHubTopPx(hubFlushY);
        }
        hub.y = hubFlushY;
      }

      // Each connector starts receded from the child's own pupil edge
      // (+ CONNECTOR_GAP) — but ends straight at the hub's pupil CENTER, no
      // recede on that side. Same mechanism as SoftwareSystemMap.
      const lineToHub = (
        el: HTMLDivElement,
        pupilEl: HTMLDivElement | null | undefined,
      ) => {
        const center = centerOf(el);
        const from = circleEdge(
          center.x,
          center.y,
          radiusOf(pupilEl) + CONNECTOR_GAP,
          hub.x,
          hub.y,
        );
        return { from, to: hub };
      };

      const nextChildLines: { from: Point; to: Point }[] = [];
      const childCenters: Partial<Record<ChildKey, Point>> = {};
      const childPupilRadii: Partial<Record<ChildKey, number>> = {};
      for (const key of CHILD_KEYS) {
        const el = childRefs.current[key];
        if (!el) continue;
        childCenters[key] = centerOf(el);
        childPupilRadii[key] = radiusOf(childPupilRefs.current[key]);
        nextChildLines.push(lineToHub(el, childPupilRefs.current[key]));
      }
      setChildLines(nextChildLines);

      // Flat-top-cone beam: top circle = bigEye's real pupil, STATIC default
      // base circle computed BEAM_DISTANCE_RATIO x bigEye's own real width
      // away, at BEAM_ANGLE (down-right) — this is the resting position the
      // mouse-tracking effect below eases back to on pointer-leave, and
      // what's shown before the pointer ever enters the section. Also
      // stashed in beamGeometryRef so that effect can read the real current
      // topCenter/topRadius/bigEyeWidth and the static default without
      // duplicating this measurement.
      const bigEyeEl = childRefs.current.bigEye;
      const bigEyePupilEl = childPupilRefs.current.bigEye;
      if (bigEyeEl && bigEyePupilEl) {
        // Relative to the OUTER wrap (spans both rows), not this
        // component's own wrapRef — see outerWrapEl above.
        const topCenter = outerCenterOf(bigEyePupilEl);
        const topRadius = radiusOf(bigEyePupilEl) * BEAM_TOP_RATIO;
        const bigEyeWidthPx = bigEyeEl.getBoundingClientRect().width;
        const distance = bigEyeWidthPx * BEAM_DISTANCE_RATIO;
        const staticBaseCenter = {
          x: topCenter.x + Math.cos(BEAM_ANGLE) * distance,
          y: topCenter.y + Math.sin(BEAM_ANGLE) * distance,
        };
        beamGeometryRef.current = {
          topCenter,
          topRadius,
          bigEyeWidthPx,
          staticBaseCenter,
        };
        if (!beamTrackingActiveRef.current) {
          const beam = computeBeam(topCenter, topRadius, staticBaseCenter, bigEyeWidthPx);
          setBeamPath(beam.path);
          setBeamCaps(beam.caps);
        }
      }

      // Leaves: each sits at a fixed (angle, distance) off its own parent's
      // edge — recomputed from the parent's REAL current center/radius, so
      // an un-dragged leaf keeps following its parent if the parent moves
      // (dragged, or the hub-pin shifts it). A leaf's own pupil radius is
      // derived from its known width (PUPIL_RATIO), not measured, since its
      // size is fully set by this component already.
      const nextLeafBase: Partial<Record<LeafKey, Point>> = {};
      const nextLeafLines: { from: Point; to: Point }[] = [];
      for (const cfg of LEAF_CONFIGS) {
        const parentCenter = childCenters[cfg.parent];
        const parentRadius = childPupilRadii[cfg.parent] ?? 0;
        if (!parentCenter) continue;

        const dist = parentRadius + cfg.distance;
        const base = {
          x: parentCenter.x + Math.cos(cfg.angle) * dist,
          y: parentCenter.y + Math.sin(cfg.angle) * dist,
        };
        nextLeafBase[cfg.key] = base;

        const leafCenter = leafPositions[cfg.key] ?? base;
        const leafPupilRadius = (cfg.widthPx * PUPIL_RATIO) / 2;
        const from = circleEdge(
          leafCenter.x,
          leafCenter.y,
          leafPupilRadius + CONNECTOR_GAP,
          parentCenter.x,
          parentCenter.y,
        );
        const to = circleEdge(
          parentCenter.x,
          parentCenter.y,
          parentRadius + CONNECTOR_GAP,
          leafCenter.x,
          leafCenter.y,
        );
        nextLeafLines.push({ from, to });
      }
      setLeafBasePositions(nextLeafBase);
      setLeafLines(nextLeafLines);
    }

    measure();
    // The drop-line's real position (read above via [data-fan-drop-line])
    // is set by DataDictionaryScene's own layout effect, which settles and
    // announces itself via FAN_DROP_LINE_UPDATED — re-measure in response
    // instead of guessing how many frames that takes. document.fonts.ready
    // covers a webfont swap reflowing the text block (and so this section's
    // own height) after first paint.
    window.addEventListener("resize", measure);
    window.addEventListener(FAN_DROP_LINE_UPDATED, measure);
    document.fonts?.ready?.then(measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener(FAN_DROP_LINE_UPDATED, measure);
    };
    // Re-measure whenever a drag moves a child (shifts its leaves and its
    // own line to the hub) or a leaf (shifts just its own line).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childPositions, leafPositions]);

  // Beam mouse-tracking (confirmed): only once the cursor passes below the
  // Framework Adaptation text block's real bottom edge (data-framework-
  // adaptation-text-block, page.tsx) — not a plain section enter/leave
  // (that was the earlier trigger, replaced). Eased via GSAP tweening a
  // plain {x,y} object (onUpdate recomputes the derived path/caps each
  // tick, since there's no literal DOM property to animate); reverts to
  // the static default once the cursor leaves the Observability section
  // (or the outer wrap entirely), same easing.
  useEffect(() => {
    const wrapEl = wrapRef.current;
    // Listens on the OUTER wrap (spans both rows) since the section being
    // checked (Observability) sits below Framework Adaptation — the
    // pointer needs to be trackable across both rows, not just within one.
    const outerEl = outerWrapElRef.current;
    if (!outerEl || !wrapEl) return;

    let isInsideObservability = false;

    function getObservabilityRect(): DOMRect | null {
      const el = document.querySelector("[data-observability-row]");
      return el ? el.getBoundingClientRect() : null;
    }

    // Tweens are created inside event handlers (after this effect's own
    // synchronous setup), so gsap.context() wouldn't auto-track them —
    // tracked and killed directly instead.
    let activeTween: gsap.core.Tween | null = null;

    function renderFromSmoothed() {
      const geo = beamGeometryRef.current;
      const base = smoothedBaseRef.current;
      if (!geo || !base) return;
      const beam = computeBeam(
        geo.topCenter,
        geo.topRadius,
        base,
        geo.bigEyeWidthPx,
      );
      setBeamPath(beam.path);
      setBeamCaps(beam.caps);
    }

    function trackToward(x: number, y: number) {
      const geo = beamGeometryRef.current;
      if (!geo) return;
      beamTrackingActiveRef.current = true;
      if (!smoothedBaseRef.current) {
        smoothedBaseRef.current = { ...geo.staticBaseCenter };
      }
      activeTween?.kill();
      activeTween = gsap.to(smoothedBaseRef.current, {
        x,
        y,
        duration: 0.15,
        ease: "power2.out",
        onUpdate: renderFromSmoothed,
      });
    }

    function revertToStatic() {
      const geo = beamGeometryRef.current;
      if (!geo || !smoothedBaseRef.current) return;
      activeTween?.kill();
      activeTween = gsap.to(smoothedBaseRef.current, {
        x: geo.staticBaseCenter.x,
        y: geo.staticBaseCenter.y,
        duration: 0.3,
        ease: "power2.out",
        onUpdate: renderFromSmoothed,
        onComplete: () => {
          beamTrackingActiveRef.current = false;
        },
      });
    }

    function handlePointerMove(e: PointerEvent) {
      if (!outerEl) return;
      const rect = getObservabilityRect();
      if (!rect) return;
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (inside === isInsideObservability) {
        if (!inside) return;
      } else {
        isInsideObservability = inside;
        if (!inside) {
          revertToStatic();
          return;
        }
      }
      // Relative to the outer wrap (same coordinate space as topCenter/
      // staticBaseCenter above), not this component's own wrapEl.
      const outerRect = outerEl.getBoundingClientRect();
      trackToward(e.clientX - outerRect.left, e.clientY - outerRect.top);
    }

    function handlePointerLeave() {
      if (!isInsideObservability) return;
      isInsideObservability = false;
      revertToStatic();
    }

    outerEl.addEventListener("pointermove", handlePointerMove);
    outerEl.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      outerEl.removeEventListener("pointermove", handlePointerMove);
      outerEl.removeEventListener("pointerleave", handlePointerLeave);
      activeTween?.kill();
    };
  }, []);

  // Announce the hub's settled position only once it's actually committed
  // and painted (plain useEffect runs after paint, unlike the layout effect
  // above) — DataDictionaryScene's drop-line reads this hub's real top edge
  // for its own end-point, so dispatching any earlier would hand it a
  // position that isn't on screen yet.
  useEffect(() => {
    if (hubLeftPx !== null || hubTopPx !== null) {
      window.dispatchEvent(new Event(EYES_HUB_UPDATED));
    }
  }, [hubLeftPx, hubTopPx]);

  // Shared by the diff-yellow beam layer and the black-text mask overlay
  // below — both clip to the exact same frustum+caps region, in the outer
  // wrap's coordinate space.
  const beamClipPath =
    beamPath && beamCaps
      ? `path('${beamPath} ${circlePathD(
          beamCaps.top.cx,
          beamCaps.top.cy,
          beamCaps.top.r,
        )} ${circlePathD(
          beamCaps.base.cx,
          beamCaps.base.cy,
          beamCaps.base.r,
        )}')`
      : null;

  return (
    <div
      className={`${styles.wrap}${className ? ` ${className}` : ""}`}
      ref={wrapRef}
    >
      <svg className={styles.connectors} aria-hidden="true">
        {childLines.map((line, i) => (
          <line
            key={`child-${i}`}
            x1={line.from.x}
            y1={line.from.y}
            x2={line.to.x}
            y2={line.to.y}
            stroke={CONNECTOR_STROKE}
            strokeWidth={1}
            strokeDasharray={EYE_DASH}
          />
        ))}
        {leafLines.map((line, i) => (
          <line
            key={`leaf-${i}`}
            x1={line.from.x}
            y1={line.from.y}
            x2={line.to.x}
            y2={line.to.y}
            stroke={CONNECTOR_STROKE}
            strokeWidth={1}
            strokeDasharray={EYE_DASH}
            opacity={0.5}
          />
        ))}
      </svg>

      {beamClipPath &&
        outerWrapEl &&
        createPortal(
          // Plain HTML div, not <svg> — an <svg> root composites its own
          // contents into an atomic image before the page blends it in, so
          // mix-blend-mode set on anything INSIDE an <svg> only blends
          // against other SVG content in that same document, never against
          // real HTML (the Observability text) behind it. clip-path:
          // path() takes the same path-data syntax, so the frustum + both
          // cap circles are unioned into one clip region on a single
          // blended div. Portaled into the outer wrap (spans both rows,
          // see outerWrapEl above) — not rendered inline here — because a
          // div's background/clip-path can't paint past its own box the
          // way an <svg overflow="visible"> could, and the beam's base
          // reaches down past this component's own (eyes-row-sized) .wrap.
          <div
            className={styles.beamLayer}
            style={{ clipPath: beamClipPath }}
            aria-hidden="true"
          />,
          outerWrapEl,
        )}

      {beamClipPath &&
        outerWrapEl &&
        textOverlayRect &&
        beamTextOverlayLabel &&
        createPortal(
          // Solid-black clone of the Observability text, clipped to the
          // SAME region as the beam above but painted ON TOP of it
          // (z-index, see .textOverlay) — not relying on mix-blend-mode's
          // diff math to produce black, which only happens to work if the
          // overlay color exactly equals the text's real color. Positioned
          // at the real text's measured box (textOverlayRect) so it lines
          // up exactly with the actual (normally-colored) text underneath.
          <div
            className={styles.textOverlay}
            style={{
              left: textOverlayRect.left,
              top: textOverlayRect.top,
              width: textOverlayRect.width,
              clipPath: beamClipPath,
            }}
            aria-hidden="true"
          >
            <div className={`${labelBlockStyles.labelBlock} ${labelBlockStyles.display}`}>
              <Label size="xl" color="default" className={styles.forceBlack}>
                {beamTextOverlayLabel}
              </Label>
              {beamTextOverlayBody && (
                <div className={labelBlockStyles.displayBody}>
                  <p
                    className={`${labelBlockStyles.statement} ${styles.forceBlack}`}
                  >
                    {beamTextOverlayBody}
                  </p>
                </div>
              )}
            </div>
          </div>,
          outerWrapEl,
        )}

      <div
        className={styles.hub}
        ref={hubRef}
        data-eyes-hub="true"
        data-eye="hub"
        style={{
          ...(hubLeftPx !== null ? { left: `${hubLeftPx}px` } : null),
          ...(hubTopPx !== null ? { top: `${hubTopPx}px` } : null),
        }}
      >
        <EyeShape className={styles.eyeInner} />
      </div>

      {(["satelliteA", "satelliteB", "bigEye"] as const).map((key) => {
        const dragged = childPositions[key];
        const style = dragged
          ? {
              left: `${dragged.x}px`,
              top: `${dragged.y}px`,
              transform: `translate(-50%, -50%) rotate(${dragRotations.current[key] ?? 0}deg)`,
            }
          : undefined;
        return (
          <div
            key={key}
            className={styles[key]}
            style={style}
            data-eye={key}
            onPointerDown={(e) => handleChildPointerDown(key, e)}
            ref={(el) => {
              childRefs.current[key] = el;
            }}
          >
            <EyeShape
              className={styles.eyeInner}
              pupilRef={(el) => {
                childPupilRefs.current[key] = el;
              }}
            />
          </div>
        );
      })}

      {SCATTER_START.map((s) => {
        const dragged = childPositions[s.key];
        const style = dragged
          ? {
              ...scatterStyles[s.key],
              left: `${dragged.x}px`,
              top: `${dragged.y}px`,
            }
          : {
              ...scatterStyles[s.key],
              left: `${s.left}%`,
              top: `${s.top}%`,
            };
        return (
          <div
            key={s.key}
            className={styles.scatterEye}
            style={style}
            data-eye={s.key}
            onPointerDown={(e) => handleChildPointerDown(s.key, e)}
            ref={(el) => {
              childRefs.current[s.key] = el;
            }}
          >
            <EyeShape
              className={styles.eyeInner}
              pupilRef={(el) => {
                childPupilRefs.current[s.key] = el;
              }}
            />
          </div>
        );
      })}

      {LEAF_CONFIGS.map((cfg) => {
        const pos = leafPositions[cfg.key] ?? leafBasePositions[cfg.key];
        if (!pos) return null;
        return (
          <div
            key={cfg.key}
            className={styles.leafEye}
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              width: `${cfg.widthPx}px`,
              transform: `translate(-50%, -50%) rotate(${cfg.rotation.toFixed(2)}deg)`,
            }}
            data-eye={cfg.key}
            onPointerDown={(e) => startLeafDrag(cfg.key, e)}
          >
            <EyeShape className={styles.eyeInner} />
          </div>
        );
      })}
    </div>
  );
}
