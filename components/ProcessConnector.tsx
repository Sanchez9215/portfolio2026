"use client";

// Shared connector primitive for process/framework diagrams (PLAN.md's
// "Process Diagram / Connector System") — explicitly NOT for system maps
// (CmdbSystemMap/SoftwareSystemMap), which are a separate, organic
// hub-and-spoke category and stay untouched by this.
//
// Every path here is computed real geometry between two measured anchor
// points — never a fixed-aspect SVG asset stretched to fit. A corner's
// curve radius is always drawn at its real `radius` value regardless of
// the distance between anchors, so it never reads as squished/stretched
// whether two cards are close together or far apart.
//
// This is a pure path-drawing primitive — it renders one <path>, not its
// own <defs>/<marker>. A diagram defines ONE shared arrowhead marker in its
// own <defs> (same one-marker-per-diagram convention CmdbSunburst/
// CmdbSystemMap already use) and passes its id via `arrowId`.

export interface ProcessConnectorPoint {
  x: number;
  y: number;
}

export interface ProcessConnectorProps {
  /** Real measured anchor points (e.g. a card's top/bottom-center edge),
   *  in the parent <svg>'s local coordinate space. */
  from: ProcessConnectorPoint;
  to: ProcessConnectorPoint;
  /** "straight" = a single direct line between the two anchors — used for
   *  the center branch (vertical) and any plain fan-out/grouping connector
   *  (naturally diagonal when the anchors aren't x-aligned, no corner
   *  needed). "elbow" = a rounded hard-angle "Z" (vertical → horizontal →
   *  vertical, corners rounded) — reserved for branch/dependency
   *  connections specifically, matching Branch Top.svg's real curved
   *  look. "halfCircle" = a true semicircular arc between `from` and `to`
   *  (must share the same x — a vertical diameter), bulging to `bulge`'s
   *  side — a loop-back connector (e.g. a failure path returning to an
   *  earlier step). Default "straight". */
  shape?: "straight" | "elbow" | "halfCircle";
  /** shape="halfCircle" only: which side the arc bulges toward. */
  bulge?: "left" | "right";
  /** Corner curve radius, px — only relevant for shape="elbow". Default 32
   *  (PLAN.md default; pass a different value per-diagram rather than
   *  editing this default). */
  radius?: number;
  /** How far the drawn line recedes from each real anchor point, px.
   *  Default 8 (matches --spacing-sm). */
  gap?: number;
  /** Stroke color — a CSS color or var(). Default var(--color-grey-500),
   *  PLAN.md's confirmed default (pain-point/problem diagrams use
   *  var(--accent-warning) instead). */
  color?: string;
  strokeWidth?: number;
  /** Dashed stroke ("4 4" — the dash pattern already used repeatedly
   *  elsewhere in this codebase: CmdbSystemMap, SoftwareSystemMap,
   *  ContentHub, InsightGoalRow) instead of solid. Default false. */
  dashed?: boolean;
  /** id of a <marker> already defined in the diagram's own <defs>. Only
   *  set this for a process (order matters) or dependency/relationship
   *  (direction matters) connector — omit for a plain connection, per
   *  PLAN.md's arrowhead rule. */
  arrowId?: string;
  className?: string;
}

const DEFAULT_RADIUS = 32;
const DEFAULT_GAP = 8;
const DEFAULT_STROKE_WIDTH = 1;

// Recede `from` toward `toward` by `gap` px along their straight line — same
// convention as CmdbSunburst's relationship-connector `shorten()`.
function recede(
  from: ProcessConnectorPoint,
  toward: ProcessConnectorPoint,
  gap: number,
): ProcessConnectorPoint {
  const dx = toward.x - from.x;
  const dy = toward.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: from.x + (dx / len) * gap, y: from.y + (dy / len) * gap };
}

// shape="straight": a single direct line, whatever angle the real anchors
// naturally produce — no corner logic at all.
//
// shape="elbow": a HARD right-angle "Z" (vertical → horizontal → vertical,
// meeting at the real horizontal midpoint between `from` and `to`), then
// each of the two sharp corners is replaced with a short quadratic curve
// sized to `radius` — the same idea as a CSS border-radius, just expressed
// as an SVG path command instead of a property. This avoids any diagonal/
// sign-quadrant math (two earlier attempts here both had real bugs from
// that) — a hard-angle elbow is trivial to compute correctly, and `radius`
// only ever needs to round the two corners, not describe the whole path's
// shape. Needs `radius` of real vertical clearance on each side of the
// midpoint PLUS a visible straight lead-in/lead-out before each corner —
// if the caller only reserves exactly `radius*2`, the rounding consumes
// 100% of the available room and the line looks like it immediately
// angles away from its source instead of dropping straight down first.
// shape="halfCircle": a true semicircular arc on the vertical diameter
// between `from` and `to` (equal x). The elliptical-arc sweep-flag that
// produces a right vs. left bulge flips depending on which endpoint is
// lower on screen — derived directly from the SVG arc parametrization
// (center at the midpoint, radius = half the vertical span) rather than a
// memorized rule, since that's easy to get backwards and hard to debug
// from the resulting path string alone.
function buildHalfCirclePath(
  from: ProcessConnectorPoint,
  to: ProcessConnectorPoint,
  bulge: "left" | "right",
): string {
  const radius = Math.abs(to.y - from.y) / 2;
  const fromIsLower = from.y > to.y;
  const sweepFlag = (bulge === "right") === fromIsLower ? 0 : 1;
  return `M${from.x},${from.y} A${radius},${radius} 0 0 ${sweepFlag} ${to.x},${to.y}`;
}

function buildPath(
  from: ProcessConnectorPoint,
  to: ProcessConnectorPoint,
  shape: "straight" | "elbow" | "halfCircle",
  radius: number,
  bulge: "left" | "right",
): string {
  if (shape === "halfCircle") {
    return buildHalfCirclePath(from, to, bulge);
  }

  if (shape === "straight" || from.x === to.x) {
    return `M${from.x},${from.y} L${to.x},${to.y}`;
  }

  const midY = (from.y + to.y) / 2;
  const corner1 = { x: from.x, y: midY };
  const corner2 = { x: to.x, y: midY };

  // Clamp the rounding radius so it never overshoots a segment — the
  // horizontal run is shared by both corners, so each gets at most half.
  const seg1 = Math.abs(corner1.y - from.y);
  const seg2 = Math.abs(corner2.x - corner1.x);
  const seg3 = Math.abs(to.y - corner2.y);
  const r = Math.min(radius, seg1, seg2 / 2, seg3);

  const dirY1 = Math.sign(corner1.y - from.y) || 1;
  const dirX = Math.sign(corner2.x - corner1.x) || 1;
  const dirY2 = Math.sign(to.y - corner2.y) || 1;

  const beforeCorner1 = { x: corner1.x, y: corner1.y - dirY1 * r };
  const afterCorner1 = { x: corner1.x + dirX * r, y: corner1.y };
  const beforeCorner2 = { x: corner2.x - dirX * r, y: corner2.y };
  const afterCorner2 = { x: corner2.x, y: corner2.y + dirY2 * r };

  return [
    `M${from.x},${from.y}`,
    `L${beforeCorner1.x},${beforeCorner1.y}`,
    `Q${corner1.x},${corner1.y} ${afterCorner1.x},${afterCorner1.y}`,
    `L${beforeCorner2.x},${beforeCorner2.y}`,
    `Q${corner2.x},${corner2.y} ${afterCorner2.x},${afterCorner2.y}`,
    `L${to.x},${to.y}`,
  ].join(" ");
}

export default function ProcessConnector({
  from,
  to,
  shape = "straight",
  radius = DEFAULT_RADIUS,
  gap = DEFAULT_GAP,
  color = "var(--color-grey-500)",
  strokeWidth = DEFAULT_STROKE_WIDTH,
  arrowId,
  bulge = "right",
  dashed = false,
  className,
}: ProcessConnectorProps) {
  const start = recede(from, to, gap);
  const end = recede(to, from, gap);
  const d = buildPath(start, end, shape, radius, bulge);

  return (
    <path
      className={className}
      d={d}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeDasharray={dashed ? "4 4" : undefined}
      fill="none"
      markerEnd={arrowId ? `url(#${arrowId})` : undefined}
    />
  );
}
