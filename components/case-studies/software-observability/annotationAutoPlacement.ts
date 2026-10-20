// Computed tooltip placement + pointer for AnnotationConnectorHotspot's
// `autoPlace` mode (PLAN.md, "Question-embed tooltip placement + pointer").
// Modeled on the Data Health Monitor pain-point system: a tooltip's position
// is the independent variable (fixed gaps from its card), and the pointer is
// derived to reach the target. Everything is in the overlay's own px space
// (container-relative, tooltip sizes unscaled).
//
// - Every tooltip sits on one of the four sides of its spotlit card, CARD_GAP
//   away from it. It takes the side nearest its target that has room; tooltips
//   on the same side of a card form an aligned row (top/bottom) or column
//   (left/right), TOOLTIP_GAP apart, ordered by target position.
// - Tooltips never overlap a spotlit card or each other.
// - The hairline is the tooltip's top edge and the pointer is a "flag pole":
//   a straight vertical line from the tooltip's top-left or top-right corner
//   to the target's nearest corner. Above/below a card the tooltip is placed
//   so its corner sits exactly on the target's edge x (no lead); where that
//   can't be (packing, side columns) the hairline simply continues out to the
//   target's x first. It always heads away from its own box, so it never
//   crosses it.

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export type Side = "top" | "bottom" | "left" | "right";

export const CARD_GAP = 32;
export const TOOLTIP_GAP = 16;


export interface PlaceInput {
  /** Group key — the spotlit card this tooltip belongs to. */
  cardKey: string;
  card: Rect;
  target: Rect;
  width: number;
  height: number;
  /** Offset of the hairline (the connector's horizontal run) from the box top. */
  lineY: number;
}

export interface Placement {
  side: Side;
  left: number;
  top: number;
  hairlineY: number;
  /** Which top corner the pointer leaves from. */
  corner: "left" | "right";
  /** Pointer polyline from the target's corner back to the tooltip's corner
   *  (target end first, the corner last). */
  path: { x: number; y: number }[];
}

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

const right = (r: Box) => r.left + r.width;
const bottom = (r: Box) => r.top + r.height;

function overlaps(a: Box, b: Box, gap = 0) {
  return (
    a.left < right(b) + gap &&
    right(a) + gap > b.left &&
    a.top < bottom(b) + gap &&
    bottom(a) + gap > b.top
  );
}

// Flag-pole pointer for a placed box: from either top corner, straight along
// the hairline's extension to the target corner's x (zero length when the box
// is flush with it), then straight vertically to the corner. Only targets on
// the outward side of the corner are reachable; the shortest path over both
// corners x the target's four corners wins.
function pickPointer(box: Box, lineY: number, target: Rect) {
  const hairlineY = box.top + lineY;
  const corners = [
    { x: target.left, y: target.top },
    { x: right(target), y: target.top },
    { x: target.left, y: bottom(target) },
    { x: right(target), y: bottom(target) },
  ];
  let best: {
    corner: "left" | "right";
    path: { x: number; y: number }[];
    length: number;
  } | null = null;
  for (const corner of ["left", "right"] as const) {
    const dir = corner === "left" ? -1 : 1;
    const px = corner === "left" ? box.left : right(box);
    for (const q of corners) {
      const dx = (q.x - px) * dir;
      if (dx < -0.5) continue;
      const start = { x: px, y: hairlineY };
      const path =
        dx > 0.5 ? [q, { x: q.x, y: hairlineY }, start] : [q, start];
      const length = Math.max(dx, 0) + Math.abs(q.y - hairlineY);
      if (!best || length < best.length) best = { corner, path, length };
    }
  }
  return best;
}

// Resolves overlaps along one axis: items keep their desired start where they
// can, are pushed apart by TOOLTIP_GAP, and are pulled back inside [min, max].
function pack(
  desired: number[],
  sizes: number[],
  min: number,
  max: number,
): number[] | null {
  const n = desired.length;
  const pos = desired.map((d) => Math.max(d, min));
  for (let i = 1; i < n; i++) {
    pos[i] = Math.max(pos[i], pos[i - 1] + sizes[i - 1] + TOOLTIP_GAP);
  }
  const last = n - 1;
  if (pos[last] + sizes[last] > max) {
    pos[last] = max - sizes[last];
    for (let i = last - 1; i >= 0; i--) {
      pos[i] = Math.min(pos[i], pos[i + 1] - TOOLTIP_GAP - sizes[i]);
    }
  }
  return pos[0] < min - 0.5 ? null : pos;
}

function sidesByDistance(item: PlaceInput): Side[] {
  const { card, target } = item;
  const dist: Record<Side, number> = {
    top: target.top - card.top,
    bottom: bottom(card) - bottom(target),
    left: target.left - card.left,
    right: right(card) - right(target),
  };
  return (Object.keys(dist) as Side[]).sort((a, b) => dist[a] - dist[b]);
}

// Lays out one lane (a card's side) for the given items, or null if it can't
// fit inside `bounds` or no valid pointer exists for some tooltip.
function layoutLane(
  side: Side,
  indices: number[],
  items: PlaceInput[],
  bounds: Box,
): Map<number, Placement> | null {
  const card = items[indices[0]].card;
  const horizontal = side === "top" || side === "bottom";
  const sorted = [...indices].sort((a, b) =>
    horizontal
      ? items[a].target.left + items[a].target.width / 2 -
        (items[b].target.left + items[b].target.width / 2)
      : items[a].target.top - items[b].target.top,
  );

  const desired = sorted.map((i) => {
    const { target, width, lineY } = items[i];
    if (!horizontal) return target.top - lineY;
    const centered = target.left + target.width / 2 - width / 2;
    // Above or below the card the box sits wholly to one side of the target,
    // its top corner exactly on the target's edge x, so the pointer is a
    // straight pole from that corner.
    const toTheLeft = target.left - width;
    const toTheRight = right(target);
    return Math.abs(toTheLeft - centered) <= Math.abs(toTheRight - centered)
      ? toTheLeft
      : toTheRight;
  });
  const sizes = sorted.map((i) => (horizontal ? items[i].width : items[i].height));
  const packed = horizontal
    ? pack(desired, sizes, bounds.left, right(bounds))
    : pack(desired, sizes, bounds.top, bottom(bounds));
  if (!packed) return null;

  const maxHeight = Math.max(...sorted.map((i) => items[i].height));
  const out = new Map<number, Placement>();
  for (let k = 0; k < sorted.length; k++) {
    const i = sorted[k];
    const { width, height, lineY, target } = items[i];
    let left: number;
    let top: number;
    if (side === "top") {
      left = packed[k];
      top = card.top - CARD_GAP - maxHeight;
    } else if (side === "bottom") {
      left = packed[k];
      top = bottom(card) + CARD_GAP - lineY;
    } else if (side === "left") {
      left = card.left - CARD_GAP - width;
      top = packed[k];
    } else {
      left = right(card) + CARD_GAP;
      top = packed[k];
    }
    const box = { left, top, width, height };
    if (
      box.left < bounds.left - 0.5 ||
      right(box) > right(bounds) + 0.5 ||
      box.top < bounds.top - 0.5 ||
      bottom(box) > bottom(bounds) + 0.5
    ) {
      return null;
    }
    const pointer = pickPointer(box, lineY, target);
    if (!pointer) return null;
    out.set(i, {
      side,
      left,
      top,
      hairlineY: top + lineY,
      corner: pointer.corner,
      path: pointer.path,
    });
  }
  return out;
}

const UNBOUNDED: Box = {
  left: -1e6,
  top: -1e6,
  width: 2e6,
  height: 2e6,
};

/**
 * Places every tooltip. `obstacles` are all spotlit card rects (tooltips may
 * overlay any other, dimmed UI but never a lit card). Returns one Placement
 * per input (null when no side works, even with the area limit lifted).
 */
export function placeTooltips(
  items: PlaceInput[],
  obstacles: Rect[],
  bounds: Rect,
): (Placement | null)[] {
  const result: (Placement | null)[] = items.map(() => null);

  const tryPlace = (index: number, area: Box): boolean => {
    for (const side of sidesByDistance(items[index])) {
      const laneKey = `${items[index].cardKey}|${side}`;
      const lane = items
        .map((it, i) => ({ it, i }))
        .filter(
          ({ it, i }) =>
            (i === index || result[i]?.side === side) &&
            `${it.cardKey}|${side}` === laneKey,
        )
        .map(({ i }) => i);
      const laid = layoutLane(side, lane, items, area);
      if (!laid) continue;
      // Collision checks: the lane's boxes against every other card and every
      // tooltip already placed outside this lane.
      let ok = true;
      laid.forEach((p, i) => {
        if (!ok) return;
        const box = {
          left: p.left,
          top: p.top,
          width: items[i].width,
          height: items[i].height,
        };
        if (obstacles.some((o) => overlaps(box, o))) ok = false;
        result.forEach((other, j) => {
          if (!ok || !other || laid.has(j) || j === i) return;
          const ob = {
            left: other.left,
            top: other.top,
            width: items[j].width,
            height: items[j].height,
          };
          if (overlaps(box, ob, TOOLTIP_GAP)) ok = false;
        });
      });
      if (!ok) continue;
      laid.forEach((p, i) => {
        result[i] = p;
      });
      return true;
    }
    return false;
  };

  items.forEach((_, index) => {
    if (!tryPlace(index, bounds)) tryPlace(index, UNBOUNDED);
  });
  return result;
}
