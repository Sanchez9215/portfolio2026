// Shared fan-trapezoid connector shape (PLAN.md's "Process Diagram /
// Connector System") — a horizontal shoulder bar with a diagonal leg (fixed
// LEG_ANGLE_DEG) from each outer edge down/up to the real outermost targets,
// plus a plain vertical stub from the shoulder to every target BETWEEN the
// two outer ones. Works for any target count >= 2, no per-target
// special-casing needed. Originally built (and still used) in
// DataCertificationTriggers.tsx — extracted here so other diagrams (e.g.
// StakeholdersCards) share the exact same implementation instead of each
// re-deriving it.
//
// This is ONLY the branch/fan shape itself — it has no opinion about, and
// builds no segment toward, whatever single point feeds into its shoulder
// from outside. That lead-in/out connector is a separate, self-standing
// segment the caller builds from the returned `shoulderCenter` (see
// `buildFanLeadConnector`), or omitted entirely when nothing connects beyond
// the shoulder (e.g. the shoulder IS the terminal point).

export interface FanPoint {
  x: number;
  y: number;
}

export interface FanSegment {
  from: FanPoint;
  to: FanPoint;
  shape: "straight";
  color: string;
  gap: number;
}

// Confirmed defaults (DataCertificationTriggers.tsx) — every fan in the
// codebase uses these unless a diagram has its own confirmed values.
export const FAN_BRANCH_HEIGHT = 24;
export const FAN_LEG_ANGLE_DEG = 30;
export const FAN_CARD_GAP = 8;

const LEG_ANGLE_RAD = (FAN_LEG_ANGLE_DEG * Math.PI) / 180;
const LEG_TAN = Math.tan(LEG_ANGLE_RAD);
const LEG_SIN = Math.sin(LEG_ANGLE_RAD);
export const FAN_CARD_GAP_ALONG_LINE = FAN_CARD_GAP / LEG_SIN;

// Moves `to` toward `from` by `amount` px, measured ALONG the line — used to
// give a segment a breathing gap at ONE end only (a real card anchor) while
// keeping its other end (a synthetic joint shared with another segment)
// exact, since ProcessConnector's own `gap` recedes both ends symmetrically.
export function insetEnd(from: FanPoint, to: FanPoint, amount: number): FanPoint {
  const dx = from.x - to.x;
  const dy = from.y - to.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: to.x + (dx / len) * amount, y: to.y + (dy / len) * amount };
}

export function buildFanTrapezoid(
  targets: FanPoint[],
  direction: "down" | "up",
  centerX: number,
  height: number,
  color: string | { left: string; right: string },
  cardGap: number = FAN_CARD_GAP,
): { segments: FanSegment[]; shoulderCenter: FanPoint } {
  const cardGapAlongLine =
    cardGap === FAN_CARD_GAP ? FAN_CARD_GAP_ALONG_LINE : cardGap / LEG_SIN;

  const sign = direction === "down" ? 1 : -1;
  const sorted = [...targets].sort((a, b) => a.x - b.x);
  const outerLeft = sorted[0];
  const outerRight = sorted[sorted.length - 1];
  const targetY = outerLeft.y;

  const shoulderY = targetY - sign * height;
  const leftColor = typeof color === "string" ? color : color.left;
  const rightColor = typeof color === "string" ? color : color.right;

  // Diagonal legs always keep the fixed-angle `dx` offset from the outer
  // targets — that's the confirmed shape, never adjusted for target
  // count/spacing. But with more than 2 targets packed closer together than
  // that fixed `dx`, a mid target can sit further left/right than
  // shoulderLeft/shoulderRight themselves, leaving its stub floating outside
  // the drawn bar instead of touching it. The bar's own drawn extent
  // (barLeft/barRight) scales to cover every mid target's x in addition to
  // the two legs' anchors — the legs stay exactly where the fixed angle puts
  // them, only the bar grows.
  const dx = height / LEG_TAN;
  const shoulderLeft = { x: outerLeft.x + dx, y: shoulderY };
  const shoulderRight = { x: outerRight.x - dx, y: shoulderY };
  const shoulderCenter = { x: centerX, y: shoulderY };
  const mids = sorted.slice(1, -1);
  const barLeft = {
    x: Math.min(shoulderLeft.x, ...mids.map((m) => m.x)),
    y: shoulderY,
  };
  const barRight = {
    x: Math.max(shoulderRight.x, ...mids.map((m) => m.x)),
    y: shoulderY,
  };

  const segments: FanSegment[] = [
    { from: barLeft, to: shoulderCenter, shape: "straight", color: leftColor, gap: 0 },
    { from: shoulderCenter, to: barRight, shape: "straight", color: rightColor, gap: 0 },
    {
      from: shoulderLeft,
      to: insetEnd(shoulderLeft, outerLeft, cardGapAlongLine),
      shape: "straight",
      color: leftColor,
      gap: 0,
    },
    {
      from: shoulderRight,
      to: insetEnd(shoulderRight, outerRight, cardGapAlongLine),
      shape: "straight",
      color: rightColor,
      gap: 0,
    },
  ];
  for (const mid of mids) {
    const shoulderAtMid = { x: mid.x, y: shoulderY };
    segments.push({
      from: shoulderAtMid,
      to: insetEnd(shoulderAtMid, mid, cardGap),
      shape: "straight",
      color: mid.x < centerX ? leftColor : rightColor,
      gap: 0,
    });
  }
  return { segments, shoulderCenter };
}

// Self-standing lead-in/out connector between a single real point (e.g. a
// label) and a fan's shoulder — built independently of the fan's own center
// stub so the two never merge into one overlong line just because they
// happen to share an X.
export function buildFanLeadConnector(
  point: FanPoint,
  shoulderCenter: FanPoint,
  color: string,
  cardGap: number = FAN_CARD_GAP,
): FanSegment {
  return {
    from: insetEnd(shoulderCenter, point, cardGap),
    to: shoulderCenter,
    shape: "straight",
    color,
    gap: 0,
  };
}
